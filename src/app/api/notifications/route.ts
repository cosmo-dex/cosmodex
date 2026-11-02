import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

function formatRelativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);
    const userId = session?.userId;

    let items;

    if (userId) {
      const whereCondition = {
        is_active: true,
        OR: [
          { target_type: 'all' },
          { target_type: 'user', target_user_id: userId },
          ...(session?.role ? [{ target_type: 'role', target_role: session.role }] : []),
        ],
      };

      const notificationsList = await prisma.notifications.findMany({
        where: whereCondition,
        orderBy: { created_at: 'desc' },
        take: 50,
        include: {
          user_notification_states: {
            where: { user_id: userId },
            select: { is_read: true, is_cleared: true },
          },
        },
      });

      items = notificationsList
        .filter((n) => {
          const state = n.user_notification_states?.[0];
          return !state?.is_cleared;
        })
        .map((n) => {
          const state = n.user_notification_states?.[0];
          return {
            id: n.id,
            title: n.title,
            description: n.description,
            type: n.type ?? 'info',
            link: n.link,
            time: n.created_at ? formatRelativeTime(new Date(n.created_at)) : 'Recently',
            created_at: n.created_at,
            read: Boolean(state?.is_read),
          };
        });
    } else {
      const notificationsList = await prisma.notifications.findMany({
        where: {
          is_active: true,
          target_type: 'all',
        },
        orderBy: { created_at: 'desc' },
        take: 50,
      });

      items = notificationsList.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        type: n.type ?? 'info',
        link: n.link,
        time: n.created_at ? formatRelativeTime(new Date(n.created_at)) : 'Recently',
        created_at: n.created_at,
        read: false,
      }));
    }

    return NextResponse.json(
      {
        notifications: items,
        unreadCount: items.filter((n) => !n.read).length,
      },
      {
        headers: {
          'Cache-Control': userId
            ? 'private, no-cache, no-store, must-revalidate'
            : 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/notifications] Error:', error);
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'mark_all_read') {
      const activeNotifications = await prisma.notifications.findMany({
        where: {
          is_active: true,
          OR: [
            { target_type: 'all' },
            { target_type: 'user', target_user_id: userId },
            ...(session?.role ? [{ target_type: 'role', target_role: session.role }] : []),
          ],
        },
        select: { id: true },
      });

      const now = new Date();
      await prisma.$transaction(
        activeNotifications.map((n) =>
          prisma.user_notification_states.upsert({
            where: {
              user_id_notification_id: {
                user_id: userId,
                notification_id: n.id,
              },
            },
            create: {
              user_id: userId,
              notification_id: n.id,
              is_read: true,
              read_at: now,
            },
            update: {
              is_read: true,
              read_at: now,
            },
          })
        )
      );

      return NextResponse.json({ success: true });
    }

    if (action === 'clear_all') {
      const activeNotifications = await prisma.notifications.findMany({
        where: {
          is_active: true,
          OR: [
            { target_type: 'all' },
            { target_type: 'user', target_user_id: userId },
            ...(session?.role ? [{ target_type: 'role', target_role: session.role }] : []),
          ],
        },
        select: { id: true },
      });

      const now = new Date();
      await prisma.$transaction(
        activeNotifications.map((n) =>
          prisma.user_notification_states.upsert({
            where: {
              user_id_notification_id: {
                user_id: userId,
                notification_id: n.id,
              },
            },
            create: {
              user_id: userId,
              notification_id: n.id,
              is_cleared: true,
              cleared_at: now,
            },
            update: {
              is_cleared: true,
              cleared_at: now,
            },
          })
        )
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[PATCH /api/notifications] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
