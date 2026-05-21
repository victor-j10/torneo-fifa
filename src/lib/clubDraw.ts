import { EUROPEAN_CLUBS } from '@/data/europeanClubs';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface ClubDrawResult {
  assignments: { playerId: string; clubId: string }[];
  unassignedPlayerIds: string[];
  unassignedClubIds: string[];
}

/** Sorteo aleatorio: un club único por jugador (hasta agotar el mínimo de ambos) */
export function drawClubsToPlayers(
  playerIds: string[],
  clubIds: string[] = EUROPEAN_CLUBS.map((c) => c.id),
): ClubDrawResult {
  if (playerIds.length === 0) {
    return { assignments: [], unassignedPlayerIds: [], unassignedClubIds: clubIds };
  }

  const shuffledPlayers = shuffle(playerIds);
  const shuffledClubs = shuffle(clubIds);
  const count = Math.min(shuffledPlayers.length, shuffledClubs.length);

  const assignments: { playerId: string; clubId: string }[] = [];
  for (let i = 0; i < count; i++) {
    assignments.push({
      playerId: shuffledPlayers[i],
      clubId: shuffledClubs[i],
    });
  }

  return {
    assignments,
    unassignedPlayerIds: shuffledPlayers.slice(count),
    unassignedClubIds: shuffledClubs.slice(count),
  };
}
