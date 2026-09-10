import { NextResponse, type NextRequest } from 'next/server';
import { verifySession, SESSION_COOKIE, type SessionPayload } from '@/lib/session';

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
];

function getSafeRedirectUrl(target: string | null, fallback: string): string {
  if (!target) return fallback;
  if (target.startsWith('/') && !target.startsWith('//') && !target.includes('\\')) {
    return target;
  }
  return fallback;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const user: SessionPayload | null = await verifySession(sessionCookie?.value);

  const isProtectedApi =
    PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    !pathname.startsWith('/api/battle/leaderboard');
  if (isProtectedApi) {
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  }

  const isProtectedUserRoute = PROTECTED_USER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

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

  if (user && user.userId) {
    const isLoginModeOnboarding =
      pathname.startsWith('/onboarding') &&
      request.nextUrl.searchParams.get('mode') === 'login';

    const isAuthRoute =
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      isLoginModeOnboarding;

    if (isAuthRoute) {
      const nextParam = request.nextUrl.searchParams.get('next');
      const destination = getSafeRedirectUrl(nextParam, '/dashboard');
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|lottie|json|css|js)$).*)',
  ],
};
