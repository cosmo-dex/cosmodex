import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifySession, signSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS, type SessionPayload } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated or invalid session' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        experience_level: true,
        interests: true,
        xp_total: true,
        level: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error('[user/profile GET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated or invalid session' }, { status: 401 });
    }

    const userId = session.userId;
    const sessionData: SessionPayload = session;

    const body = await req.json();
    const { username, interests, avatarUrl, avatar_url } = body as {
      username?: string;
      interests?: string[];
      avatarUrl?: string;
      avatar_url?: string;
    };

    // Build update payload (only update fields that are provided)
    const updateData: Record<string, unknown> = {};

    if (interests !== undefined) updateData.interests = interests;
    const targetAvatar = avatarUrl !== undefined ? avatarUrl : avatar_url;
    if (targetAvatar !== undefined) updateData.avatar_url = targetAvatar;

    if (username !== undefined) {
      const trimmed = username.trim();
      if (!trimmed) {
        return NextResponse.json({ error: 'Username cannot be empty.' }, { status: 400 });
      }
      if (trimmed.length < 3 || trimmed.length > 30) {
        return NextResponse.json({ error: 'Username must be between 3 and 30 characters.' }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores.' }, { status: 400 });
      }

      const conflict = await prisma.users.findFirst({
        where: {
          username: { equals: trimmed, mode: 'insensitive' },
          NOT: { id: userId },
        },
        select: { id: true },
      });

      if (conflict) {
        return NextResponse.json({ error: 'This name is already taken. Please choose another.' }, { status: 409 });
      }

      updateData.username = trimmed;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        experience_level: true,
        interests: true,
        xp_total: true,
        level: true,
        created_at: true,
      },
    });

    // Refresh signed session cookie with updated values
    const signedToken = await signSession({
      ...sessionData,
      username: updatedUser.username,
      avatarId: updatedUser.avatar_url ?? null,
      interests: updatedUser.interests,
    });

    cookieStore.set(SESSION_COOKIE, signedToken, SESSION_COOKIE_OPTIONS);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('[user/profile PATCH] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
