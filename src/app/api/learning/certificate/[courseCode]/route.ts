import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { getStudentProgress, normalizeCourseSlug } from '@/lib/learningService';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseCode: string }> }
) {
  try {
    const { courseCode } = await params;
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);

    const normCourse = normalizeCourseSlug(courseCode);

    const courseMap: Record<string, string> = {
      python: 'Python Programming Masterclass',
      html: 'HTML5 & Web Architecture',
    };
    const courseTitle = courseMap[normCourse] || `${normCourse.toUpperCase()} Track`;

    if (!session || !session.userId) {
      return NextResponse.json({
        authenticated: false,
        eligible: false,
        courseCode: normCourse,
        courseTitle,
        message: 'Authentication required to claim certificate',
      });
    }

    const progress = await getStudentProgress(session.userId, normCourse);
    if (!progress) {
      return NextResponse.json({
        authenticated: true,
        eligible: false,
        courseCode: normCourse,
        courseTitle,
        totalModules: 0,
        completedModules: 0,
      });
    }

    const isEligible =
      progress.totalModules > 0 &&
      progress.totalCompletedModules >= progress.totalModules;

    const latestCompletion = await prisma.module_completions.findFirst({
      where: {
        user_id: session.userId,
        modules: {
          languages: {
            code: normCourse,
          },
        },
      },
      orderBy: {
        completed_at: 'desc',
      },
    });

    const user = await prisma.users.findUnique({
      where: { id: session.userId },
      select: { username: true, email: true, xp_total: true },
    });

    const certHash = Buffer.from(`${session.userId}-${normCourse}`).toString('hex').slice(0, 8).toUpperCase();
    const certificateId = `CDX-${normCourse.slice(0, 2).toUpperCase()}-${certHash}`;

    return NextResponse.json({
      authenticated: true,
      eligible: isEligible,
      courseCode: normCourse,
      courseTitle,
      username: user?.username || session.username || 'Explorer',
      totalModules: progress.totalModules,
      completedModules: progress.totalCompletedModules,
      completedAt: latestCompletion?.completed_at || new Date().toISOString(),
      xpEarned: progress.user?.xpTotal || user?.xp_total || 0,
      certificateId,
    });
  } catch (error) {
    console.error('[api/learning/certificate GET] Error:', error);
    return NextResponse.json({ error: 'Failed to verify certificate eligibility' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseCode: string }> }
) {
  try {
    const { courseCode } = await params;
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);

    const normCourse = normalizeCourseSlug(courseCode);

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const fullName = String(body.fullName || '').trim();

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Valid full name is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      courseCode: normCourse,
      fullName,
    });
  } catch (error) {
    console.error('[api/learning/certificate POST] Error:', error);
    return NextResponse.json({ error: 'Failed to save certificate recipient' }, { status: 500 });
  }
}

