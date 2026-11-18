import prisma from '@/lib/prisma';
import { parseEventId } from '@/lib/battleEvent';

export type RankingType = 'individual' | 'team';

export interface ParticipantModeStats {
  wins: number;
  draws: number;
  losses: number;
}

export interface IndividualLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  wins: number;
  draws: number;
  losses: number;
  completedMatches: number;
  winRate: number;
  coding: ParticipantModeStats;
  mcq: ParticipantModeStats;
}

export interface TeamMemberEntry {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  wins: number;
  draws: number;
  losses: number;
  completedMatches: number;
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  memberCount: number;
  wins: number;
  draws: number;
  losses: number;
  completedMatches: number;
  winRate: number;
  coding: ParticipantModeStats;
  mcq: ParticipantModeStats;
  members: TeamMemberEntry[];
}

export interface BattleLeaderboardResponse {
  eventId: string;
  rankingType: RankingType;
  leaderboard: (IndividualLeaderboardEntry | TeamLeaderboardEntry)[];
}

/**
 * Compares two entries lexicographically according to Section 2 & 4 of Phase 4.2:
 * 1. Total wins — descending
 * 2. Total draws — descending
 * 3. Exact win rate — descending using BigInt cross-multiplication
 */
export function compareParticipants(
  a: { wins: number; draws: number; completedMatches: number },
  b: { wins: number; draws: number; completedMatches: number }
): number {
  if (b.wins !== a.wins) {
    return b.wins - a.wins;
  }

  if (b.draws !== a.draws) {
    return b.draws - a.draws;
  }

  if (a.completedMatches === 0 && b.completedMatches === 0) {
    return 0;
  }
  if (a.completedMatches === 0) {
    return 1;
  }
  if (b.completedMatches === 0) {
    return -1;
  }

  const aCross = BigInt(a.wins) * BigInt(b.completedMatches);
  const bCross = BigInt(b.wins) * BigInt(a.completedMatches);

  if (bCross !== aCross) {
    return bCross > aCross ? 1 : -1;
  }

  return 0;
}

/**
 * Assigns competition ranking (e.g. 1, 2, 2, 4) to sorted entries.
 */
export function assignCompetitionRanks<
  T extends { rank: number; wins: number; draws: number; completedMatches: number }
>(entries: T[]): T[] {
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && compareParticipants(entries[i], entries[i - 1]) === 0) {
      entries[i].rank = entries[i - 1].rank;
    } else {
      entries[i].rank = i + 1;
    }
  }
  return entries;
}

/**
 * Calculates live Battle Arena leaderboard standings for an event from PostgreSQL.
 * Performs zero database writes.
 */
export async function getEventBattleLeaderboard(
  rawEventId: string
): Promise<BattleLeaderboardResponse | null> {
  const eventId = parseEventId(rawEventId);
  if (!eventId) {
    return null;
  }

  const event = await prisma.events.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, participation_type: true },
  });

  if (!event) {
    return null;
  }

  const isTeamEvent = event.participation_type === 'team';
  const rankingType: RankingType = isTeamEvent ? 'team' : 'individual';

  const [registrations, codingMatches, mcqMatches] = await Promise.all([
    prisma.event_registrations.findMany({
      where: { event_id: event.id, status: 'registered' },
      select: {
        user_id: true,
        team_name: true,
        team_code: true,
        users: { select: { username: true, avatar_url: true } },
      },
    }),
    prisma.battle_matches.findMany({
      where: { event_id: event.id, status: 'COMPLETED' },
      select: { id: true, player1_id: true, player2_id: true, winner_id: true },
    }),
    prisma.battle_mcq_matches.findMany({
      where: { event_id: event.id, status: 'COMPLETED' },
      select: { id: true, player1_id: true, player2_id: true, winner_id: true },
    }),
  ]);

  if (isTeamEvent) {
    return aggregateTeamLeaderboard(event.id, registrations, codingMatches, mcqMatches);
  } else {
    return aggregateIndividualLeaderboard(event.id, registrations, codingMatches, mcqMatches);
  }
}

