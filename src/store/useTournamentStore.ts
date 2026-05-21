import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generatePlayoffMatches, getChampion, propagatePlayoffWinner } from '@/lib/bracket';
import { generateGroupMatches } from '@/lib/scheduler';
import { areAllGroupMatchesPlayed, hasPlayedGroupMatches } from '@/lib/standings';
import { generateId, getMatchWinner } from '@/lib/utils';
import type {
  CreateTournamentInput,
  Match,
  Tournament,
  TournamentStatus,
} from '@/types/tournament';

interface TournamentState {
  tournaments: Tournament[];
  createTournament: (input: CreateTournamentInput) => string;
  deleteTournament: (id: string) => void;
  getTournament: (id: string) => Tournament | undefined;
  updateTournament: (id: string, updater: (t: Tournament) => Tournament) => void;

  addPlayer: (tournamentId: string, name: string) => void;
  removePlayer: (tournamentId: string, playerId: string) => void;

  createGroup: (tournamentId: string, name: string) => void;
  removeGroup: (tournamentId: string, groupId: string) => void;
  assignPlayerToGroup: (
    tournamentId: string,
    groupId: string,
    playerId: string,
  ) => void;
  removePlayerFromGroup: (
    tournamentId: string,
    groupId: string,
    playerId: string,
  ) => void;
  distributePlayersEvenly: (tournamentId: string) => void;

  generateGroupFixtures: (tournamentId: string) => void;
  updateMatchResult: (
    tournamentId: string,
    matchId: string,
    homeScore: number,
    awayScore: number,
    winnerId?: string,
  ) => void;

  setTournamentStatus: (tournamentId: string, status: TournamentStatus) => void;
  startPlayoffs: (tournamentId: string) => void;
  importTournament: (tournament: Tournament) => void;
}

