import { NextRequest, NextResponse } from 'next/server';
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE } from '@/lib/referrals';

function isAllowedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === 'cosmodex.in' ||
    normalized.endsWith('.cosmodex.in')
  );
}

function resolveSafeBaseOrigin(request: NextRequest): string {
  const fallback = 'https://cosmodex.in';

  // 1. Prefer explicit, valid NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      const parsed = new URL(process.env.NEXT_PUBLIC_APP_URL);
      if (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        !parsed.hostname.includes('0.0.0.0')
      ) {
        return parsed.origin;
      }
    } catch {
      // Invalid URL in env var, fallback to safe resolution
    }
  }

  // 2. Validate request / forwarded host against allowed domains to prevent open redirects
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';

  if (host) {
    try {
      const parsed = new URL(`${proto}://${host}`);
      if (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        !parsed.hostname.includes('0.0.0.0') &&
        isAllowedHostname(parsed.hostname)
      ) {
        return parsed.origin;
      }
    } catch {
      // Ignore parsing errors for malformed headers
    }
  }

  // 3. Check request.nextUrl if hostname is allowed
  try {
    const nextUrl = request.nextUrl;
    if (
      (nextUrl.protocol === 'http:' || nextUrl.protocol === 'https:') &&
      !nextUrl.hostname.includes('0.0.0.0') &&
      isAllowedHostname(nextUrl.hostname)
    ) {
      return nextUrl.origin;
    }
  } catch {
    // Ignore
  }

  return fallback;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('ref')?.trim().toUpperCase();
  const baseOrigin = resolveSafeBaseOrigin(request);

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