interface MatchRecord {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string | null;
}

interface RegistrationRecord {
  user_id: string;
  team_name: string | null;
  team_code: string | null;
  users: { username: string; avatar_url: string | null };
}

function aggregateIndividualLeaderboard(
  eventId: string,
  registrations: RegistrationRecord[],
  codingMatches: MatchRecord[],
  mcqMatches: MatchRecord[]
): BattleLeaderboardResponse {
  interface Accumulator {
    userId: string;
    username: string;
    avatarUrl?: string | null;
    wins: number;
    draws: number;
    losses: number;
    coding: ParticipantModeStats;
    mcq: ParticipantModeStats;
  }

  const participants = new Map<string, Accumulator>();

  for (const reg of registrations) {
    participants.set(reg.user_id, {
      userId: reg.user_id,
      username: reg.users?.username || 'Participant',
      avatarUrl: reg.users?.avatar_url,
      wins: 0,
      draws: 0,
      losses: 0,
      coding: { wins: 0, draws: 0, losses: 0 },
      mcq: { wins: 0, draws: 0, losses: 0 },
    });
  }

  const processMatch = (match: MatchRecord, mode: 'coding' | 'mcq') => {
    const p1 = participants.get(match.player1_id);
    const p2 = participants.get(match.player2_id);

    if (!p1 || !p2 || match.player1_id === match.player2_id) {
      return;
    }

    if (match.winner_id === match.player1_id) {
      p1.wins++;
      p1[mode].wins++;
      p2.losses++;
      p2[mode].losses++;
    } else if (match.winner_id === match.player2_id) {
      p2.wins++;
      p2[mode].wins++;
      p1.losses++;
      p1[mode].losses++;
    } else if (!match.winner_id) {
      p1.draws++;
      p1[mode].draws++;
      p2.draws++;
      p2[mode].draws++;
    }
  };

  const processedIds = new Set<string>();

  for (const match of codingMatches) {
    if (processedIds.has(`code:${match.id}`)) continue;
    processedIds.add(`code:${match.id}`);
    processMatch(match, 'coding');
  }

  for (const match of mcqMatches) {
    if (processedIds.has(`mcq:${match.id}`)) continue;
    processedIds.add(`mcq:${match.id}`);
    processMatch(match, 'mcq');
  }

  const entries: IndividualLeaderboardEntry[] = Array.from(participants.values()).map((p) => {
    const completedMatches = p.wins + p.draws + p.losses;
    const winRate = completedMatches > 0 ? Number(((p.wins / completedMatches) * 100).toFixed(2)) : 0;
    return {
      rank: 0,
      userId: p.userId,
      username: p.username,
      avatarUrl: p.avatarUrl,
      wins: p.wins,
      draws: p.draws,
      losses: p.losses,
      completedMatches,
      winRate,
      coding: p.coding,
      mcq: p.mcq,
    };
  });

  entries.sort(compareParticipants);
  assignCompetitionRanks(entries);

  return {
    eventId,
    rankingType: 'individual',
    leaderboard: entries,
  };
}

