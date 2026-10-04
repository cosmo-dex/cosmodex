import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import prisma from "@/lib/prisma";
import { recordStudentCompletion, invalidateLearningCache, resolveModule } from "@/lib/learningService";

const COOLDOWN_MS = 30 * 1000; // 30 seconds (temporary test mode)
const PASS_THRESHOLD = 3;

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);
    if (!session?.userId) return NextResponse.json({ authenticated: false });

    const moduleId = req.nextUrl.searchParams.get("moduleId");
    const courseCode = req.nextUrl.searchParams.get("courseCode") || req.nextUrl.searchParams.get("course") || undefined;
    if (!moduleId) return NextResponse.json({ error: "moduleId required" }, { status: 400 });

    const resolvedMod = await resolveModule(moduleId, courseCode);
    const resolvedModuleId = resolvedMod?.id || moduleId;

    const lastAttempt = await prisma.quiz_attempts.findFirst({
      where: { user_id: session.userId, module_id: resolvedModuleId },
      orderBy: { attempted_at: "desc" },
    });

    if (!lastAttempt) return NextResponse.json({ hasAttempt: false, canRetry: true });

    const elapsed = Date.now() - new Date(lastAttempt.attempted_at).getTime();
    const cooldownRemaining = lastAttempt.passed ? 0 : Math.max(0, COOLDOWN_MS - elapsed);

    return NextResponse.json({
      hasAttempt: true,
      passed: lastAttempt.passed,
      score: lastAttempt.score,
      total: lastAttempt.total,
      attemptedAt: lastAttempt.attempted_at,
      canRetry: lastAttempt.passed || cooldownRemaining === 0,
      cooldownRemainingMs: cooldownRemaining,
    });
  } catch (err) {
    console.error("[quiz-attempt GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const session = await verifySession(sessionCookie?.value);
    if (!session?.userId) return NextResponse.json({ authenticated: false, message: "Guest session" });

    const body = await req.json() as { moduleId: string; score: number; total: number; courseCode?: string };
    const { moduleId, score, total, courseCode } = body;
    if (!moduleId || score === undefined || !total) {
      return NextResponse.json({ error: "moduleId, score, total required" }, { status: 400 });
    }

    const resolvedMod = await resolveModule(moduleId, courseCode);
    const resolvedModuleId = resolvedMod?.id || moduleId;

    const lastFailed = await prisma.quiz_attempts.findFirst({
      where: { user_id: session.userId, module_id: resolvedModuleId, passed: false },
      orderBy: { attempted_at: "desc" },
    });

    if (lastFailed) {
      const elapsed = Date.now() - new Date(lastFailed.attempted_at).getTime();
      if (elapsed < COOLDOWN_MS) {
        return NextResponse.json({
          success: false,
          cooldownActive: true,
          cooldownRemainingMs: COOLDOWN_MS - elapsed,
          message: "Quiz locked — 30-minute cooldown active",
        }, { status: 429 });
      }
    }

    const passed = score >= PASS_THRESHOLD;
    await prisma.quiz_attempts.create({
      data: { user_id: session.userId, module_id: resolvedModuleId, score, total, passed },
    });

    if (passed) {
      await recordStudentCompletion({
        userId: session.userId,
        moduleId: resolvedModuleId,
        courseCode,
        isStationComplete: true,
        xpEarned: 0,
      });
    } else {
      invalidateLearningCache(courseCode);
    }

    return NextResponse.json({
      success: true,
      passed,
      score,
      total,
      cooldownActive: !passed,
      cooldownRemainingMs: passed ? 0 : COOLDOWN_MS,
      passThreshold: PASS_THRESHOLD,
    });
  } catch (err) {
    console.error("[quiz-attempt POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
