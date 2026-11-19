import { NextRequest, NextResponse } from 'next/server';
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE } from '@/lib/referrals';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('ref')?.trim().toUpperCase();

  // Resolve external origin safely, avoiding internal container addresses (e.g., 0.0.0.0:3000)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const detectedOrigin = host && !host.includes('0.0.0.0') ? `${proto}://${host}` : request.nextUrl.origin;
  const rawBase = process.env.NEXT_PUBLIC_APP_URL || detectedOrigin;
  const baseOrigin = rawBase && !rawBase.includes('0.0.0.0') ? rawBase : 'https://cosmodex.in';

  const destination = new URL('/onboarding', baseOrigin);
  if (code && /^[A-Z0-9]{6,20}$/.test(code)) {
    destination.searchParams.set('ref', code);
  }

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
