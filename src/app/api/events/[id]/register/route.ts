import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { isPrivateEvent } from '@/lib/publicEvents';
import { getEventAuthHeaders } from '@/lib/eventAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const EVENT_BACKEND_URL = process.env.EVENT_BACKEND_URL || 'http://localhost:3002';
const isUuid = (val: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

function sanitizeRegistrationDetails(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const d = raw as Record<string, unknown>;
  const allowedKeys = [
    'full_name',
    'email',
    'phone',
    'gender',
    'user_type',
    'college_org',
    'degree',
    'branch',
    'year_of_study',
    'city_state',
    'github_url',
    'linkedin_url',
    'portfolio_url',
    'resume_url',
    'coding_handle',
    'preferred_language',
    'referral_source',
  ];

  const sanitized: Record<string, unknown> = {};
  for (const k of allowedKeys) {
    if (d[k] !== undefined && d[k] !== null) {
      sanitized[k] = typeof d[k] === 'string' ? (d[k] as string).trim() : d[k];
    }
  }
  return sanitized;
}

interface AuthResult {
  user: { id: string; username: string; email: string };
  isSession: boolean;
}

interface TeamMember {
  userId: string;
  username?: string;
  email?: string;
  joinedAt?: string;
  role: string;
}

async function getAuthenticatedUser(
  req: NextRequest,
  fallbackEmail?: string,
  rawDetails?: Record<string, unknown>,
  requireSessionOnly: boolean = false
): Promise<AuthResult | null> {
  let token: string | undefined;
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    token = req.cookies.get(SESSION_COOKIE)?.value || req.cookies.get('cosmo_session')?.value;
  }

  if (token) {
    const session = await verifySession(token);
    if (session?.userId) {
      const user = await prisma.users.findUnique({
        where: { id: session.userId },
        select: { id: true, username: true, email: true },
      });
      if (user) return { user, isSession: true };
    }
  }

  if (requireSessionOnly) {
    return null;
  }

  if (fallbackEmail) {
    const emailClean = fallbackEmail.trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(emailClean)) return null;

    let user = await prisma.users.findUnique({
      where: { email: emailClean },
      select: { id: true, username: true, email: true },
    });

    if (!user) {
      const usernameCandidate =
        typeof rawDetails?.full_name === 'string' && rawDetails.full_name.trim()
          ? rawDetails.full_name.trim().replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
          : emailClean.split('@')[0];

      try {
        user = await prisma.users.create({
          data: {
            email: emailClean,
            username: usernameCandidate,
            role: 'student',
            auth_provider: 'event_registration',
            is_active: true,
          },
          select: { id: true, username: true, email: true },
        });
      } catch {
        user = await prisma.users.findUnique({
          where: { email: emailClean },
          select: { id: true, username: true, email: true },
        });
      }
    }

    if (user) return { user, isSession: false };
  }

  return null;
}

