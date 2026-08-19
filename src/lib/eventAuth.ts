import { NextRequest } from 'next/server';
import { verifySession, SESSION_COOKIE as USER_SESSION_COOKIE } from '@/lib/session';
import { SESSION_COOKIE as ADMIN_SESSION_COOKIE } from '@/lib/adminAuth';
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
        select: { id: true, username: true, email: true },
      });
      if (dbUser) {
        return {
          userId: dbUser.id,
          username: dbUser.username,
          email: dbUser.email ?? nextAuthSession.user.email,
        };
      }
    }
  } catch { }

  // 3. Fallback to Admin session cookie
  const adminCookie = req.cookies.get(ADMIN_SESSION_COOKIE);
  if (adminCookie?.value) {
    try {
      const admin = JSON.parse(adminCookie.value);
      if (admin?.userId) {
        return {
          userId: admin.userId,
          username: admin.username || 'Admin',
          email: admin.email,
          role: admin.role,
        };
      }
    } catch { }
  }

  return null;
}