function createEmptyTournament(input: CreateTournamentInput): Tournament {
  return {
    id: generateId(),
    name: input.name.trim(),
    status: 'DRAFT',
    pointsWin: input.pointsWin ?? 3,
    pointsDraw: input.pointsDraw ?? 1,
    pointsLoss: input.pointsLoss ?? 0,
    advanceCount: input.advanceCount ?? 2,
    thirdPlace: input.thirdPlace ?? false,
    players: [],
    groups: [],
    matches: [],
    createdAt: new Date().toISOString(),
  };
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      tournaments: [],

      createTournament: (input) => {
        const t = createEmptyTournament(input);
        set((s) => ({ tournaments: [...s.tournaments, t] }));
        return t.id;
      },

      deleteTournament: (id) => {
        set((s) => ({
          tournaments: s.tournaments.filter((t) => t.id !== id),
        }));
      },

      getTournament: (id) => get().tournaments.find((t) => t.id === id),

      updateTournament: (id, updater) => {
        set((s) => ({
          tournaments: s.tournaments.map((t) =>
            t.id === id ? updater(t) : t,
          ),
        }));
      },

      addPlayer: (tournamentId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        get().updateTournament(tournamentId, (t) => ({
          ...t,
          players: [...t.players, { id: generateId(), name: trimmed }],
        }));
      },

      removePlayer: (tournamentId, playerId) => {
        get().updateTournament(tournamentId, (t) => ({
          ...t,
          players: t.players.filter((p) => p.id !== playerId),
          groups: t.groups.map((g) => ({
            ...g,
            playerIds: g.playerIds.filter((id) => id !== playerId),
          })),
          matches: t.matches.filter(
            (m) => m.homePlayerId !== playerId && m.awayPlayerId !== playerId,
          ),
        }));
      },

      createGroup: (tournamentId, name) => {
        get().updateTournament(tournamentId, (t) => ({
          ...t,
          groups: [
            ...t.groups,
            { id: generateId(), name: name.trim() || `Grupo ${t.groups.length + 1}`, playerIds: [] },
          ],
        }));
      },

      removeGroup: (tournamentId, groupId) => {
        get().updateTournament(tournamentId, (t) => ({
          ...t,
          groups: t.groups.filter((g) => g.id !== groupId),
          matches: t.matches.filter((m) => m.groupId !== groupId),
        }));
      },

      assignPlayerToGroup: (tournamentId, groupId, playerId) => {
        get().updateTournament(tournamentId, (t) => ({
          ...t,
          groups: t.groups.map((g) => {
            if (g.id === groupId) {
              if (g.playerIds.includes(playerId)) return g;
              return { ...g, playerIds: [...g.playerIds, playerId] };
            }
            return { ...g, playerIds: g.playerIds.filter((id) => id !== playerId) };
          }),
        }));
      },

      removePlayerFromGroup: (tournamentId, groupId, playerId) => {
        get().updateTournament(tournamentId, (t) => ({
          ...t,
          groups: t.groups.map((g) =>
            g.id === groupId
              ? { ...g, playerIds: g.playerIds.filter((id) => id !== playerId) }
              : g,
          ),
        }));
      },

      distributePlayersEvenly: (tournamentId) => {
        get().updateTournament(tournamentId, (t) => {
          if (t.groups.length === 0) return t;
          const groups = t.groups.map((g) => ({ ...g, playerIds: [] as string[] }));
          t.players.forEach((p, i) => {
            groups[i % groups.length].playerIds.push(p.id);
          });
          return { ...t, groups };
        });
      },

      generateGroupFixtures: (tournamentId) => {
        get().updateTournament(tournamentId, (t) => {
          const groupMatches: Match[] = [];
          for (const group of t.groups) {
            if (group.playerIds.length < 2) continue;
            groupMatches.push(...generateGroupMatches(group.id, group.playerIds));
          }
          return {
            ...t,
            status: 'GROUP_STAGE',
            matches: [
              ...t.matches.filter((m) => m.stage !== 'GROUP'),
              ...groupMatches,
            ],
          };
        });
      },

      updateMatchResult: (tournamentId, matchId, homeScore, awayScore, winnerId) => {
        get().updateTournament(tournamentId, (t) => {
          let matches = t.matches.map((m) => {
            if (m.id !== matchId) return m;
            const updated: Match = {
              ...m,
              homeScore,
              awayScore,
              playedAt: new Date().toISOString(),
            };
            if (m.stage !== 'GROUP') {
              const w =
                winnerId ??
                (homeScore > awayScore
                  ? m.homePlayerId
                  : awayScore > homeScore
                    ? m.awayPlayerId
                    : undefined);
              updated.winnerId = w;
            }
            return updated;
          });

          const match = matches.find((m) => m.id === matchId);
          if (match && match.stage !== 'GROUP') {
            const w =
              winnerId ?? getMatchWinner(match);
            if (w) {
              matches = propagatePlayoffWinner(matches, matchId, w);
            }
          }

          let status = t.status;
          if (t.status === 'GROUP_STAGE' && areAllGroupMatchesPlayed({ ...t, matches })) {
            status = 'GROUP_STAGE';
          }
          if (t.status === 'PLAYOFFS') {
            const champion = getChampion(matches);
            if (champion) status = 'FINISHED';
          }

          return { ...t, matches, status };
        });
      },

      setTournamentStatus: (tournamentId, status) => {
        get().updateTournament(tournamentId, (t) => ({ ...t, status }));
      },

      startPlayoffs: (tournamentId) => {
        get().updateTournament(tournamentId, (t) => {
          const playoffMatches = generatePlayoffMatches(t);
          return {
            ...t,
            status: 'PLAYOFFS',
            matches: [
              ...t.matches.filter((m) => m.stage === 'GROUP'),
              ...playoffMatches,
            ],
          };
        });
      },

      importTournament: (tournament) => {
        set((s) => {
          const exists = s.tournaments.some((t) => t.id === tournament.id);
          if (exists) {
            return {
              tournaments: s.tournaments.map((t) =>
                t.id === tournament.id ? tournament : t,
              ),
            };
          }
          return { tournaments: [...s.tournaments, tournament] };
        });
      },
    }),
    { name: 'fifa-torneo-storage' },
  ),
);

export function canEditGroups(tournament: Tournament): boolean {
  return !hasPlayedGroupMatches(tournament);
}
