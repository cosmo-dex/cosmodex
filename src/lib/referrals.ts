import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export const REFERRAL_REWARD_POINTS = 100;
export const REFERRAL_COOKIE = 'cosmo_referral';
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function createReferralCode() {
  return randomBytes(6).toString('base64url').replace(/[-_]/g, '').toUpperCase();
}

export async function ensureReferralCode(userId: string) {
  const existing = await prisma.users.findUnique({
    where: { id: userId },
    select: { referral_code: true },
  });
  if (existing?.referral_code) return existing.referral_code;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createReferralCode();
    try {
      const updated = await prisma.users.update({
        where: { id: userId },
        data: { referral_code: code },
        select: { referral_code: true },
      });
      return updated.referral_code as string;
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }

  throw new Error('Unable to create referral code');
}

export async function creditReferralForNewUser(tx: Prisma.TransactionClient, referredUserId: string, referralCode?: string | null) {
  if (!referralCode) return null;

  const referrer = await tx.users.findUnique({
    where: { referral_code: referralCode.trim().toUpperCase() },
    select: { id: true, xp_total: true },
  });
  if (!referrer || referrer.id === referredUserId) return null;

  const referral = await tx.referrals.create({
    data: {
      referrer_id: referrer.id,
      referred_user_id: referredUserId,
      referral_code: referralCode.trim().toUpperCase(),
      points_awarded: REFERRAL_REWARD_POINTS,
      status: 'credited',
    },
  });

  await tx.referral_point_events.create({
    data: {
      referral_id: referral.id,
      user_id: referrer.id,
      points: REFERRAL_REWARD_POINTS,
      reason: 'successful_login',
    },
  });

  await tx.users.update({
    where: { id: referrer.id },
    data: { xp_total: (referrer.xp_total ?? 0) + REFERRAL_REWARD_POINTS },
  });

  return referral;
}

export async function getReferralSummary(userId: string, origin: string) {
  const [user, referralCount, referrals, points] = await Promise.all([
    prisma.users.findUnique({ where: { id: userId }, select: { referral_code: true } }),
    prisma.referrals.count({ where: { referrer_id: userId } }),
    prisma.referrals.findMany({
      where: { referrer_id: userId },
      select: { id: true, points_awarded: true, status: true, created_at: true, referred_user: { select: { username: true } } },
      orderBy: { created_at: 'desc' },
      take: 50,
    }),
    prisma.referral_point_events.aggregate({ where: { user_id: userId }, _sum: { points: true } }),
  ]);

  const code = user?.referral_code || await ensureReferralCode(userId);
  return {
    code,
    link: `${origin}/join?ref=${encodeURIComponent(code)}`,
    count: referralCount,
    points: points._sum.points ?? 0,
    referrals: referrals.map((referral) => ({
      id: referral.id,
      username: referral.referred_user.username,
      points: referral.points_awarded,
      status: referral.status,
      createdAt: referral.created_at.toISOString(),
    })),
  };
}