function aggregateTeamLeaderboard(
  eventId: string,
  registrations: RegistrationRecord[],
  codingMatches: MatchRecord[],
  mcqMatches: MatchRecord[]
): BattleLeaderboardResponse {
  interface MemberAccumulator {
    userId: string;
    username: string;
    avatarUrl?: string | null;
    wins: number;
    draws: number;
    losses: number;
    coding: ParticipantModeStats;
    mcq: ParticipantModeStats;
  }

  interface TeamAccumulator {
    teamId: string;
    teamName: string;
    members: Map<string, MemberAccumulator>;
    wins: number;
    draws: number;
    losses: number;
    coding: ParticipantModeStats;
    mcq: ParticipantModeStats;
  }

  const userTeamMap = new Map<string, string>();
  const teams = new Map<string, TeamAccumulator>();

  for (const reg of registrations) {
    if (!reg.team_code) continue;
    const teamCode = reg.team_code.trim().toUpperCase();
    userTeamMap.set(reg.user_id, teamCode);

    if (!teams.has(teamCode)) {
      teams.set(teamCode, {
        teamId: teamCode,
        teamName: reg.team_name || teamCode,
        members: new Map(),
        wins: 0,
        draws: 0,
        losses: 0,
        coding: { wins: 0, draws: 0, losses: 0 },
        mcq: { wins: 0, draws: 0, losses: 0 },
      });
    }

    const team = teams.get(teamCode)!;
    if (!team.members.has(reg.user_id)) {
      team.members.set(reg.user_id, {
        userId: reg.user_id,
        username: reg.users?.username || 'Member',
        avatarUrl: reg.users?.avatar_url,
        wins: 0,
        draws: 0,
        losses: 0,
        coding: { wins: 0, draws: 0, losses: 0 },
        mcq: { wins: 0, draws: 0, losses: 0 },
      });
    }
  }

  const processMatch = (match: MatchRecord, mode: 'coding' | 'mcq') => {
    const team1Code = userTeamMap.get(match.player1_id);
    const team2Code = userTeamMap.get(match.player2_id);

    if (!team1Code || !team2Code || match.player1_id === match.player2_id) {
      return;
    }

    const team1 = teams.get(team1Code);
    const team2 = teams.get(team2Code);
    if (!team1 || !team2) return;

    const member1 = team1.members.get(match.player1_id);
    const member2 = team2.members.get(match.player2_id);

    if (match.winner_id === match.player1_id) {
      team1.wins++;
      team1[mode].wins++;
      team2.losses++;
      team2[mode].losses++;
      if (member1) {
        member1.wins++;
        member1[mode].wins++;
      }
      if (member2) {
        member2.losses++;
        member2[mode].losses++;
      }
    } else if (match.winner_id === match.player2_id) {
      team2.wins++;
      team2[mode].wins++;
      team1.losses++;
      team1[mode].losses++;
      if (member2) {
        member2.wins++;
        member2[mode].wins++;
      }
      if (member1) {
        member1.losses++;
        member1[mode].losses++;
      }
    } else if (!match.winner_id) {
      team1.draws++;
      team1[mode].draws++;
      team2.draws++;
      team2[mode].draws++;
      if (member1) {
        member1.draws++;
        member1[mode].draws++;
      }
      if (member2) {
        member2.draws++;
        member2[mode].draws++;
      }
    }
  };

  const processedIds = new Set<string>();

  for (const match of codingMatches) {
    if (processedIds.has(`code:${match.id}`)) continue;
    processedIds.add(`code:${match.id}`);
    processMatch(match, 'coding');
  }

  for (const match of mcqMatches) {
    if (processedIds.has(`mcq:${match.id}`)) continue;
    processedIds.add(`mcq:${match.id}`);
    processMatch(match, 'mcq');
  }

  const entries: TeamLeaderboardEntry[] = Array.from(teams.values()).map((t) => {
    const completedMatches = t.wins + t.draws + t.losses;
    const winRate = completedMatches > 0 ? Number(((t.wins / completedMatches) * 100).toFixed(2)) : 0;

    const membersList: TeamMemberEntry[] = Array.from(t.members.values()).map((m) => ({
      userId: m.userId,
      username: m.username,
      avatarUrl: m.avatarUrl,
      wins: m.wins,
      draws: m.draws,
      losses: m.losses,
      completedMatches: m.wins + m.draws + m.losses,
    }));

    return {
      rank: 0,
      teamId: t.teamId,
      teamName: t.teamName,
      memberCount: membersList.length,
      wins: t.wins,
      draws: t.draws,
      losses: t.losses,
      completedMatches,
      winRate,
      coding: t.coding,
      mcq: t.mcq,
      members: membersList,
    };
  });

  entries.sort(compareParticipants);
  assignCompetitionRanks(entries);

  return {
    eventId,
    rankingType: 'team',
    leaderboard: entries,
  };
}
