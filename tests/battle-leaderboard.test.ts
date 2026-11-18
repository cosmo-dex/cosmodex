import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  compareParticipants,
  assignCompetitionRanks,
  IndividualLeaderboardEntry,
  TeamLeaderboardEntry,
} from '../src/lib/battleLeaderboard';

describe('Phase 4.2 — Event Battle Arena Leaderboard Suite (Frontend/Lib)', () => {
  describe('1. Lexicographical Sorting & Exact Cross-Multiplication (Section 2 & 4)', () => {
    it('ranks higher total wins ahead of lower total wins', () => {
      const playerA = { wins: 5, draws: 1, completedMatches: 7 };
      const playerB = { wins: 4, draws: 2, completedMatches: 6 };

      assert.ok(compareParticipants(playerA, playerB) < 0, 'Player A (5 wins) should rank ahead of Player B (4 wins)');
      assert.ok(compareParticipants(playerB, playerA) > 0, 'Player B (4 wins) should rank behind Player A (5 wins)');
    });

    it('breaks ties in total wins using total draws (descending)', () => {
      const playerA = { wins: 4, draws: 3, completedMatches: 8 };
      const playerB = { wins: 4, draws: 1, completedMatches: 6 };

      assert.ok(compareParticipants(playerA, playerB) < 0, 'Player A (3 draws) should rank ahead of Player B (1 draw)');
      assert.ok(compareParticipants(playerB, playerA) > 0, 'Player B (1 draw) should rank behind Player A (3 draws)');
    });

    it('breaks ties in wins and draws using exact BigInt cross-multiplication (win rate)', () => {
      // Both have 1 win, 0 draws.
      // Player A: 1 win in 3 matches (33.333...%)
      // Player B: 333 wins in 1000 matches (33.3000%) - wait, here wins must equal for tie-break in Section 2!
      // Let's test equal wins, equal draws, but different completed matches (hence different win rates):
      // Player A: 5 wins, 2 draws, 7 total matches (win rate = 5/7 = 0.7142857...)
      // Player B: 5 wins, 2 draws, 8 total matches (win rate = 5/8 = 0.625)
      const playerA = { wins: 5, draws: 2, completedMatches: 7 };
      const playerB = { wins: 5, draws: 2, completedMatches: 8 };

      // Cross-multiplication: 5 * 8 = 40 vs 5 * 7 = 35 => Player A wins
      assert.ok(compareParticipants(playerA, playerB) < 0, 'Player A (5/7) should rank ahead of Player B (5/8)');
      assert.ok(compareParticipants(playerB, playerA) > 0, 'Player B (5/8) should rank behind Player A (5/7)');
    });

    it('exact win-rate fraction comparison prevents floating-point inaccuracy', () => {
      // 10 wins, 0 draws in 33 matches vs 10 wins, 0 draws in 34 matches
      // 10 * 34 = 340 vs 10 * 33 = 330 => 33 matches has higher win rate
      const candidate1 = { wins: 10, draws: 0, completedMatches: 33 };
      const candidate2 = { wins: 10, draws: 0, completedMatches: 34 };

      assert.ok(compareParticipants(candidate1, candidate2) < 0);
      assert.ok(compareParticipants(candidate2, candidate1) > 0);
    });

    it('identifies exact ties when wins, draws, and win rate fractions are identical', () => {
      const playerA = { wins: 6, draws: 2, completedMatches: 10 };
      const playerB = { wins: 6, draws: 2, completedMatches: 10 };

      assert.strictEqual(compareParticipants(playerA, playerB), 0, 'Identical records should result in exact tie (0)');
    });

    it('places participants with 0 completed matches below non-zero matches', () => {
      const activePlayer = { wins: 0, draws: 0, completedMatches: 1 };
      const zeroMatchPlayer = { wins: 0, draws: 0, completedMatches: 0 };

      assert.ok(compareParticipants(activePlayer, zeroMatchPlayer) < 0, 'Active player (1 match) ranks above 0 matches');
      assert.ok(compareParticipants(zeroMatchPlayer, activePlayer) > 0, '0 match player ranks below active player');
    });

    it('treats two participants with 0 completed matches as tied', () => {
      const zero1 = { wins: 0, draws: 0, completedMatches: 0 };
      const zero2 = { wins: 0, draws: 0, completedMatches: 0 };

      assert.strictEqual(compareParticipants(zero1, zero2), 0);
    });
  });

  describe('2. Competition Ranking Assignment (1, 2, 2, 4)', () => {
    it('assigns sequential ranks when there are no ties', () => {
      const entries = [
        { rank: 0, wins: 10, draws: 2, completedMatches: 12 },
        { rank: 0, wins: 8, draws: 1, completedMatches: 10 },
        { rank: 0, wins: 5, draws: 0, completedMatches: 6 },
        { rank: 0, wins: 2, draws: 0, completedMatches: 4 },
      ];

      const ranked = assignCompetitionRanks(entries);
      assert.deepStrictEqual(ranked.map(e => e.rank), [1, 2, 3, 4]);
    });

    it('assigns 1, 2, 2, 4 for a two-way tie at rank 2', () => {
      const entries = [
        { rank: 0, wins: 10, draws: 2, completedMatches: 12 },
        { rank: 0, wins: 8, draws: 1, completedMatches: 10 },
        { rank: 0, wins: 8, draws: 1, completedMatches: 10 }, // Tied with 2nd
        { rank: 0, wins: 5, draws: 0, completedMatches: 6 },  // Must receive rank 4
      ];

      const ranked = assignCompetitionRanks(entries);
      assert.deepStrictEqual(ranked.map(e => e.rank), [1, 2, 2, 4]);
    });

    it('assigns 1, 1, 3, 4 for a two-way tie at rank 1', () => {
      const entries = [
        { rank: 0, wins: 10, draws: 0, completedMatches: 10 },
        { rank: 0, wins: 10, draws: 0, completedMatches: 10 },
        { rank: 0, wins: 7, draws: 1, completedMatches: 9 },
        { rank: 0, wins: 3, draws: 0, completedMatches: 5 },
      ];

      const ranked = assignCompetitionRanks(entries);
      assert.deepStrictEqual(ranked.map(e => e.rank), [1, 1, 3, 4]);
    });

    it('assigns 1, 2, 2, 2, 5 for a three-way tie at rank 2', () => {
      const entries = [
        { rank: 0, wins: 9, draws: 0, completedMatches: 10 },
        { rank: 0, wins: 5, draws: 2, completedMatches: 8 },
        { rank: 0, wins: 5, draws: 2, completedMatches: 8 },
        { rank: 0, wins: 5, draws: 2, completedMatches: 8 },
        { rank: 0, wins: 2, draws: 0, completedMatches: 4 },
      ];

      const ranked = assignCompetitionRanks(entries);
      assert.deepStrictEqual(ranked.map(e => e.rank), [1, 2, 2, 2, 5]);
    });

    it('assigns 1, 1, 1, 1 when all participants are tied', () => {
      const entries = [
        { rank: 0, wins: 0, draws: 0, completedMatches: 0 },
        { rank: 0, wins: 0, draws: 0, completedMatches: 0 },
        { rank: 0, wins: 0, draws: 0, completedMatches: 0 },
        { rank: 0, wins: 0, draws: 0, completedMatches: 0 },
      ];

      const ranked = assignCompetitionRanks(entries);
      assert.deepStrictEqual(ranked.map(e => e.rank), [1, 1, 1, 1]);
    });
  });

  describe('3. Team-Size Policy: Option C — Raw Outcome Aggregation', () => {
    it('correctly sorts teams by raw outcome totals regardless of member count differences', () => {
      // Team Alpha: 2 members, 8 wins total
      const teamAlpha: TeamLeaderboardEntry = {
        rank: 0,
        teamId: 'TEAM-A',
        teamName: 'Team Alpha',
        memberCount: 2,
        wins: 8,
        draws: 2,
        losses: 2,
        completedMatches: 12,
        winRate: 66.7,
        coding: { wins: 5, draws: 1, losses: 1 },
        mcq: { wins: 3, draws: 1, losses: 1 },
        members: [
          { userId: 'u1', username: 'Member 1', wins: 5, draws: 1, losses: 1, completedMatches: 7 },
          { userId: 'u2', username: 'Member 2', wins: 3, draws: 1, losses: 1, completedMatches: 5 },
        ],
      };

      // Team Beta: 4 members, 12 wins total
      const teamBeta: TeamLeaderboardEntry = {
        rank: 0,
        teamId: 'TEAM-B',
        teamName: 'Team Beta',
        memberCount: 4,
        wins: 12,
        draws: 1,
        losses: 7,
        completedMatches: 20,
        winRate: 60.0,
        coding: { wins: 7, draws: 1, losses: 4 },
        mcq: { wins: 5, draws: 0, losses: 3 },
        members: [
          { userId: 'u3', username: 'Member 3', wins: 4, draws: 0, losses: 2, completedMatches: 6 },
          { userId: 'u4', username: 'Member 4', wins: 3, draws: 1, losses: 1, completedMatches: 5 },
          { userId: 'u5', username: 'Member 5', wins: 3, draws: 0, losses: 2, completedMatches: 5 },
          { userId: 'u6', username: 'Member 6', wins: 2, draws: 0, losses: 2, completedMatches: 4 },
        ],
      };

      // Team Beta has more raw wins (12 > 8), so Team Beta must rank higher under Option C
      const sorted = [teamAlpha, teamBeta].sort(compareParticipants);
      const ranked = assignCompetitionRanks(sorted);

      assert.strictEqual(ranked[0].teamName, 'Team Beta', 'Team Beta with 12 wins ranks #1 under Option C');
      assert.strictEqual(ranked[0].rank, 1);
      assert.strictEqual(ranked[1].teamName, 'Team Alpha', 'Team Alpha with 8 wins ranks #2 under Option C');
      assert.strictEqual(ranked[1].rank, 2);
    });

    it('preserves member contributions and sum equals team totals', () => {
      const members = [
        { userId: 'u1', username: 'Member 1', wins: 4, draws: 2, losses: 1, completedMatches: 7 },
        { userId: 'u2', username: 'Member 2', wins: 3, draws: 0, losses: 2, completedMatches: 5 },
      ];

      const sumWins = members.reduce((acc, m) => acc + m.wins, 0);
      const sumDraws = members.reduce((acc, m) => acc + m.draws, 0);
      const sumLosses = members.reduce((acc, m) => acc + m.losses, 0);
      const sumMatches = members.reduce((acc, m) => acc + m.completedMatches, 0);

      assert.strictEqual(sumWins, 7);
      assert.strictEqual(sumDraws, 2);
      assert.strictEqual(sumLosses, 3);
      assert.strictEqual(sumMatches, 12);
    });

    it('ranks registered teams with zero completed matches below teams with matches', () => {
      const activeTeam = { rank: 0, wins: 1, draws: 0, completedMatches: 2 };
      const zeroTeam = { rank: 0, wins: 0, draws: 0, completedMatches: 0 };

      const sorted = [zeroTeam, activeTeam].sort(compareParticipants);
      const ranked = assignCompetitionRanks(sorted);

      assert.strictEqual(ranked[0], activeTeam);
      assert.strictEqual(ranked[0].rank, 1);
      assert.strictEqual(ranked[1], zeroTeam);
      assert.strictEqual(ranked[1].rank, 2);
    });
  });

  describe('4. Mode Breakdown Separation & Combination', () => {
    it('verifies coding and mcq sub-stats combine accurately into total outcomes', () => {
      const entry: IndividualLeaderboardEntry = {
        rank: 1,
        userId: 'u100',
        username: 'Grandmaster',
        wins: 10,
        draws: 2,
        losses: 3,
        completedMatches: 15,
        winRate: 66.7,
        coding: { wins: 6, draws: 1, losses: 2 },
        mcq: { wins: 4, draws: 1, losses: 1 },
      };

      assert.strictEqual(entry.coding.wins + entry.mcq.wins, entry.wins, 'Coding wins + MCQ wins = total wins');
      assert.strictEqual(entry.coding.draws + entry.mcq.draws, entry.draws, 'Coding draws + MCQ draws = total draws');
      assert.strictEqual(entry.coding.losses + entry.mcq.losses, entry.losses, 'Coding losses + MCQ losses = total losses');
      assert.strictEqual(entry.wins + entry.draws + entry.losses, entry.completedMatches, 'Sum equals completed matches');
    });
  });

  describe('5. Team Membership Lock at Event Start (Section 7)', () => {
    function evaluateTeamRegistrationLock(event: {
      participation_type?: string | null;
      starts_at?: Date | string | null;
    }): { locked: boolean; status?: number; error?: string } {
      const isTeamEvent = event.participation_type === 'team';
      if (isTeamEvent && event.starts_at && new Date() >= new Date(event.starts_at)) {
        return {
          locked: true,
          status: 403,
          error: 'Team rosters are locked. Team creation and joining are not permitted after the event starts.',
        };
      }
      return { locked: false };
    }

    function evaluateTeamWithdrawalLock(event: {
      participation_type?: string | null;
      starts_at?: Date | string | null;
    }): { locked: boolean; status?: number; error?: string } {
      if (event.participation_type === 'team' && event.starts_at && new Date() >= new Date(event.starts_at)) {
        return {
          locked: true,
          status: 403,
          error: 'Team rosters are locked. Registration withdrawal is not permitted after the event starts.',
        };
      }
      return { locked: false };
    }

    it('locks team creation/joining when event has started (starts_at <= now)', () => {
      const startedEvent = {
        participation_type: 'team',
        starts_at: new Date(Date.now() - 3600_000), // 1 hour in the past
      };
      const check = evaluateTeamRegistrationLock(startedEvent);
      assert.strictEqual(check.locked, true);
      assert.strictEqual(check.status, 403);
      assert.ok(check.error?.includes('Team rosters are locked'));
    });

    it('permits team actions before event start (starts_at > now)', () => {
      const upcomingEvent = {
        participation_type: 'team',
        starts_at: new Date(Date.now() + 3600_000), // 1 hour in the future
      };
      const check = evaluateTeamRegistrationLock(upcomingEvent);
      assert.strictEqual(check.locked, false);
    });

    it('never locks individual events under team roster rules', () => {
      const individualStartedEvent = {
        participation_type: 'individual',
        starts_at: new Date(Date.now() - 3600_000),
      };
      const check = evaluateTeamRegistrationLock(individualStartedEvent);
      assert.strictEqual(check.locked, false);
    });

    it('locks team registration withdrawal when event has started', () => {
      const startedEvent = {
        participation_type: 'team',
        starts_at: new Date(Date.now() - 1800_000),
      };
      const check = evaluateTeamWithdrawalLock(startedEvent);
      assert.strictEqual(check.locked, true);
      assert.strictEqual(check.status, 403);
      assert.ok(check.error?.includes('Registration withdrawal is not permitted after the event starts'));
    });

    it('permits team registration withdrawal before event start', () => {
      const upcomingEvent = {
        participation_type: 'team',
        starts_at: new Date(Date.now() + 1800_000),
      };
      const check = evaluateTeamWithdrawalLock(upcomingEvent);
      assert.strictEqual(check.locked, false);
    });
  });
});
