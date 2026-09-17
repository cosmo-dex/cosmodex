import prisma from '@/lib/prisma';
import { Chapter, Exercise } from '@/components/learn/pythonData';
import { TheoryExercise } from '@/data/theoryExercisesData';

interface TopicContent {
  title?: string;
  sections?: Array<{ heading?: string; content: string[] }>;
  codeExamples?: Array<{ title: string; input: string; output: string; explanation: string }>;
  practiceQuestion?: {
    title: string;
    description: string;
    input: string;
    output: string;
    explanation: string;
  };
  mcqs?: Array<{
    id: string;
    question: string;
    codeSnippet?: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }>;
  planetType?: Chapter['planetType'];
  stationNumber?: string;
  xpValue?: number;
  theoryLessonId?: string;
}

interface QuestionTestCase {
  initialCode?: string;
  title?: string;
  numberLabel?: string;
  hints?: string[];
  options?: string[];
  correctAnswerIndex?: number;
  explanation?: string;
  codeSnippet?: string;
}

interface StudentProgressResult {
  enrolled: boolean;
  enrolledAt?: Date | null;
  completedModuleIds: string[];
  completedStationSlugs: string[];
  completedStationNumbers: number[];
  completedQuestionIds: string[];
  totalCompletedExercises: number;
  totalExercises: number;
  totalCompletedModules: number;
  totalModules: number;
  totalMilestoneProjects: number;
  completedMilestoneProjects: number;
  user: {
    username: string;
    avatarUrl: string;
    xpTotal: number;
    level: number;
  };
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const curriculumCache = new Map<string, CacheItem<Chapter[]>>();
const theoryCache = new Map<string, CacheItem<TheoryExercise | null>>();
const progressCache = new Map<string, CacheItem<StudentProgressResult>>();

const CURRICULUM_CACHE_TTL = 600000; // 10 minutes in-memory
const THEORY_CACHE_TTL = 600000; // 10 minutes in-memory
const PROGRESS_CACHE_TTL = 30000; // 30 seconds

export function invalidateLearningCache(courseCode?: string) {
  if (courseCode) {
    curriculumCache.delete(courseCode.toLowerCase());
  } else {
    curriculumCache.clear();
  }
  theoryCache.clear();
  progressCache.clear();
}

async function loadCurriculumFromDb(courseCode: string): Promise<Chapter[]> {
  try {
    const modules = await prisma.modules.findMany({
      where: {
        is_published: true,
        languages: { code: courseCode },
      },
      orderBy: { module_number: 'asc' },
      select: {
        id: true,
        module_number: true,
        title: true,
        description: true,
        icon_svg: true,
        topics: {
          where: { is_published: true },
          orderBy: { display_order: 'asc' },
          take: 1,
          select: {
            title: true,
            content_json: true,
          },
        },
        _count: {
          select: {
            questions: {
              where: { question_type: { not: 'mcq' } },
            },
          },
        },
      },
    });

    if (modules.length > 0) {
      return modules.map((mod) => {
        const topic = mod.topics[0];
        const content = (topic?.content_json as TopicContent) || {};
        const isMilestone = Boolean(content.theoryLessonId?.includes('milestone') || mod.module_number === 5 || mod.module_number === 10);
        const totalEx = mod._count?.questions ?? 0;

        const exercises: Exercise[] = Array.from({ length: totalEx }, (_, idx) => ({
          id: `${mod.id}-ex-${idx + 1}`,
          numberLabel: `Exercise ${idx + 1}`,
          title: `Exercise ${idx + 1}`,
          isUnlocked: true,
          isCompleted: false,
        }));

        let stationId = content.theoryLessonId;
        if (!stationId) {
          stationId = mod.module_number === 5 ? 'milestone-1' : mod.module_number === 10 ? 'milestone-2' : `ch-${mod.module_number}`;
        }

        let stationNumber = content.stationNumber;
        if (!stationNumber) {
          if (isMilestone) {
            stationNumber = (mod.module_number === 10 || mod.module_number === modules.length) ? 'CAPSTONE 02' : 'CHECKPOINT 01';
          } else {
            stationNumber = `STATION ${String(mod.module_number).padStart(2, '0')}`;
          }
        }

        return {
          id: stationId,
          number: mod.module_number,
          stationNumber,
          title: mod.title,
          description: mod.description || '',
          xpValue: content.xpValue || (isMilestone ? 120 : 55),
          planetType: (mod.icon_svg as Chapter['planetType']) || content.planetType || (isMilestone ? 'grid-web' : 'green-crater'),
          isMilestone,
          isUnlocked: true,
          isCompleted: false,
          isCurrent: mod.module_number === 1,
          theoryLessonId: content.theoryLessonId || stationId,
          documentation: topic
            ? {
                title: topic.title,
                sections: (content.sections || []).map((sec) => ({
                  heading: sec.heading,
                  content: [],
                })),
              }
            : undefined,
          exercises,
        };
      });
    }
  } catch (error) {
    console.error('[learningService.loadCurriculumFromDb] Error:', error);
  }
  return [];
}

export async function getCourseCurriculum(
  courseCode: string = 'python',
  options?: { bypassCache?: boolean }
): Promise<Chapter[]> {
  const normCourse = courseCode.toLowerCase();
  const now = Date.now();

  if (!options?.bypassCache) {
    const cached = curriculumCache.get(normCourse);
    if (cached) {
      if (now - cached.timestamp < CURRICULUM_CACHE_TTL) {
        return cached.data;
      }
      loadCurriculumFromDb(normCourse)
        .then((fresh) => {
          if (fresh.length > 0) {
            curriculumCache.set(normCourse, { data: fresh, timestamp: Date.now() });
          }
        })
        .catch(() => {});
      return cached.data;
    }
  }

  const fresh = await loadCurriculumFromDb(normCourse);
  if (fresh.length > 0) {
    curriculumCache.set(normCourse, { data: fresh, timestamp: Date.now() });
  }
  return fresh;
}

async function loadTheoryExerciseFromDb(
  normCourse: string,
  lessonId: string
): Promise<TheoryExercise | null> {
  try {
    const modules = await prisma.modules.findMany({
      where: {
        is_published: true,
        languages: { code: normCourse },
      },
      orderBy: { module_number: 'asc' },
      include: {
        languages: { select: { name: true, code: true } },
        topics: {
          where: { is_published: true },
          orderBy: { display_order: 'asc' },
          take: 1,
        },
        questions: {
          where: { question_type: 'mcq' },
          orderBy: { display_order: 'asc' },
        },
      },
    });

    const targetIndex = modules.findIndex((m) => {
      const topic = m.topics[0];
      const content = (topic?.content_json as TopicContent) || {};
      const stationNum = String(m.module_number);
      const normLessonId = lessonId.replace('station-', '').replace('station', '').replace('ch-', '').replace('ch', '');

      if (content.theoryLessonId === lessonId || m.id === lessonId) {
        return true;
      }

      if (
        normLessonId === stationNum ||
        String(m.module_number).padStart(2, '0') === lessonId ||
        `ch-${m.module_number}` === lessonId ||
        `ch-${String(m.module_number).padStart(2, '0')}` === lessonId
      ) {
        return true;
      }

      if (!content.theoryLessonId) {
        if (lessonId === 'milestone-1' && m.module_number === 5) return true;
        if (lessonId === 'milestone-2' && m.module_number === 10) return true;
      }

      return false;
    });

    if (targetIndex !== -1) {
      const mod = modules[targetIndex];
      const prevMod = modules[targetIndex - 1];
      const nextMod = modules[targetIndex + 1];

      const topic = mod.topics[0];
      const content = (topic?.content_json as TopicContent) || {};

      const mcqs = mod.questions.map((q) => {
        const testCase = (q.test_cases_json as QuestionTestCase) || {};
        return {
          id: q.id,
          question: q.problem_text,
          codeSnippet: testCase.codeSnippet || '',
          options: testCase.options || ['A', 'B', 'C', 'D'],
          correctAnswerIndex: Number(testCase.correctAnswerIndex ?? 0),
          explanation: testCase.explanation || '',
        };
      });

      const getLessonSlug = (m?: typeof mod) => {
        if (!m) return undefined;
        const t = m.topics[0];
        const c = (t?.content_json as TopicContent) || {};
        return c.theoryLessonId || (m.module_number === 5 ? 'milestone-1' : m.module_number === 10 ? 'milestone-2' : `ch-${m.module_number}`);
      };

      const sections = (content.sections || []).map((sec, i) => ({
        id: `sec-${i + 1}`,
        heading: sec.heading,
        content: sec.content,
        bulletPoints: (sec as { bulletPoints?: string[] }).bulletPoints || [],
        illustration: 'command-line' as const,
      }));

      const courseTitle =
        mod.languages?.name ||
        normCourse.charAt(0).toUpperCase() + normCourse.slice(1);

      return {
        id: lessonId,
        courseId: normCourse,
        courseTitle,
        chapterNumber: String(mod.module_number).padStart(2, '0'),
        title: topic?.title || mod.title,
        exerciseIndex: mod.module_number,
        totalExercises: modules.length,
        xp: content.xpValue || (mod.module_number === 5 || mod.module_number === 10 ? 120 : 55),
        category: 'Exercise',
        activeGrindersCount: 4,
        prevLessonId: getLessonSlug(prevMod),
        nextLessonId: getLessonSlug(nextMod),
        codeExamples: content.codeExamples || [],
        practiceQuestion: content.practiceQuestion,
        mcqs: mcqs.length > 0 ? mcqs : content.mcqs || [],
        sections,
      };
    }
  } catch (error) {
    console.error('[learningService.loadTheoryExerciseFromDb] Error:', error);
  }
  return null;
}

export async function getTheoryExercise(
  courseId: string,
  lessonId: string,
  options?: { bypassCache?: boolean }
): Promise<TheoryExercise | null> {
  const normCourse = courseId === 'py-1' ? 'python' : courseId.toLowerCase();
  const cacheKey = `${normCourse}:${lessonId.toLowerCase()}`;
  const now = Date.now();

  if (!options?.bypassCache) {
    const cached = theoryCache.get(cacheKey);
    if (cached) {
      if (now - cached.timestamp < THEORY_CACHE_TTL) {
        return cached.data;
      }
      loadTheoryExerciseFromDb(normCourse, lessonId)
        .then((fresh) => {
          if (fresh) {
            theoryCache.set(cacheKey, { data: fresh, timestamp: Date.now() });
          }
        })
        .catch(() => {});
      return cached.data;
    }
  }

  const result = await loadTheoryExerciseFromDb(normCourse, lessonId);
  if (result) {
    theoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
  }
  return result;
}

export async function getStudentProgress(userId: string, courseCode: string = 'python') {
  const normCourse = courseCode.toLowerCase();
  const cacheKey = `${userId}:${normCourse}`;
  const now = Date.now();
  const cached = progressCache.get(cacheKey);

  if (cached && now - cached.timestamp < PROGRESS_CACHE_TTL) {
    return cached.data;
  }

  try {
    const [enrollment, completions, progressList, user, modules] = await Promise.all([
      prisma.enrollments.findFirst({
        where: { user_id: userId, languages: { code: normCourse } },
      }),
      prisma.module_completions.findMany({
        where: { user_id: userId },
      }),
      prisma.progress.findMany({
        where: { user_id: userId, is_correct: true },
      }),
      prisma.users.findUnique({
        where: { id: userId },
        select: { xp_total: true, level: true, username: true, avatar_url: true },
      }),
      prisma.modules.findMany({
        where: { is_published: true, languages: { code: normCourse } },
        select: {
          id: true,
          module_number: true,
          topics: {
            where: { is_published: true },
            take: 1,
            select: { content_json: true },
          },
          _count: {
            select: {
              questions: { where: { question_type: { not: 'mcq' } } },
            },
          },
        },
      }),
    ]);

    const completedModuleIdSet = new Set(completions.map((c) => c.module_id));
    const completedQuestionIdSet = new Set(progressList.map((p) => p.question_id));

    const completedStationSlugs: string[] = [];
    const completedStationNumbers: number[] = [];

    modules.forEach((mod) => {
      if (completedModuleIdSet.has(mod.id)) {
        completedStationNumbers.push(mod.module_number);
        completedStationSlugs.push(String(mod.module_number));
        completedStationSlugs.push(`station-${mod.module_number}`);
        completedStationSlugs.push(`ch-${mod.module_number}`);
        if (mod.module_number === 5) completedStationSlugs.push('milestone-1');
        if (mod.module_number === 10) completedStationSlugs.push('milestone-2');
        const topic = mod.topics[0];
        const content = (topic?.content_json as TopicContent) || {};
        if (content.theoryLessonId) {
          completedStationSlugs.push(content.theoryLessonId);
        }
      }
    });

    const totalExercises = modules.reduce((acc, m) => acc + (m._count?.questions ?? 0), 0);
    const totalMilestoneProjects = modules.filter((m) => m.module_number === 5 || m.module_number === 10).length;
    const completedMilestoneProjects = modules.filter(
      (m) => (m.module_number === 5 || m.module_number === 10) && completedModuleIdSet.has(m.id)
    ).length;

    const result = {
      enrolled: Boolean(enrollment),
      enrolledAt: enrollment?.enrolled_at,
      completedModuleIds: Array.from(completedModuleIdSet),
      completedStationSlugs: Array.from(new Set(completedStationSlugs)),
      completedStationNumbers,
      completedQuestionIds: Array.from(completedQuestionIdSet),
      totalCompletedExercises: progressList.length,
      totalExercises,
      totalCompletedModules: completions.length,
      totalModules: modules.length,
      totalMilestoneProjects,
      completedMilestoneProjects,
      user: {
        username: user?.username || 'Explorer',
        avatarUrl: user?.avatar_url || '/images/avatars/nebula.webp',
        xpTotal: user?.xp_total || 0,
        level: user?.level || 1,
      },
    };

    progressCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('[learningService.getStudentProgress] Error:', error);
    return null;
  }
}

export async function recordStudentCompletion(params: {
  userId: string;
  moduleId: string;
  questionId?: string;
  xpEarned?: number;
  isStationComplete?: boolean;
}) {
  const { userId, moduleId, questionId, isStationComplete } = params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let resolvedModuleId = moduleId;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(moduleId);

      if (!isUuid) {
        const allMods = await tx.modules.findMany({
          include: { topics: true },
        });
        
        const matchedMod = allMods.find((m) => {
          const t = m.topics[0];
          const c = (t?.content_json as TopicContent) || {};
          return c.theoryLessonId === moduleId || m.id === moduleId;
        });

        if (matchedMod) {
          resolvedModuleId = matchedMod.id;
        } else {
          const modNum = parseInt(moduleId.replace(/\D/g, ''), 10);
          if (!isNaN(modNum)) {
            const numMod = await tx.modules.findFirst({
              where: { module_number: modNum },
            });
            if (numMod) resolvedModuleId = numMod.id;
          }
        }
      }

      if (questionId) {
        const existingProgress = await tx.progress.findFirst({
          where: { user_id: userId, question_id: questionId },
        });

        if (existingProgress) {
          await tx.progress.update({
            where: { id: existingProgress.id },
            data: {
              is_correct: true,
              attempts_count: (existingProgress.attempts_count || 0) + 1,
              completed_at: new Date(),
              xp_earned: 0,
            },
          });
        } else {
          await tx.progress.create({
            data: {
              user_id: userId,
              module_id: resolvedModuleId,
              question_id: questionId,
              is_correct: true,
              attempts_count: 1,
              completed_at: new Date(),
              xp_earned: 0,
            },
          });
        }
      }

      if (resolvedModuleId) {
        const existingCompletion = await tx.module_completions.findFirst({
          where: { user_id: userId, module_id: resolvedModuleId },
        });

        if (isStationComplete === false) {
          if (existingCompletion) {
            await tx.module_completions.delete({
              where: { id: existingCompletion.id },
            });
          }
        } else if (isStationComplete) {
          if (existingCompletion) {
            await tx.module_completions.update({
              where: { id: existingCompletion.id },
              data: {
                completed_at: new Date(),
                total_attempts: (existingCompletion.total_attempts || 0) + 1,
                total_xp_earned: 0,
              },
            });
          } else {
            await tx.module_completions.create({
              data: {
                user_id: userId,
                module_id: resolvedModuleId,
                total_xp_earned: 0,
                total_attempts: 1,
                completed_at: new Date(),
              },
            });
          }
        }
      }

      return { resolvedModuleId };
    });

    invalidateLearningCache();

    return { success: true, ...result };
  } catch (error) {
    console.error('[learningService.recordStudentCompletion] Error:', error);
    return { success: false, error: 'Failed to record completion' };
  }
}
