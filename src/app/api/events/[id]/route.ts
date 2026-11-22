import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { getEventAuthHeaders } from '@/lib/eventAuth';
import {
  PUBLIC_EVENT_STATUSES,
  PublicEventStatus,
  isPrivateEvent,
  sanitizePublicEventDetail,
} from '@/lib/publicEvents';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const EVENT_BACKEND_URL = process.env.EVENT_BACKEND_URL || 'http://localhost:3002';
const isUuid = (val: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

async function queryEventDetailFromDatabase(
  req: NextRequest,
  identifier: string
) {
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

  if (
    !event ||
    !PUBLIC_EVENT_STATUSES.includes(event.status as PublicEventStatus)
  ) {
    return { status: 404, data: { error: 'Event not found' } };
  }

  const isPrivate = isPrivateEvent(event.submission_config);
  const subConfig = (event.submission_config as Record<string, unknown>) || {};
  const privateAccess = (subConfig.private_access as Record<string, unknown>) || {};
  const secretId = typeof privateAccess.secret_id === 'string' ? privateAccess.secret_id : undefined;

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

  const sanitizedEvent = {
    ...sanitizePublicEventDetail(event),
    is_private: isPrivate,
    ...(isPrivate ? { secret_id: secretId, is_unlocked: isUnlocked } : {}),
    ...(isPrivate && !isUnlocked ? { enter_event_url: null } : {}),
  };

  let userRegistration = null;
  let userId: string | null = null;
  let userEmail: string | null = null;

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : (req.cookies.get(SESSION_COOKIE)?.value || req.cookies.get('cosmo_session')?.value);

  if (token) {
    const session = await verifySession(token);
    if (session?.userId) userId = session.userId;
    if (session?.email) userEmail = session.email.trim().toLowerCase();
  }

  if (!userId) {
    const headerUserId = req.headers.get('x-user-id');
    if (headerUserId) userId = headerUserId.trim();
  }
  if (!userEmail) {
    const headerEmail = req.headers.get('x-user-email') || req.nextUrl.searchParams.get('email');
    if (headerEmail) userEmail = headerEmail.trim().toLowerCase();
  }

  if (userId || userEmail) {
    const reg = await prisma.event_registrations.findFirst({
      where: {
        event_id: event.id,
        status: 'registered',
        OR: [
          ...(userId ? [{ user_id: userId }] : []),
          ...(userEmail ? [{ email: { equals: userEmail, mode: 'insensitive' as const } }] : []),
        ],
      },
      orderBy: { registered_at: 'desc' },
    });
    if (reg) {
      userRegistration = reg;
    }
  }

  return {
    status: 200,
    data: {
      success: true,
      event: sanitizedEvent,
      userRegistration,
    },
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id).trim();

  // 1. Direct Prisma DB query first (fastest, ~5-15ms)
  try {
    const dbResult = await queryEventDetailFromDatabase(req, decodedId);
    if (dbResult.status === 200) {
      const isPersonalized = Boolean(
        (dbResult.data as { userRegistration?: unknown })?.userRegistration ||
        (dbResult.data as { event?: { is_private?: boolean } })?.event?.is_private
      );
      return NextResponse.json(dbResult.data, {
        status: 200,
        headers: {
          'Cache-Control': isPersonalized
            ? 'private, no-cache, no-store, must-revalidate'
            : 'public, s-maxage=15, stale-while-revalidate=60',
        },
      });
    }
  } catch (dbErr) {
    console.error(`[GET /api/events/${id} DB first] Error:`, dbErr);
  }

  // 2. Fallback to external event backend if DB returned non-200 or threw
  try {
    const authHeaders = await getEventAuthHeaders(req);
    const unlockToken = req.headers.get('x-unlock-token');
    if (unlockToken) {
      authHeaders['x-unlock-token'] = unlockToken;
    }

    const clientEmail = req.headers.get('x-user-email') || req.nextUrl.searchParams.get('email');
    if (clientEmail && !authHeaders['x-user-email']) {
      authHeaders['x-user-email'] = clientEmail;
    }

    const query = new URLSearchParams();
    if (clientEmail) {
      query.set('email', clientEmail);
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const targetUrl = `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(decodedId)}${queryString}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: authHeaders,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        status: res.status,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      });
    }
  } catch {
    // Backend service unreachable, timed out, or connection refused
  }

  return NextResponse.json({ error: 'Event not found' }, { status: 404 });
}
