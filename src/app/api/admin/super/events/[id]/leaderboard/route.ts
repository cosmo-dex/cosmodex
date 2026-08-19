import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifyAdminSession } from '@/lib/adminAuth';

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionItem {
  id: string;
  type: 'mcq' | 'coding';
  title: string;
  marks?: number;
  points?: number;
  options?: MCQOption[];
  questionText?: string;
  codeSnippet?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAdminSession(req, ['super_admin']);
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  try {
    const event = await prisma.events.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      select: {
        id: true,
        title: true,
        status: true,
        submission_config: true,
        results_published: true,
        _count: { select: { event_registrations: true } },
      },
    });

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const leaderboard = await prisma.event_leaderboard.findMany({
      where: { event_id: event.id },
      include: { users: { select: { id: true, username: true, email: true, avatar_url: true } } },
      orderBy: [{ rank: 'asc' }, { score: 'desc' }],
    });

    const subConfig = (event.submission_config as Record<string, unknown>) || {};
    const assessmentDetails = (subConfig.assessment_details as Record<string, unknown>) || {};
    const questions = (assessmentDetails.questions as QuestionItem[]) || [];

    return NextResponse.json({
      leaderboard,
      questions,
      resultsPublished: Boolean(event.results_published || (subConfig.results_published as boolean)),
      totalRegistrations: event._count.event_registrations,
    });
  } catch (err) {
    console.error('[GET /api/admin/super/events/[id]/leaderboard] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAdminSession(req, ['super_admin']);
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  try {
    const event = await prisma.events.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      select: { id: true, submission_config: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, questions, entries } = body as {
      action?: 'evaluate' | 'manual_update';
      questions?: QuestionItem[];
      entries?: { userId: string; score: number; metadata_json?: object }[];
    };

    if (action === 'evaluate' || questions) {
      const activeQuestions: QuestionItem[] = questions || [];

      const currentConfig = (event.submission_config as Record<string, unknown>) || {};
      const currentAssessment = (currentConfig.assessment_details as Record<string, unknown>) || {};

      const updatedConfig = {
        ...currentConfig,
        assessment_details: {
          ...currentAssessment,
          questions: activeQuestions,
        },
      };

      await prisma.events.update({
        where: { id: event.id },
        data: { submission_config: updatedConfig as unknown as Prisma.InputJsonValue },
      });

      const registrations = await prisma.event_registrations.findMany({
        where: {
          event_id: event.id,
          status: { notIn: ['disqualified', 'withdrawn'] },
        },
        include: {
          users: { select: { id: true, username: true, email: true, avatar_url: true } },
        },
      });

      // 3. Evaluate each candidate
      const evaluationResults: {
        userId: string;
        score: number;
        totalTimeSeconds: number;
        metadata_json: Record<string, unknown>;
      }[] = [];

      for (const reg of registrations) {
        const details = (reg.submission_details_json as Record<string, unknown>) || {};
        const mcqAnswers = (details.mcqAnswers as Record<string, unknown>) || {};
        const codeAnswers = (details.codeAnswers as Record<string, string>) || {};
        const questionTimes = (details.questionTimes as Record<string, number>) || {};
        let totalTimeSeconds = Number(details.totalTimeSeconds) || 0;

        if (!totalTimeSeconds) {
          totalTimeSeconds = Object.values(questionTimes).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
        }

        let totalScore = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let partialCount = 0;
        const breakdown: {
          questionId: string;
          type: string;
          title: string;
          status: 'correct' | 'partial' | 'wrong' | 'unattempted' | 'submitted';
          pointsEarned: number;
          maxPoints: number;
          timeSpentSec: number;
          chosenOptions: string[];
          correctOptions: string[];
        }[] = [];

        for (const q of activeQuestions) {
          const timeSpentSec = Number(questionTimes[q.id]) || 0;

          if (q.type === 'mcq') {
            const rawChosen = mcqAnswers[q.id];
            let chosenList: string[] = [];
            if (Array.isArray(rawChosen)) {
              chosenList = rawChosen.map(String);
            } else if (typeof rawChosen === 'string' && rawChosen.trim().length > 0) {
              chosenList = rawChosen.split(',').map(s => s.trim()).filter(Boolean);
            }

            const options = q.options || [];
            const correctOptIds = options.filter(o => o.isCorrect).map(o => o.id);
            const wrongOptIds = options.filter(o => !o.isCorrect).map(o => o.id);
            const qMarks = Number(q.marks || q.points) || 10;

            if (chosenList.length === 0) {
              breakdown.push({
                questionId: q.id,
                type: 'mcq',
                title: q.title,
                status: 'unattempted',
                pointsEarned: 0,
                maxPoints: qMarks,
                timeSpentSec,
                chosenOptions: [],
                correctOptions: correctOptIds,
              });
            } else {
              // Rule: If any chosen option is wrong -> score is 0
              const hasWrongSelection = chosenList.some(optId => wrongOptIds.includes(optId) || !correctOptIds.includes(optId));

              if (hasWrongSelection) {
                wrongCount++;
                breakdown.push({
                  questionId: q.id,
                  type: 'mcq',
                  title: q.title,
                  status: 'wrong',
                  pointsEarned: 0,
                  maxPoints: qMarks,
                  timeSpentSec,
                  chosenOptions: chosenList,
                  correctOptions: correctOptIds,
                });
              } else {
                // All selected options are correct! Calculate proportional score:
                const correctChosenCount = chosenList.filter(optId => correctOptIds.includes(optId)).length;
                const totalCorrectCount = correctOptIds.length || 1;
                const proportion = correctChosenCount / totalCorrectCount;
                const pointsEarned = Math.round(proportion * qMarks);

                totalScore += pointsEarned;
                if (correctChosenCount === totalCorrectCount) {
                  correctCount++;
                  breakdown.push({
                    questionId: q.id,
                    type: 'mcq',
                    title: q.title,
                    status: 'correct',
                    pointsEarned,
                    maxPoints: qMarks,
                    timeSpentSec,
                    chosenOptions: chosenList,
                    correctOptions: correctOptIds,
                  });
                } else {
                  partialCount++;
                  breakdown.push({
                    questionId: q.id,
                    type: 'mcq',
                    title: q.title,
                    status: 'partial',
                    pointsEarned,
                    maxPoints: qMarks,
                    timeSpentSec,
                    chosenOptions: chosenList,
                    correctOptions: correctOptIds,
                  });
                }
              }
            }
          } else if (q.type === 'coding') {
            const code = codeAnswers[q.id];
            const qPoints = Number(q.points || q.marks) || 50;
            if (code && code.trim().length > 30) {
              totalScore += qPoints;
              correctCount++;
              breakdown.push({
                questionId: q.id,
                type: 'coding',
                title: q.title,
                status: 'submitted',
                pointsEarned: qPoints,
                maxPoints: qPoints,
                timeSpentSec,
                chosenOptions: [],
                correctOptions: [],
              });
            } else {
              breakdown.push({
                questionId: q.id,
                type: 'coding',
                title: q.title,
                status: 'unattempted',
                pointsEarned: 0,
                maxPoints: qPoints,
                timeSpentSec,
                chosenOptions: [],
                correctOptions: [],
              });
            }
          }
        }

        const metadata = {
          totalTimeSeconds,
          totalQuestions: activeQuestions.length,
          correctCount,
          wrongCount,
          partialCount,
          breakdown,
          evaluatedAt: new Date().toISOString(),
        };

        evaluationResults.push({
          userId: reg.user_id,
          score: totalScore,
          totalTimeSeconds,
          metadata_json: metadata,
        });
      }

      // 4. Sort participants: Primary = Score DESC, Secondary = Total Time ASC
      evaluationResults.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.totalTimeSeconds - b.totalTimeSeconds;
      });

      // 5. Upsert to event_leaderboard with ranks
      await Promise.all(
        evaluationResults.map((item, idx) =>
          prisma.event_leaderboard.upsert({
            where: { event_id_user_id: { event_id: event.id, user_id: item.userId } },
            create: {
              event_id: event.id,
              user_id: item.userId,
              score: item.score,
              rank: idx + 1,
              metadata_json: item.metadata_json as Prisma.InputJsonValue,
              updated_at: new Date(),
            },
            update: {
              score: item.score,
              rank: idx + 1,
              metadata_json: item.metadata_json as Prisma.InputJsonValue,
              updated_at: new Date(),
            },
          }),
        ),
      );

      const updatedLb = await prisma.event_leaderboard.findMany({
        where: { event_id: event.id },
        include: { users: { select: { id: true, username: true, email: true, avatar_url: true } } },
        orderBy: [{ rank: 'asc' }, { score: 'desc' }],
      });

      return NextResponse.json({
        success: true,
        message: `Successfully evaluated ${evaluationResults.length} candidate submissions!`,
        leaderboard: updatedLb,
      });
    }

    // ── CASE 2: MANUAL OVERRIDES ─────────────────────────────────────────────
    if (entries && Array.isArray(entries) && entries.length > 0) {
      await Promise.all(
        entries.map((e) =>
          prisma.event_leaderboard.upsert({
            where: { event_id_user_id: { event_id: event.id, user_id: e.userId } },
            create: {
              event_id: event.id,
              user_id: e.userId,
              score: e.score,
              metadata_json: e.metadata_json ?? {},
              updated_at: new Date(),
            },
            update: {
              score: e.score,
              metadata_json: e.metadata_json ?? {},
              updated_at: new Date(),
            },
          }),
        ),
      );

      const allEntries = await prisma.event_leaderboard.findMany({
        where: { event_id: event.id },
        orderBy: { score: 'desc' },
        select: { id: true, score: true },
      });

      await Promise.all(
        allEntries.map((entry, idx) =>
          prisma.event_leaderboard.update({
            where: { id: entry.id },
            data: { rank: idx + 1 },
          }),
        ),
      );

      const updated = await prisma.event_leaderboard.findMany({
        where: { event_id: event.id },
        include: { users: { select: { id: true, username: true, email: true, avatar_url: true } } },
        orderBy: { rank: 'asc' },
      });

      return NextResponse.json({ leaderboard: updated });
    }

    return NextResponse.json({ error: 'Valid evaluation questions or entries required' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/admin/super/events/[id]/leaderboard] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
