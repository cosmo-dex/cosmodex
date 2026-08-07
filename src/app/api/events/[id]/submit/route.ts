import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SESSION_COOKIE } from '@/lib/adminAuth';

function getSession(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value) as { userId: string; username: string; role: string };
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSession(req);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  try {
    const body = await req.json();
    const { submission_url, demo_url, video_url, tech_stack, description, mcqAnswers, codeAnswers } = body as {
      submission_url?: string;
      demo_url?: string;
      video_url?: string;
      tech_stack?: string;
      description?: string;
      mcqAnswers?: Record<string, string>;
      codeAnswers?: Record<string, string>;
    };

    if (!submission_url) {
      return NextResponse.json({ error: 'submission_url is required' }, { status: 400 });
    }

    const event = await prisma.events.findFirst({
      where: {
        ...(isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id }),
        status: { in: ['ongoing', 'published'] },
      },
      select: { id: true, status: true, ends_at: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found or not accepting submissions' }, { status: 404 });
    }

    const registration = await prisma.event_registrations.findUnique({
      where: { event_id_user_id: { event_id: event.id, user_id: session.userId } },
    });

    if (!registration || registration.status === 'disqualified' || registration.status === 'withdrawn') {
      return NextResponse.json({ error: 'You must be a registered participant to submit' }, { status: 403 });
    }

    if (registration.submission_url) {
      return NextResponse.json({ error: 'You have already submitted your solution for this event. Multiple submissions are not allowed.' }, { status: 400 });
    }

    const submissionDetails = {
      demo_url: demo_url ?? null,
      video_url: video_url ?? null,
      tech_stack: tech_stack ?? null,
      description: description ?? null,
      mcqAnswers: mcqAnswers ?? null,
      codeAnswers: codeAnswers ?? null,
      submitted_at: new Date().toISOString(),
    };

    const updated = await prisma.event_registrations.update({
      where: { id: registration.id },
      data: {
        submission_url,
        submission_details_json: submissionDetails,
      },
    });

    // Auto-calculate score & sync to event_leaderboard
    let calculatedScore = 100;
    if (mcqAnswers && typeof mcqAnswers === 'object') {
      calculatedScore += Object.keys(mcqAnswers).length * 50;
    }
    if (codeAnswers && typeof codeAnswers === 'object') {
      const nonDefaultCodeCount = Object.values(codeAnswers as Record<string, string>).filter(c => c && c.trim().length > 30).length;
      calculatedScore += nonDefaultCodeCount * 100;
    }

    try {
      await prisma.event_leaderboard.upsert({
        where: { event_id_user_id: { event_id: event.id, user_id: session.userId } },
        create: {
          event_id: event.id,
          user_id: session.userId,
          score: calculatedScore,
        },
        update: {
          score: calculatedScore,
        },
      });
    } catch (e) {
      console.warn('[Leaderboard Auto Sync Warning]:', e);
    }

    return NextResponse.json({ success: true, registration: updated, score: calculatedScore });
  } catch (err) {
    console.error('[POST /api/events/[id]/submit] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSession(req);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  try {
    const event = await prisma.events.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      select: { id: true },
    });

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const registration = await prisma.event_registrations.findUnique({
      where: { event_id_user_id: { event_id: event.id, user_id: session.userId } },
      select: {
        submission_url: true,
        submission_details_json: true,
        team_name: true,
        team_code: true,
      },
    });

    return NextResponse.json({ submission: registration ?? null });
  } catch (err) {
    console.error('[GET /api/events/[id]/submit] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
