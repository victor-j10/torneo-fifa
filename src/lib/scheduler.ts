import type { Match } from '@/types/tournament';
import { generateId } from './utils';

/** Genera emparejamientos round-robin (método del círculo) */
export function generateRoundRobinPairings(playerIds: string[]): [string, string][][] {
  if (playerIds.length < 2) return [];

  const ids = [...playerIds];
  const hasBye = ids.length % 2 !== 0;
  if (hasBye) ids.push('__BYE__');

  const n = ids.length;
  const rounds: [string, string][][] = [];
  const fixed = ids[0];
  let rotating = ids.slice(1);

  for (let r = 0; r < n - 1; r++) {
    const round: [string, string][] = [];
    const current = [fixed, ...rotating];

    for (let i = 0; i < n / 2; i++) {
      const home = current[i];
      const away = current[n - 1 - i];
      if (home !== '__BYE__' && away !== '__BYE__') {
        round.push([home, away]);
      }
    }

    rounds.push(round);
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }

  return rounds;
}

/** Jugador que no juega en la jornada (solo si el grupo tiene número impar) */
export function getRestPlayerForRound(
  groupPlayerIds: string[],
  roundMatches: Match[],
): string | null {
  if (groupPlayerIds.length % 2 === 0) return null;

  const playing = new Set<string>();
  for (const m of roundMatches) {
    playing.add(m.homePlayerId);
    playing.add(m.awayPlayerId);
  }

  const resting = groupPlayerIds.filter((id) => !playing.has(id));
  return resting.length === 1 ? resting[0] : null;
}

export function generateGroupMatches(
  groupId: string,
  playerIds: string[],
): Match[] {
  const rounds = generateRoundRobinPairings(playerIds);
  const matches: Match[] = [];

  rounds.forEach((roundPairings, roundIndex) => {
    roundPairings.forEach(([home, away]) => {
      matches.push({
        id: generateId(),
        groupId,
        stage: 'GROUP',
        round: roundIndex + 1,
        homePlayerId: home,
        awayPlayerId: away,
      });
    });
  });

  return matches;
}
