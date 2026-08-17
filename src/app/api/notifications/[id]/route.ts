import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body; // 'read' | 'clear'

    const now = new Date();

    if (action === 'read') {
      await prisma.user_notification_states.upsert({
        where: {
          user_id_notification_id: {
            user_id: userId,
            notification_id: id,
          },
        },
        update: {
          is_read: true,
          read_at: now,
          updated_at: now,
        },
        create: {
          user_id: userId,
          notification_id: id,
          is_read: true,
          read_at: now,
          is_cleared: false,
          created_at: now,
          updated_at: now,
        },
      });

      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    if (action === 'clear') {
      await prisma.user_notification_states.upsert({
        where: {
          user_id_notification_id: {
            user_id: userId,
            notification_id: id,
          },
        },
        update: {
          is_cleared: true,
          cleared_at: now,
          updated_at: now,
        },
        create: {
          user_id: userId,
          notification_id: id,
          is_read: true,
          read_at: now,
          is_cleared: true,
          cleared_at: now,
          created_at: now,
          updated_at: now,
        },
      });

      return NextResponse.json({ success: true, message: 'Notification cleared' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[PATCH /api/notifications/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update notification state' }, { status: 500 });
  }
}
