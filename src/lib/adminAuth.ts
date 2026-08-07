import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const SESSION_COOKIE = 'cosmo_session';

export type AdminRole = 'super_admin' | 'learning_admin' | 'arena_admin';

export interface SessionUser {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export async function verifyAdminSession(
  req: NextRequest,
  allowedRoles: AdminRole[],
): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const sessionCookie = req.cookies.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return {
      error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    };
  }

  let session: SessionUser;
  try {
    session = JSON.parse(sessionCookie.value) as SessionUser;
  } catch {
    return {
      error: NextResponse.json({ error: 'Invalid session' }, { status: 401 }),
    };
  }

  if (!session.userId || !session.role) {
    return {
      error: NextResponse.json({ error: 'Invalid session data' }, { status: 401 }),
    };
  }

  // Verify the user still exists in DB and has the claimed role (defense in depth)
  const dbUser = await prisma.users.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, is_active: true },
  });

  if (!dbUser || !dbUser.is_active) {
    return {
      error: NextResponse.json({ error: 'Account not found or suspended' }, { status: 403 }),
    };
  }

  const dbRole = dbUser.role ?? 'student';

  if (!allowedRoles.includes(dbRole as AdminRole)) {
    return {
      error: NextResponse.json(
        { error: `Forbidden: requires one of [${allowedRoles.join(', ')}]` },
        { status: 403 },
      ),
    };
  }

  return { user: { ...session, role: dbRole } };
}

/**
 * Audit logging removed per requirements.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function logAdminActivity(..._args: unknown[]) {
  // No-op
}

/**
 * Extracts the client IP from the request headers.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}
