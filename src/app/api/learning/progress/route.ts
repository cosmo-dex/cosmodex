import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/session';
import { getStudentProgress, recordStudentCompletion } from '@/lib/learningService';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);

    if (!session || !session.userId) {
      return NextResponse.json({ authenticated: false, progress: null });
    }

    const { searchParams } = req.nextUrl;
    const courseCode = searchParams.get('course') || 'python';

    const progress = await getStudentProgress(session.userId, courseCode);

    return NextResponse.json({
      authenticated: true,
      userId: session.userId,
      progress,
    });
  } catch (error) {
    console.error('[api/learning/progress GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);

    const body = await req.json();
    const { moduleId, questionId, xpEarned, isStationComplete } = body as {
      moduleId: string;
      questionId?: string;
      xpEarned?: number;
      isStationComplete?: boolean;
    };

    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }

    if (!session || !session.userId) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        message: 'Guest session — progress saved locally',
      });
    }

    const result = await recordStudentCompletion({
      userId: session.userId,
      moduleId,
      questionId,
      xpEarned: Number(xpEarned || 0),
      isStationComplete,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to record progress' }, { status: 500 });
    }

    const updatedProgress = await getStudentProgress(session.userId, 'python');

    return NextResponse.json({
      success: true,
      authenticated: true,
      progress: updatedProgress,
      message: 'Progress saved successfully',
    });
  } catch (error) {
    console.error('[api/learning/progress POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
