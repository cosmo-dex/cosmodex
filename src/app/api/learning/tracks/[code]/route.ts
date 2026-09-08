import { NextRequest, NextResponse } from 'next/server';
import { getCourseCurriculum } from '@/lib/learningService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { code } = await params;
  const courseCode = code?.toLowerCase() || 'python';
  const bypassCache =
    req.nextUrl.searchParams.get('fresh') === 'true' ||
    req.headers.get('cache-control')?.includes('no-cache');

  try {
    const chapters = await getCourseCurriculum(courseCode, { bypassCache });

    const totalExercises = chapters.reduce(
      (acc, ch) => acc + (ch.exercises ? ch.exercises.length : 0),
      0
    );

    const totalXp = chapters.reduce((acc, ch) => acc + (ch.xpValue || 0), 0);

    return NextResponse.json(
      {
        success: true,
        courseCode,
        chapters,
        totalExercises,
        totalXp,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=5, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error(`[api/learning/tracks/${courseCode}] Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch course curriculum' }, { status: 500 });
  }
}
