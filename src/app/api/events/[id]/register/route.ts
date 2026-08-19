import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getEventUserSession } from '@/lib/eventAuth';

function generateTeamCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  try {
    const [session, bodyRaw, event] = await Promise.all([
      getEventUserSession(req),
      req.json().catch(() => ({})),
      prisma.events.findFirst({
        where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
        select: {
          id: true,
          title: true,
          starts_at: true,
          slug: true,
          registration_open: true,
          registration_deadline: true,
          max_participants: true,
          status: true,
          participation_type: true,
          max_team_size: true,
          _count: { select: { event_registrations: true } },
        },
      }),
    ]);

    if (!session?.userId) {
      return NextResponse.json({ error: 'Please log in to register for this event' }, { status: 401 });
    }

    const body = (bodyRaw || {}) as {
      email?: string;
      team_name?: string;
      team_code?: string;
      action?: string;
      details?: {
        full_name?: string;
        email?: string;
        phone?: string;
        gender?: string;
        user_type?: string;
        college_org?: string;
        degree?: string;
        branch?: string;
        year_of_study?: string;
        city_state?: string;
        github_url?: string;
        linkedin_url?: string;
        referral_source?: string;
      };
    };

    if (!event || !['published', 'ongoing'].includes(event.status ?? '')) {
      return NextResponse.json({ error: 'Event not found or not open' }, { status: 404 });
    }
    if (!event.registration_open) {
      if (event.registration_deadline && new Date() > event.registration_deadline) {
        return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Registrations are closed' }, { status: 400 });
    }

    let userEmail = body.details?.email?.trim() || body.email?.trim() || session.email;
    if (!userEmail) {
      const dbUser = await prisma.users.findUnique({ where: { id: session.userId }, select: { email: true } });
      userEmail = dbUser?.email;
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'A valid email address is required to register' }, { status: 400 });
    }

    try {
      await prisma.users.update({
        where: { id: session.userId },
        data: { email: userEmail },
      });
    } catch { }

    const candidateName = body.details?.full_name?.trim() || session.username;
    const detailsJson = (body.details as Record<string, unknown>) ?? {};

    const existing = await prisma.event_registrations.findUnique({
      where: { event_id_user_id: { event_id: event.id, user_id: session.userId } },
    });

    const isTeamEvent = event.participation_type === 'team';
    let resultRegistration;
    let finalTeamCode: string | null = null;

    if (existing) {
      resultRegistration = await prisma.event_registrations.update({
        where: { event_id_user_id: { event_id: event.id, user_id: session.userId } },
        data: {
          status: 'registered',
          registered_at: new Date(),
          email: userEmail,
          details_json: detailsJson as Prisma.InputJsonValue,
        },
      });
      finalTeamCode = existing.team_code;
    } else {
      if (event.max_participants && event._count.event_registrations >= event.max_participants) {
        return NextResponse.json({ error: 'Event is full' }, { status: 400 });
      }

      if (!isTeamEvent) {
        resultRegistration = await prisma.event_registrations.create({
          data: {
            event_id: event.id,
            user_id: session.userId,
            email: userEmail,
            details_json: detailsJson as Prisma.InputJsonValue,
            status: 'registered',
          },
        });
      } else if (body.action === 'join_team' && body.team_code) {
        const leaderReg = await prisma.event_registrations.findFirst({
          where: { event_id: event.id, team_code: body.team_code, status: 'registered' },
          select: { id: true, team_name: true, team_members_json: true },
        });

        if (!leaderReg) {
          return NextResponse.json({ error: 'Invalid team code or team not found' }, { status: 404 });
        }

        const currentMembers = (leaderReg.team_members_json as Array<Record<string, unknown>>) ?? [];
        const maxSize = event.max_team_size ?? 4;

        if (currentMembers.length + 1 >= maxSize) {
          return NextResponse.json({ error: 'Team is already full' }, { status: 400 });
        }

        const updatedMembers = [
          ...currentMembers,
          {
            userId: session.userId,
            username: session.username,
            fullName: candidateName,
            email: userEmail,
            phone: body.details?.phone ?? null,
            joinedAt: new Date().toISOString(),
          },
        ];

        await prisma.event_registrations.update({
          where: { id: leaderReg.id },
          data: { team_members_json: updatedMembers as Prisma.InputJsonValue },
        });

        resultRegistration = await prisma.event_registrations.create({
          data: {
            event_id: event.id,
            user_id: session.userId,
            email: userEmail,
            details_json: detailsJson as Prisma.InputJsonValue,
            status: 'registered',
            team_name: leaderReg.team_name,
            team_code: body.team_code,
          },
        });

        finalTeamCode = body.team_code;
      } else {
        const teamCode = generateTeamCode();
        const teamName = body.team_name || `${candidateName}'s Team`;

        resultRegistration = await prisma.event_registrations.create({
          data: {
            event_id: event.id,
            user_id: session.userId,
            email: userEmail,
            details_json: detailsJson as Prisma.InputJsonValue,
            status: 'registered',
            team_name: teamName,
            team_code: teamCode,
            team_members_json: [],
          },
        });

        finalTeamCode = teamCode;
      }
    }

    return NextResponse.json({
      registration: resultRegistration,
      team_code: finalTeamCode,
      created_team: body.action === 'create_team',
    });
  } catch (err) {
    console.error('[POST /api/events/[id]/register] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  try {
    const [session, event] = await Promise.all([
      getEventUserSession(req),
      prisma.events.findFirst({
        where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
        select: { id: true },
      }),
    ]);

    if (!session?.userId) {
      return NextResponse.json({ error: 'Please log in to manage your registration' }, { status: 401 });
    }

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    await prisma.event_registrations.update({
      where: { event_id_user_id: { event_id: event.id, user_id: session.userId } },
      data: { status: 'withdrawn' },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/events/[id]/register] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
