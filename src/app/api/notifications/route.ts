import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);
    const userId = session?.userId;

    // Fetch active notifications
    const whereCondition = userId
      ? {
        is_active: true,
        OR: [
          { target_type: 'all' },
          { target_type: 'user', target_user_id: userId },
          ...(session?.role ? [{ target_type: 'role', target_role: session.role }] : []),
        ],
      }
      : {
        is_active: true,
        target_type: 'all',
      };

    const notificationsList = await prisma.notifications.findMany({
      where: whereCondition,
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        user_notification_states: {
          where: userId ? { user_id: userId } : { user_id: '00000000-0000-0000-0000-000000000000' },
          select: { is_read: true, is_cleared: true },
        },
      },
    });

    const items = notificationsList
      .filter((n) => {
        if (!userId) return true;
        const state = n.user_notification_states?.[0];
        return !state?.is_cleared;
      })
      .map((n) => {
        const state = userId ? n.user_notification_states?.[0] : undefined;
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

    return NextResponse.json({
      notifications: items,
      unreadCount: items.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error('[GET /api/notifications] Error:', error);
    // Resilient fallback when DB is cold-starting or temporarily offline
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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body; // 'read_all' | 'clear_all'

    // Get all eligible notifications for user
    const eligibleNotifications = await prisma.notifications.findMany({
      where: {
        is_active: true,
        OR: [
          { target_type: 'all' },
          { target_type: 'user', target_user_id: userId },
          ...(session.role ? [{ target_type: 'role', target_role: session.role }] : []),
        ],
      },
      select: { id: true },
    });

    const now = new Date();

    if (action === 'read_all') {
      for (const n of eligibleNotifications) {
        await prisma.user_notification_states.upsert({
          where: {
            user_id_notification_id: {
              user_id: userId,
              notification_id: n.id,
            },
          },
          update: {
            is_read: true,
            read_at: now,
            updated_at: now,
          },
          create: {
            user_id: userId,
            notification_id: n.id,
            is_read: true,
            read_at: now,
            is_cleared: false,
            created_at: now,
            updated_at: now,
          },
        });
      }

      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (action === 'clear_all') {
      for (const n of eligibleNotifications) {
        await prisma.user_notification_states.upsert({
          where: {
            user_id_notification_id: {
              user_id: userId,
              notification_id: n.id,
            },
          },
          update: {
            is_cleared: true,
            cleared_at: now,
            updated_at: now,
          },
          create: {
            user_id: userId,
            notification_id: n.id,
            is_read: true,
            read_at: now,
            is_cleared: true,
            cleared_at: now,
            created_at: now,
            updated_at: now,
          },
        });
      }

      return NextResponse.json({ success: true, message: 'All notifications cleared' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[PATCH /api/notifications] Error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