async function handleDatabaseRegistration(
  req: NextRequest,
  identifier: string,
  body: Record<string, unknown>
) {
  const rawDetails = (body.details as Record<string, unknown>) ?? {};
  const fallbackEmail = (body.email as string) || (rawDetails.email as string);

  const event = await prisma.events.findFirst({
    where: {
      OR: [
        { slug: { equals: identifier, mode: 'insensitive' } },
        ...(isUuid(identifier) ? [{ id: identifier }] : []),
      ],
    },
    include: {
      _count: {
        select: {
          event_registrations: {
            where: { status: 'registered' },
          },
        },
      },
    },
  });

  if (!event) {
    return { status: 404, data: { error: 'Event not found' } };
  }

  if (event.status !== 'published' && event.status !== 'ongoing') {
    return { status: 400, data: { error: 'Event is not active for registration' } };
  }

  if (!event.registration_open) {
    return { status: 400, data: { error: 'Registration is currently closed for this event' } };
  }

  if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
    return { status: 400, data: { error: 'Registration deadline has passed' } };
  }

  if (event.max_participants && event._count.event_registrations >= event.max_participants) {
    return { status: 400, data: { error: 'Event has reached maximum participant capacity' } };
  }

  if (isPrivateEvent(event.submission_config)) {
    const unlockToken =
      req.headers.get('x-unlock-token') ||
      req.cookies.get(`event_unlock_${event.id}`)?.value ||
      body.unlock_token;

    let isUnlocked = false;
    if (unlockToken && typeof unlockToken === 'string') {
      const unlockSession = await verifySession(unlockToken);
      if (unlockSession?.userId === `unlocked:${event.id}`) {
        isUnlocked = true;
      }
    }

    if (!isUnlocked) {
      const subConfig = (event.submission_config as Record<string, unknown>) || {};
      const privateAccess = (subConfig.private_access as Record<string, unknown>) || {};
      const storedSecret = typeof privateAccess.secret_password === 'string'
        ? privateAccess.secret_password.trim()
        : typeof privateAccess.secret === 'string'
        ? privateAccess.secret.trim()
        : '';
      const userSecret = typeof body.secret === 'string'
        ? body.secret.trim()
        : typeof body.secret_password === 'string'
        ? (body.secret_password as string).trim()
        : '';

      if (storedSecret && userSecret && storedSecret === userSecret) {
        isUnlocked = true;
      }
    }

    if (!isUnlocked) {
      return {
        status: 403,
        data: { error: 'This event is private. Please enter the valid secret password to unlock access before registering.' },
      };
    }
  }

  const subConfig = (event.submission_config as Record<string, unknown>) || {};
  const requiresLogin = Boolean(
    subConfig.require_login ||
    subConfig.requires_login ||
    subConfig.registration_requires_login
  );

  const authResult = await getAuthenticatedUser(req, fallbackEmail, rawDetails, requiresLogin);
  if (!authResult?.user) {
    return {
      status: 401,
      data: { error: 'You must be logged in to register for this event.' },
    };
  }
  const user = authResult.user;

  const existingReg = await prisma.event_registrations.findUnique({
    where: {
      event_id_user_id: {
        event_id: event.id,
        user_id: user.id,
      },
    },
  });

  if (existingReg && existingReg.status === 'registered') {
    return {
      status: 409,
      data: { error: 'You are already registered for this event.' },
    };
  }

  const isTeamEvent = event.participation_type === 'team';
  const rawAction = (body.action as string) || (body.teamAction as string);
  const teamNameInput = ((body.team_name as string) || (body.teamName as string) || '').trim();
  const teamCodeInput = ((body.team_code as string) || (body.teamCode as string) || '').trim().toUpperCase();

  let action: 'create_team' | 'join_team' | undefined = undefined;
  if (rawAction === 'create_team' || rawAction === 'create') {
    action = 'create_team';
  } else if (rawAction === 'join_team' || rawAction === 'join') {
    action = 'join_team';
  } else if (teamNameInput && !teamCodeInput) {
    action = 'create_team';
  } else if (teamCodeInput && !teamNameInput) {
    action = 'join_team';
  }

  if (!isTeamEvent && (action || teamNameInput || teamCodeInput)) {
    return {
      status: 400,
      data: { error: 'This event is for individual participation only and does not allow team registration.' },
    };
  }

  if (isTeamEvent && !action) {
    return {
      status: 400,
      data: { error: 'This is a team event. You must create a team or join an existing team.' },
    };
  }

  // Team Membership Lock (Section 7): team membership is immutable once event starts
  if (isTeamEvent && event.starts_at && new Date() >= new Date(event.starts_at)) {
    return {
      status: 403,
      data: { error: 'Team rosters are locked. Team creation and joining are not permitted after the event starts.' },
    };
  }

  let finalTeamName: string | null = null;
  let finalTeamCode: string | null = null;
  let finalTeamMembers: TeamMember[] = [];
  const maxTeamSize = event.max_team_size || 4;

  if (isTeamEvent && action === 'create_team') {
    if (!teamNameInput) {
      return { status: 400, data: { error: 'Team name is required to create a team.' } };
    }

    const duplicateTeam = await prisma.event_registrations.findFirst({
      where: {
        event_id: event.id,
        team_name: { equals: teamNameInput, mode: 'insensitive' },
        status: 'registered',
      },
    });

    if (duplicateTeam) {
      return {
        status: 409,
        data: { error: 'A team with this name already exists in this event. Please choose another name.' },
      };
    }

    let uniqueCode = '';
    for (let i = 0; i < 5; i++) {
      const candidate = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codeInUse = await prisma.event_registrations.findFirst({
        where: { event_id: event.id, team_code: candidate },
      });
      if (!codeInUse) {
        uniqueCode = candidate;
        break;
      }
    }

    finalTeamName = teamNameInput;
    finalTeamCode = uniqueCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    finalTeamMembers = [
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        joinedAt: new Date().toISOString(),
        role: 'leader',
      },
    ];
  } else if (isTeamEvent && action === 'join_team') {
    if (!teamCodeInput) {
      return { status: 400, data: { error: 'Team code is required to join a team.' } };
    }

    const matchingTeamRegs = await prisma.event_registrations.findMany({
      where: {
        team_code: teamCodeInput,
        status: 'registered',
      },
    });

    const eventTeamRegs = matchingTeamRegs.filter((r) => r.event_id === event.id);
    if (eventTeamRegs.length === 0) {
      return { status: 404, data: { error: 'Invalid team code for this event.' } };
    }

    const leaderReg = eventTeamRegs.find((r) => r.team_name) || eventTeamRegs[0];
    finalTeamName = leaderReg.team_name;
    finalTeamCode = leaderReg.team_code;

    const existingMembersList = Array.isArray(leaderReg.team_members_json)
      ? (leaderReg.team_members_json as unknown as TeamMember[])
      : [];

    const isAlreadyMember = eventTeamRegs.some((r) => r.user_id === user.id);
    if (isAlreadyMember) {
      return { status: 409, data: { error: 'You are already a member of this team.' } };
    }

    if (eventTeamRegs.length >= maxTeamSize) {
      return {
        status: 400,
        data: { error: `Team is already at maximum capacity (${maxTeamSize} members).` },
      };
    }

    const newMember: TeamMember = {
      userId: user.id,
      username: user.username,
      email: user.email,
      joinedAt: new Date().toISOString(),
      role: 'member',
    };
    finalTeamMembers = [...existingMembersList.filter((m) => m.userId !== user.id), newMember];
  }

  const sanitizedDetails = sanitizeRegistrationDetails(rawDetails);
  const userEmail = (rawDetails.email as string)?.trim() || user.email;

  const registration = await prisma.$transaction(async (tx) => {
    if (isTeamEvent && action === 'join_team' && finalTeamCode) {
      await tx.event_registrations.updateMany({
        where: {
          event_id: event.id,
          team_code: finalTeamCode,
          status: 'registered',
        },
        data: {
          team_members_json: finalTeamMembers as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return await tx.event_registrations.upsert({
      where: {
        event_id_user_id: {
          event_id: event.id,
          user_id: user.id,
        },
      },
      create: {
        event_id: event.id,
        user_id: user.id,
        email: userEmail,
        team_name: finalTeamName,
        team_code: finalTeamCode,
        team_members_json: finalTeamMembers as unknown as Prisma.InputJsonValue,
        details_json: sanitizedDetails as Prisma.InputJsonValue,
        status: 'registered',
      },
      update: {
        status: 'registered',
        registered_at: new Date(),
        email: userEmail,
        team_name: finalTeamName,
        team_code: finalTeamCode,
        team_members_json: finalTeamMembers as unknown as Prisma.InputJsonValue,
        details_json: sanitizedDetails as Prisma.InputJsonValue,
      },
    });
  });

  return {
    status: 201,
    data: {
      success: true,
      message: 'Successfully registered for event.',
      registration: {
        id: registration.id,
        event_id: registration.event_id,
        user_id: registration.user_id,
        status: registration.status,
        registered_at: registration.registered_at,
        team_name: registration.team_name,
        team_code: registration.team_code,
        team_members: registration.team_members_json,
        details: registration.details_json,
      },
    },
  };
}

async function handleDatabaseWithdrawal(req: NextRequest, identifier: string) {
  const authResult = await getAuthenticatedUser(req, undefined, undefined, true);
  if (!authResult?.user) {
    return {
      status: 401,
      data: { error: 'Unauthorized. You must be logged in to withdraw registration.' },
    };
  }
  const user = authResult.user;

  const event = await prisma.events.findFirst({
    where: {
      OR: [
        { slug: { equals: identifier, mode: 'insensitive' } },
        ...(isUuid(identifier) ? [{ id: identifier }] : []),
      ],
    },
  });

  if (!event) {
    return { status: 404, data: { error: 'Event not found' } };
  }

  // Team Membership Lock (Section 7): team membership is immutable once event starts
  if (event.participation_type === 'team' && event.starts_at && new Date() >= new Date(event.starts_at)) {
    return {
      status: 403,
      data: { error: 'Team rosters are locked. Registration withdrawal is not permitted after the event starts.' },
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const registration = await tx.event_registrations.findFirst({
      where: {
        event_id: event.id,
        OR: [
          { user_id: user.id },
          ...(user.email ? [{ email: { equals: user.email, mode: 'insensitive' as const } }] : []),
        ],
      },
    });

    if (!registration) {
      throw new Error('NOT_FOUND');
    }

    return await tx.event_registrations.update({
      where: { id: registration.id },
      data: {
        status: 'withdrawn',
        team_name: null,
        team_code: null,
      },
    });
  });

  return {
    status: 200,
    data: {
      success: true,
      message: 'Registration withdrawn successfully.',
      registration: {
        id: updated.id,
        event_id: updated.event_id,
        user_id: updated.user_id,
        status: updated.status,
      },
    },
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id).trim();
  const body = await req.json().catch(() => ({}));

  try {
    const authHeaders = await getEventAuthHeaders(req);
    const unlockToken = req.headers.get('x-unlock-token');
    if (unlockToken) {
      authHeaders['x-unlock-token'] = unlockToken;
    }
    const targetUrl = `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(decodedId)}/register`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    clearTimeout(timeoutId);

    if (res.ok || res.status < 500) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch {
    // Backend service unreachable, timed out, or connection refused -> fallback to Prisma DB
  }

  try {
    const result = await handleDatabaseRegistration(req, decodedId, body);
    return NextResponse.json(result.data, { status: result.status });
  } catch (dbErr) {
    console.error(`[POST /api/events/${id}/register DB fallback] Error:`, dbErr);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id).trim();

  try {
    const authHeaders = await getEventAuthHeaders(req);
    const targetUrl = `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(decodedId)}/register`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      method: 'DELETE',
      headers: authHeaders,
    });
    clearTimeout(timeoutId);

    if (res.ok || res.status < 500) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch {
    // Backend service unreachable, timed out, or connection refused -> fallback to Prisma DB
  }

  try {
    const result = await handleDatabaseWithdrawal(req, decodedId);
    return NextResponse.json(result.data, { status: result.status });
  } catch (dbErr: unknown) {
    const error = dbErr as { message?: string } | null;
    if (error?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    console.error(`[DELETE /api/events/${id}/register DB fallback] Error:`, dbErr);
    return NextResponse.json({ error: 'Failed to withdraw registration' }, { status: 500 });
  }
}
