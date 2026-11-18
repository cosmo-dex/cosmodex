import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseEventId } from '@/lib/battleEvent';
import { isPrivateEvent } from '@/lib/publicEvents';
import { verifySession } from '@/lib/session';
import { getEventBattleLeaderboard } from '@/lib/battleLeaderboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id).trim();
  const eventId = parseEventId(decodedId);

  if (!eventId) {
    return NextResponse.json({ error: 'Invalid event ID: must be a valid UUID' }, { status: 400 });
  }

  try {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        status: true,
        submission_config: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify private access if configured
    if (isPrivateEvent(event.submission_config)) {
      const unlockToken =
        req.headers.get('x-unlock-token') ||
        req.cookies.get(`event_unlock_${event.id}`)?.value ||
        req.nextUrl.searchParams.get('unlock_token');

      let isUnlocked = false;
      if (unlockToken) {
        const unlockSession = await verifySession(unlockToken);
        if (unlockSession?.userId === `unlocked:${event.id}`) {
          isUnlocked = true;
        }
      }

      if (!isUnlocked) {
        return NextResponse.json(
          { error: 'This event is private. Unlock access required.' },
          { status: 403 }
        );
      }
    }

    const leaderboardData = await getEventBattleLeaderboard(event.id);
    if (!leaderboardData) {
      return NextResponse.json({ error: 'Failed to retrieve event leaderboard' }, { status: 500 });
    }

    return NextResponse.json(leaderboardData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err) {
    console.error(`[GET /api/events/${id}/battle-leaderboard] Error:`, err);
    return NextResponse.json({ error: 'Internal server error aggregating leaderboard' }, { status: 500 });
  }
}
