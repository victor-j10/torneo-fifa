export function generateId(): string {
  return crypto.randomUUID();
}

export function getPlayerName(
  players: { id: string; name: string }[],
  playerId: string,
): string {
  return players.find((p) => p.id === playerId)?.name ?? 'Desconocido';
}

export function getPlayerDisplayName(
  players: { id: string; name: string; clubId?: string }[],
  playerId: string,
  clubName?: string,
): string {
  const name = getPlayerName(players, playerId);
  if (clubName) return `${name} (${clubName})`;
  return name;
}

export function isMatchPlayed(match: {
  homeScore?: number;
  awayScore?: number;
}): boolean {
  return match.homeScore !== undefined && match.awayScore !== undefined;
}

export function getMatchWinner(match: {
  homePlayerId: string;
  awayPlayerId: string;
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
}): string | null {
  if (match.winnerId) return match.winnerId;
  if (!isMatchPlayed(match)) return null;
  const home = match.homeScore!;
  const away = match.awayScore!;
  if (home > away) return match.homePlayerId;
  if (away > home) return match.awayPlayerId;
  return null;
}
