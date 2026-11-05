import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { signSession, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/session';
import { creditReferralForNewUser, ensureReferralCode, REFERRAL_COOKIE } from '@/lib/referrals';

const SALT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username, avatarId, experienceLevel, interests, authMethod } = body as {
      email: string;
      password?: string;
      username: string;
      avatarId: string | null;
      experienceLevel: string | null;
      interests: string[];
      authMethod?: 'Email' | 'Google' | 'GitHub';
    };

    if (!email || !username) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const isOAuth = authMethod === 'Google' || authMethod === 'GitHub';

    if (!isOAuth && (!password || password.length < 8)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const [emailConflict, usernameConflict] = await Promise.all([
      prisma.users.findUnique({ where: { email: normalizedEmail }, select: { id: true } }),
      prisma.users.findFirst({
        where: { username: { equals: normalizedUsername, mode: 'insensitive' } },
        select: { id: true },
      }),
    ]);

    if (emailConflict) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }
    if (usernameConflict) {
      return NextResponse.json({ error: 'This username is already taken.' }, { status: 409 });
    }

    const passwordHash = isOAuth ? null : await hash(password!, SALT_ROUNDS);
    const providerStr = authMethod ? authMethod.toLowerCase() : 'email';

    const cookieStore = await cookies();
    const referralCode = cookieStore.get(REFERRAL_COOKIE)?.value ?? null;

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.users.create({
        data: {
          email: normalizedEmail,
          username: normalizedUsername,
          password_hash: passwordHash,
          auth_provider: providerStr,
          role: 'student',
          avatar_url: avatarId ?? null,
          experience_level: 'Beginner',
          interests: interests ?? [],
          xp_total: 0,
          level: 1,
          is_active: true,
          last_login_at: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatar_url: true,
          experience_level: true,
          interests: true,
          level: true,
          xp_total: true,
          role: true,
          created_at: true,
        },
      });

      await creditReferralForNewUser(tx, createdUser.id, referralCode);
      return createdUser;
    });

    await ensureReferralCode(newUser.id);

    const signedToken = await signSession({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      avatarId: avatarId ?? null,
      experienceLevel: newUser.experience_level ?? null,
      interests: newUser.interests ?? [],
      xpTotal: newUser.xp_total ?? 0,
      level: newUser.level ?? 1,
      role: newUser.role ?? 'student',
      createdAt: newUser.created_at?.toISOString() ?? new Date().toISOString(),
    });

    cookieStore.set(SESSION_COOKIE, signedToken, SESSION_COOKIE_OPTIONS);
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatarId,
        experienceLevel,
        interests,
        xpTotal: newUser.xp_total,
        level: newUser.level,
        role: newUser.role,
      },
    });
    response.cookies.delete(REFERRAL_COOKIE);
    return response;
  } catch (err) {
    console.error('[register] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
