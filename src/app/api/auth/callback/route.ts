import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

function buildUsername(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
}

function getRedirectUrl(request: Request, path: string): string {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocal = process.env.NODE_ENV === 'development';

  if (isLocal || !forwardedHost) {
    return `${origin}${path}`;
  }

  return `https://${forwardedHost}${path}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(getRedirectUrl(request, '/auth/auth-code-error'));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[OAuth Callback] Code exchange failed:', error?.message);
    return NextResponse.redirect(getRedirectUrl(request, '/auth/auth-code-error'));
  }

  const user = data.user;
  const email = user.email!;
  const rawUsername =
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    user.user_metadata?.full_name?.replace(/\s+/g, '_').toLowerCase() ||
    email.split('@')[0];

  try {
    await prisma.users.upsert({
      where: { email },
      update: {
        auth_provider: user.app_metadata?.provider || 'oauth',
        avatar_url: user.user_metadata?.avatar_url || null,
        last_login_at: new Date(),
      },
      create: {
        id: user.id,
        email,
        username: buildUsername(rawUsername),
        auth_provider: user.app_metadata?.provider || 'oauth',
        avatar_url: user.user_metadata?.avatar_url || null,
        role: 'student',
        last_login_at: new Date(),
      },
    });
  } catch (dbError) {
    console.error('[OAuth Callback] DB sync failed (non-fatal):', dbError);
  }

  return NextResponse.redirect(getRedirectUrl(request, next));
}
