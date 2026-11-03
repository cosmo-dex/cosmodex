import { NextRequest, NextResponse } from 'next/server';
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE } from '@/lib/referrals';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('ref')?.trim().toUpperCase();
  const destination = new URL('/onboarding', request.url);
  const response = NextResponse.redirect(destination);

  if (code && /^[A-Z0-9]{6,20}$/.test(code)) {
    response.cookies.set(REFERRAL_COOKIE, code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: '/',
    });
  }

  return response;
}
