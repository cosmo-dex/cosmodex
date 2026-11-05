import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { getReferralSummary } from '@/lib/referrals';

export async function GET(request: NextRequest) {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const origin = request.nextUrl.origin;
    return NextResponse.json(await getReferralSummary(session.userId, origin), {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('[GET /api/referrals] Error:', error);
    return NextResponse.json({ error: 'Unable to load referral data.' }, { status: 500 });
  }
}
