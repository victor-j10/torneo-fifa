import { getClubById } from '@/data/europeanClubs';
import type { Player } from '@/types/tournament';

export function getPlayerClubName(player: Player | undefined): string | null {
  if (!player?.clubId) return null;
  return getClubById(player.clubId)?.name ?? null;
}

export function findPlayer(
  players: Player[],
  playerId: string,
): Player | undefined {
  return players.find((p) => p.id === playerId);
}
