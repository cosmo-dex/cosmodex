'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export type AuthResult = {
  error?: string;
  success?: boolean;
  message?: string;
  hasSession?: boolean;
};

export type ExistenceResult = {
  exists: boolean;
  error?: string;
};

function buildUsername(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
}

function parseJson(raw: string): string[] {
  try {
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

export async function signUpUser(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const avatarId = formData.get('avatarId') as string;
  const experienceLevel = formData.get('experienceLevel') as string;
  const interestsRaw = formData.get('interests') as string;

  if (!email || !password || !username) {
    return { error: 'Email, password, and username are required.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        avatarId: avatarId || null,
        experienceLevel: experienceLevel || null,
        interests: parseJson(interestsRaw),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  const user = data.user;
  if (!user) {
    return { success: true, hasSession: false, message: 'Check your email to confirm your account.' };
  }

  try {
    await prisma.users.upsert({
      where: { email },
      update: {
        username: buildUsername(username),
        avatar_url: avatarId || null,
        last_login_at: new Date(),
      },
      create: {
        id: user.id,
        email,
        username: buildUsername(username),
        auth_provider: 'email',
        avatar_url: avatarId || null,
        role: 'student',
        last_login_at: new Date(),
      },
    });
  } catch (dbError) {
    console.error('[signUpUser] DB sync failed:', dbError);
  }

  const hasSession = !!data.session;

  return {
    success: true,
    hasSession,
    message: hasSession
      ? 'Account created!'
      : 'Account created! Please check your email to verify before logging in.',
  };
}

export async function signInUser(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Invalid credentials or account inactive.' };
  }

  try {
    await prisma.users.updateMany({
      where: { email },
      data: { last_login_at: new Date() },
    });
  } catch {
  }

  return { success: true };
}

export async function saveOnboardingProfile(
  avatarId: string,
  experienceLevel: string,
  interests: string[]
): Promise<AuthResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated. Please log in again.' };
  }

  const { error: metaError } = await supabase.auth.updateUser({
    data: { avatarId, experienceLevel, interests },
  });

  if (metaError) {
    return { error: metaError.message };
  }

  try {
    await prisma.users.update({
      where: { id: user.id },
      data: { avatar_url: avatarId || null },
    });
  } catch (dbError) {
    console.error('[saveOnboardingProfile] DB sync failed (non-fatal):', dbError);
  }

  return { success: true };
}

export async function checkEmailExists(email: string): Promise<ExistenceResult> {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true },
    });
    return { exists: !!user };
  } catch (err) {
    return { exists: false, error: String(err) };
  }
}

export async function checkUsernameExists(username: string): Promise<ExistenceResult> {
  try {
    const user = await prisma.users.findFirst({
      where: { username },
      select: { id: true },
    });
    return { exists: !!user };
  } catch (err) {
    return { exists: false, error: String(err) };
  }
}
