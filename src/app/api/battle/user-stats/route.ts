import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const SESSION_COOKIE = "cosmo_session";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;

    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    if (sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        userId = parsed.userId;
      } catch {
        // Fall through
      }
    }

    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const dbUser = await prisma.users.findUnique({
          where: { email: session.user.email.trim().toLowerCase() },
          select: { id: true },
        });
        if (dbUser) {
          userId = dbUser.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user info, battle user stats and arena stats in parallel
    const [user, battleStats, arenaStats] = await Promise.all([
      prisma.users.findUnique({
        where: { id: userId },
        select: {
          username: true,
          level: true,
          experience_level: true,
        },
      }),
      prisma.battle_user_stats.findUnique({
        where: { user_id: userId },
        select: {
          elo_rating: true,
          mcq_elo_rating: true,
          wins: true,
          losses: true,
          draws: true,
        },
      }),
      prisma.arena_stats.findUnique({
        where: { user_id: userId },
        select: {
          current_streak: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      username: user.username,
      level: user.level ?? 1,
      experienceLevel: user.experience_level ?? "Beginner",
      elo: battleStats?.elo_rating ?? 1000,
      mcqElo: battleStats?.mcq_elo_rating ?? 1000,
      wins: battleStats?.wins ?? 0,
      losses: battleStats?.losses ?? 0,
      draws: battleStats?.draws ?? 0,
      currentStreak: arenaStats?.current_streak ?? 0,
    });
  } catch (err) {
    console.error("[battle/user-stats GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
