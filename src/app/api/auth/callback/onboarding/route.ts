import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

type OnboardingPayload = {
  avatarId?: string;
  experienceLevel?: string;
  interests?: string[];
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: OnboardingPayload = await req.json();

  try {
    await prisma.users.update({
      where: { id: user.id },
      data: {
        avatar_url: body.avatarId ?? undefined,
        last_login_at: new Date(),
      },
    });
  } catch (err) {
    console.error('[onboarding] DB update failed:', err);
    return NextResponse.json({ error: 'Failed to save profile.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}