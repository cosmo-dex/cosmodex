import { NextResponse, type NextRequest } from 'next/server';
import { verifySession, SESSION_COOKIE, type SessionPayload } from '@/lib/session';
import { checkRateLimit } from '@/lib/rateLimit';

const ADMIN_ROLE_ROUTES: Record<string, string[]> = {
  '/super-admin': ['super_admin'],
  '/learning-admin': ['super_admin', 'learning_admin'],
  '/arena-admin': ['super_admin', 'arena_admin'],
  '/battle-admin': ['super_admin', 'arena_admin'],
};

const PROTECTED_USER_ROUTES = [
  '/dashboard',
  '/learn',
  '/battle',
  '/coding',
  '/events',
  '/leaderboard',
  '/profile',
  '/victory',
];

const PROTECTED_API_PREFIXES = [
  '/api/user',
  '/api/battle',
  '/api/admin',
];

const BOT_USER_AGENTS =
  /googlebot|google-inspectiontool|mediapartners-google|feedfetcher-google|bingbot|yandex|baiduspider|duckduckbot|slurp|twitterbot|facebookexternalhit|linkedinbot|embedly|quora|whatsapp|applebot/i;

function isSearchEngineBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_USER_AGENTS.test(userAgent);
}

function getSafeRedirectUrl(target: string | null, fallback: string): string {
  if (!target) return fallback;
  if (target.startsWith('/') && !target.startsWith('//') && !target.includes('\\')) {
    return target;
  }
  return fallback;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const userAgent = request.headers.get('user-agent');

  // Never redirect search engine crawlers (Googlebot, Bingbot, etc.)
  if (isSearchEngineBot(userAgent)) {
    return NextResponse.next();
  }

  // Rate limit authentication endpoints to prevent brute-force attacks and function drains
  if (pathname.startsWith('/api/auth/')) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const rateLimitKey = `auth:${clientIp}`;
    const { success, resetInSeconds } = checkRateLimit(rateLimitKey, 20, 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(resetInSeconds),
          },
        }
      );
    }
  }

  const isProtectedApi =
    PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    !pathname.startsWith('/api/battle/leaderboard');

  const matchingAdminEntry = Object.entries(ADMIN_ROLE_ROUTES).find(([prefix]) =>
    pathname.startsWith(prefix)
  );

  const isProtectedUserRoute = PROTECTED_USER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isLoginModeOnboarding =
    pathname.startsWith('/onboarding') &&
    request.nextUrl.searchParams.get('mode') === 'login';

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    isLoginModeOnboarding;

  // Fast path: If the route is neither protected nor auth-related (e.g. public APIs, landing, etc.),
  // avoid reading cookies and calculating cryptographic HMAC verifications.
  if (!isProtectedApi && !matchingAdminEntry && !isProtectedUserRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  let user: SessionPayload | null = null;

  if (sessionCookie?.value) {
    try {
      user = await verifySession(sessionCookie.value);
    } catch {
      user = null;
    }
  }

  if (isProtectedApi) {
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (pathname.startsWith('/api/admin')) {
      const allowedAdminRoles = ['super_admin', 'learning_admin', 'arena_admin'];
      if (!user.role || !allowedAdminRoles.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    return NextResponse.next();
  }

  if (matchingAdminEntry) {
    const [, allowedRoles] = matchingAdminEntry;

    if (!user || !user.userId) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    const userRole = user.role || 'student';
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  }

  if (isProtectedUserRoute) {
    if (!user || !user.userId) {
      const fullPath = pathname + (search || '');
      const redirectUrl = new URL('/onboarding', request.url);
      redirectUrl.searchParams.set('mode', 'login');
      redirectUrl.searchParams.set('next', fullPath);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  if (user && user.userId && isAuthRoute) {
    const nextParam = request.nextUrl.searchParams.get('next');
    const destination = getSafeRedirectUrl(nextParam, '/dashboard');
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|lottie|json|css|js|woff|woff2|ttf|otf|map|txt|xml|webmanifest)$).*)',
  ],
};
