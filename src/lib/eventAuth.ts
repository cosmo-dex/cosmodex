import { NextRequest } from 'next/server';
import { verifySession, signSession, SESSION_COOKIE as USER_SESSION_COOKIE } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface EventUserSession {
  userId: string;
  username: string;
  email?: string;
  role?: string;
}

export async function getEventUserSession(req: NextRequest): Promise<EventUserSession | null> {
  // 1. Check custom session cookie
  const userCookie = req.cookies.get(USER_SESSION_COOKIE);
  if (userCookie?.value) {
    const user = await verifySession(userCookie.value);
    if (user?.userId) {
      return {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
      };
    }
  }

  // 2. Check NextAuth OAuth session
  try {
    const nextAuthSession = await getServerSession(authOptions);
    if (nextAuthSession?.user?.email) {
      const email = nextAuthSession.user.email.trim().toLowerCase();
      const dbUser = await prisma.users.findUnique({
        where: { email },
        select: { id: true, username: true, email: true, role: true },
      });
      if (dbUser) {
        return {
          userId: dbUser.id,
          username: dbUser.username,
          email: dbUser.email ?? nextAuthSession.user.email,
          role: dbUser.role ?? 'student',
        };
      }
    }
  } catch { }

  return null;
}

export async function getEventAuthHeaders(req: NextRequest): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // 1. If explicit Authorization header exists
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
    return headers;
  }

  // 2. If cosmo_session cookie exists
  const userCookie = req.cookies.get(USER_SESSION_COOKIE);
  if (userCookie?.value) {
    headers['Cookie'] = `${USER_SESSION_COOKIE}=${userCookie.value}`;
    headers['Authorization'] = `Bearer ${userCookie.value}`;
    return headers;
  }

  // 3. Fallback to NextAuth -> sign session
  const session = await getEventUserSession(req);
  if (session?.userId) {
    const token = await signSession({
      userId: session.userId,
      username: session.username,
      email: session.email || '',
      role: session.role || 'student',
    });
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}
