import type { Group, Match, Player, StandingRow, Tournament } from '@/types/tournament';
import { getPlayerName, isMatchPlayed } from './utils';

interface StandingStats {
  playerId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

function initStats(playerId: string): StandingStats {
  return {
    playerId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };
}

function applyMatchResult(
  stats: Map<string, StandingStats>,
  match: Match,
  pointsWin: number,
  pointsDraw: number,
  pointsLoss: number,
): void {
  if (!isMatchPlayed(match)) return;

  const home = stats.get(match.homePlayerId)!;
  const away = stats.get(match.awayPlayerId)!;
  const homeScore = match.homeScore!;
  const awayScore = match.awayScore!;

  home.played++;
  away.played++;
  home.goalsFor += homeScore;
  home.goalsAgainst += awayScore;
  away.goalsFor += awayScore;
  away.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    home.won++;
    home.points += pointsWin;
    away.lost++;
    away.points += pointsLoss;
  } else if (homeScore < awayScore) {
    away.won++;
    away.points += pointsWin;
    home.lost++;
    home.points += pointsLoss;
  } else {
    home.drawn++;
    away.drawn++;
    home.points += pointsDraw;
    away.points += pointsDraw;
  }
}

function headToHeadPoints(
  playerA: string,
  playerB: string,
  matches: Match[],
  pointsWin: number,
  pointsDraw: number,
): number {
  const direct = matches.filter(
    (m) =>
      m.stage === 'GROUP' &&
      isMatchPlayed(m) &&
      ((m.homePlayerId === playerA && m.awayPlayerId === playerB) ||
        (m.homePlayerId === playerB && m.awayPlayerId === playerA)),
  );

  if (direct.length === 0) return 0;

  let pts = 0;
  for (const m of direct) {
    const isHomeA = m.homePlayerId === playerA;
    const scoreA = isHomeA ? m.homeScore! : m.awayScore!;
    const scoreB = isHomeA ? m.awayScore! : m.homeScore!;
    if (scoreA > scoreB) pts += pointsWin;
    else if (scoreA === scoreB) pts += pointsDraw;
  }
  return pts;
}

function compareStandings(
  a: StandingStats,
  b: StandingStats,
  matches: Match[],
  players: Player[],
  pointsWin: number,
  pointsDraw: number,
): number {
  if (b.points !== a.points) return b.points - a.points;
  const gdA = a.goalsFor - a.goalsAgainst;
  const gdB = b.goalsFor - b.goalsAgainst;
  if (gdB !== gdA) return gdB - gdA;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

  const h2h = headToHeadPoints(a.playerId, b.playerId, matches, pointsWin, pointsDraw);
  if (h2h !== 0) return h2h > 0 ? -1 : 1;

  const nameA = getPlayerName(players, a.playerId);
  const nameB = getPlayerName(players, b.playerId);
  return nameA.localeCompare(nameB, 'es');
}

export function computeGroupStandings(
  group: Group,
  matches: Match[],
  players: Player[],
  pointsWin: number,
  pointsDraw: number,
  pointsLoss: number,
): StandingRow[] {
  const stats = new Map<string, StandingStats>();
  for (const pid of group.playerIds) {
    stats.set(pid, initStats(pid));
  }

  const groupMatches = matches.filter(
    (m) => m.stage === 'GROUP' && m.groupId === group.id,
  );

  for (const m of groupMatches) {
    applyMatchResult(stats, m, pointsWin, pointsDraw, pointsLoss);
  }

  const sorted = [...stats.values()].sort((a, b) =>
    compareStandings(a, b, groupMatches, players, pointsWin, pointsDraw),
  );

  return sorted.map((s, i) => ({
    playerId: s.playerId,
    playerName: getPlayerName(players, s.playerId),
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalsFor - s.goalsAgainst,
    points: s.points,
    position: i + 1,
  }));
}

export function getQualifiedPlayers(
  tournament: Tournament,
): { playerId: string; groupName: string; position: number }[] {
  const qualified: { playerId: string; groupName: string; position: number }[] = [];

  for (const group of tournament.groups) {
    const standings = computeGroupStandings(
      group,
      tournament.matches,
      tournament.players,
      tournament.pointsWin,
      tournament.pointsDraw,
      tournament.pointsLoss,
    );
    const top = standings.slice(0, tournament.advanceCount);
    for (const row of top) {
      qualified.push({
        playerId: row.playerId,
        groupName: group.name,
        position: row.position,
      });
    }
  }

  return qualified;
}

export function areAllGroupMatchesPlayed(tournament: Tournament): boolean {
  const groupMatches = tournament.matches.filter((m) => m.stage === 'GROUP');
  if (groupMatches.length === 0) return false;
  return groupMatches.every(isMatchPlayed);
}

export function hasPlayedGroupMatches(tournament: Tournament): boolean {
  return tournament.matches
    .filter((m) => m.stage === 'GROUP')
    .some(isMatchPlayed);
}
