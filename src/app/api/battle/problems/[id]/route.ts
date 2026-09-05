import { NextRequest, NextResponse } from 'next/server';

const BATTLE_URL = process.env.BATTLE_ARENA_URL || 'http://localhost:3001';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${BATTLE_URL}/api/problems/${id}`, {
      next: { revalidate: 120 },
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch {
    try {
      const prisma = (await import('@/lib/prisma')).default;
      const prob = await prisma.battle_problems.findUnique({
        where: { id },
        include: {
          test_cases: {
            where: { is_public: true },
            select: { id: true, input: true, expected: true, is_public: true },
          },
        },
      });
      if (prob) {
        return NextResponse.json({
          id: prob.id,
          title: prob.title,
          description: prob.description,
          difficulty: prob.difficulty,
          basePoints: prob.base_points,
          timeLimitSec: prob.time_limit_sec,
          memoryLimitMb: prob.memory_limit_mb,
          starterCodes: (prob.starter_codes_json as Record<string, string>) || {},
          testCases: prob.test_cases.map((tc) => ({
            id: tc.id,
            problemId: prob.id,
            input: tc.input,
            expected: tc.expected,
            isPublic: tc.is_public,
          })),
        });
      }
    } catch (dbErr) {
      console.error('[problems/[id]] DB fallback failed:', dbErr);
    }
    return NextResponse.json({ error: 'Battle Arena backend unreachable' }, { status: 503 });
  }
}

