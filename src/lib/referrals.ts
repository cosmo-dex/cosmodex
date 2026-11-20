import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export const REFERRAL_REWARD_POINTS = 100;
export const REFERRED_USER_REWARD_POINTS = 100;
export const REFERRAL_COOKIE = 'cosmo_referral';
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function createReferralCode() {
  return randomBytes(6).toString('base64url').replace(/[-_]/g, '').toUpperCase();
}

export async function ensureReferralCode(userId: string) {
  const existing = await prisma.users.findUnique({ where: { id: userId }, select: { referral_code: true } });
  if (existing?.referral_code) return existing.referral_code;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createReferralCode();
    try {
      await prisma.users.updateMany({
        where: { id: userId, referral_code: null },
        data: { referral_code: code },
      });
      const updated = await prisma.users.findUnique({ where: { id: userId }, select: { referral_code: true } });
      if (updated?.referral_code) return updated.referral_code;
      throw new Error('Unable to assign referral code');
    } catch (error) {
      const isUniqueConstraintError = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
      if (!isUniqueConstraintError || attempt === 4) throw error;
    }
  }

  throw new Error('Unable to create referral code');
}

export async function creditReferralForNewUser(tx: Prisma.TransactionClient, referredUserId: string, referralCode?: string | null) {
  if (!referralCode) return null;

  const cleanCode = referralCode.trim().toUpperCase();
  const referrer = await tx.users.findUnique({
    where: { referral_code: cleanCode },
    select: { id: true, xp_total: true },
  });
  if (!referrer || referrer.id === referredUserId) return null;

  // Ensure this user has not already been credited for a referral
  const existing = await tx.referrals.findUnique({
    where: { referred_user_id: referredUserId },
    select: { id: true },
  });
  if (existing) return null;

  const referral = await tx.referrals.create({
    data: {
      referrer_id: referrer.id,
      referred_user_id: referredUserId,
      referral_code: cleanCode,
      points_awarded: REFERRAL_REWARD_POINTS,
      status: 'credited',
    },
  });

  await tx.referral_point_events.create({
    data: {
      referral_id: referral.id,
      user_id: referrer.id,
      points: REFERRAL_REWARD_POINTS,
      reason: 'referrer_signup_reward',
    },
  });

  await tx.users.update({
    where: { id: referrer.id },
    data: {
      xp_total: referrer.xp_total === null ? REFERRAL_REWARD_POINTS : { increment: REFERRAL_REWARD_POINTS },
    },
  });

  await tx.referral_point_events.create({
    data: {
      referral_id: referral.id,
      user_id: referredUserId,
      points: REFERRED_USER_REWARD_POINTS,
      reason: 'referred_user_signup_reward',
    },
  });

  const referredUser = await tx.users.findUnique({
    where: { id: referredUserId },
    select: { xp_total: true },
  });

  await tx.users.update({
    where: { id: referredUserId },
    data: {
      xp_total: referredUser?.xp_total === null ? REFERRED_USER_REWARD_POINTS : { increment: REFERRED_USER_REWARD_POINTS },
    },
  });

  return referral;
}

export async function getReferralSummary(userId: string, origin: string) {
  // Normalize app origin safely, avoiding internal container loops
  let appOrigin = 'https://cosmodex.in';
  try {
    const raw = (origin || '').trim();
    if (raw && !raw.includes('0.0.0.0')) {
      const withProto = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
      appOrigin = new URL(withProto).origin;
    }
  } catch {
    appOrigin = 'https://cosmodex.in';
  }

  const [user, referralCount, referrals, points] = await Promise.all([
    prisma.users.findUnique({ where: { id: userId }, select: { referral_code: true } }).catch(() => null),
    prisma.referrals.count({ where: { referrer_id: userId } }).catch(() => 0),
    prisma.referrals.findMany({
      where: { referrer_id: userId },
      select: { id: true, points_awarded: true, status: true, created_at: true, referred_user: { select: { username: true } } },
      orderBy: { created_at: 'desc' },
      take: 50,
    }).catch(() => []),
    prisma.referral_point_events.aggregate({ where: { user_id: userId }, _sum: { points: true } }).catch(() => ({ _sum: { points: 0 } })),
  ]);

  let code = user?.referral_code;
  if (!code) {
    try {
      code = await ensureReferralCode(userId);
    } catch (err) {
      console.warn('[referrals] Could not generate referral code:', err);
    }
  }

  const link = code
    ? `${appOrigin}/join?ref=${encodeURIComponent(code)}`
    : `${appOrigin}/join`;

  return {
    code: code || '',
    link,
    count: referralCount ?? 0,
    points: points?._sum?.points ?? 0,
    referrals: (referrals ?? []).map((referral) => ({
      id: referral.id,
      username: referral.referred_user.username,
      points: referral.points_awarded,
      status: referral.status,
      createdAt: referral.created_at.toISOString(),
    })),
  };
}
