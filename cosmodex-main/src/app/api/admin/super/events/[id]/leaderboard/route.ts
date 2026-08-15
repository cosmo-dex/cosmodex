import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAdminSession(req, ['super_admin']);
  if ('error' in auth) return auth.error;

  const { id } = await params;

  try {
    const leaderboard = await prisma.event_leaderboard.findMany({
      where: { event_id: id },
      include: { users: { select: { id: true, username: true, email: true, avatar_url: true } } },
      orderBy: { score: 'desc' },
    });

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error('[GET /api/admin/super/events/[id]/leaderboard] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAdminSession(req, ['super_admin']);
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const body = await req.json();
  const { entries } = body as { entries?: { userId: string; score: number; metadata_json?: object }[] };

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: 'entries array is required' }, { status: 400 });
  }

  try {
    await Promise.all(
      entries.map((e) =>
        prisma.event_leaderboard.upsert({
          where: { event_id_user_id: { event_id: id, user_id: e.userId } },
          create: {
            event_id: id,
            user_id: e.userId,
            score: e.score,
            metadata_json: e.metadata_json ?? {},
            updated_at: new Date(),
          },
          update: {
            score: e.score,
            metadata_json: e.metadata_json ?? {},
            updated_at: new Date(),
          },
        }),
      ),
    );

    const allEntries = await prisma.event_leaderboard.findMany({
      where: { event_id: id },
      orderBy: { score: 'desc' },
      select: { id: true, score: true },
    });

    await Promise.all(
      allEntries.map((entry, idx) =>
        prisma.event_leaderboard.update({
          where: { id: entry.id },
          data: { rank: idx + 1 },
        }),
      ),
    );

    const updated = await prisma.event_leaderboard.findMany({
      where: { event_id: id },
      include: { users: { select: { id: true, username: true, avatar_url: true } } },
      orderBy: { rank: 'asc' },
    });

    return NextResponse.json({ leaderboard: updated });
  } catch (err) {
    console.error('[POST /api/admin/super/events/[id]/leaderboard] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
