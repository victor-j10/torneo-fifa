import type { Group, Match, MatchStage, Tournament } from '@/types/tournament';
import { computeGroupStandings } from './standings';
import { generateId } from './utils';

export const DEFAULT_ADVANCE_COUNT = 3;

function getTopByGroup(tournament: Tournament, group: Group) {
  const standings = computeGroupStandings(
    group,
    tournament.matches,
    tournament.players,
    tournament.pointsWin,
    tournament.pointsDraw,
    tournament.pointsLoss,
  );
  return {
    first: standings[0]?.playerId ?? '',
    second: standings[1]?.playerId ?? '',
    third: standings[2]?.playerId ?? '',
  };
}

/**
 * Formato 2 grupos, 3 clasificados:
 * - 1º cada grupo → semifinal directa
 * - 2º vs 3º del otro grupo → fase previa → ganador a semifinal
 */
function generateTwoGroupPlayoffs(tournament: Tournament): Match[] {
  const groups = [...tournament.groups].sort((a, b) =>
    a.name.localeCompare(b.name, 'es'),
  );
  const [gA, gB] = groups;
  const topA = getTopByGroup(tournament, gA);
  const topB = getTopByGroup(tournament, gB);

  const prelim1: Match = {
    id: generateId(),
    stage: 'PRELIM',
    round: 1,
    homePlayerId: topB.second,
    awayPlayerId: topA.third,
  };
  const prelim2: Match = {
    id: generateId(),
    stage: 'PRELIM',
    round: 1,
    homePlayerId: topA.second,
    awayPlayerId: topB.third,
  };

  const sf1: Match = {
    id: generateId(),
    stage: 'SF',
    round: 2,
    homePlayerId: topA.first,
    awayPlayerId: '',
    feederMatchIds: [prelim1.id],
  };
  const sf2: Match = {
    id: generateId(),
    stage: 'SF',
    round: 2,
    homePlayerId: topB.first,
    awayPlayerId: '',
    feederMatchIds: [prelim2.id],
  };

  const finalMatch: Match = {
    id: generateId(),
    stage: 'FINAL',
    round: 3,
    homePlayerId: '',
    awayPlayerId: '',
    feederMatchIds: [sf1.id, sf2.id],
  };

  const matches: Match[] = [prelim1, prelim2, sf1, sf2, finalMatch];

  if (tournament.thirdPlace) {
    matches.push({
      id: generateId(),
      stage: 'THIRD',
      round: 3,
      homePlayerId: '',
      awayPlayerId: '',
    });
  }

  return matches;
}

/** Formato genérico si no hay exactamente 2 grupos */
function generateGenericPlayoffs(tournament: Tournament): Match[] {
  const qualified: { playerId: string; position: number }[] = [];
  for (const group of tournament.groups) {
    const standings = computeGroupStandings(
      group,
      tournament.matches,
      tournament.players,
      tournament.pointsWin,
      tournament.pointsDraw,
      tournament.pointsLoss,
    );
    standings.slice(0, tournament.advanceCount).forEach((row) => {
      qualified.push({ playerId: row.playerId, position: row.position });
    });
  }

  if (qualified.length < 2) return [];

  const matches: Match[] = [];
  const shuffled = [...qualified].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      matches.push({
        id: generateId(),
        stage: shuffled.length <= 4 ? 'SF' : 'QF',
        round: 1,
        homePlayerId: shuffled[i].playerId,
        awayPlayerId: shuffled[i + 1].playerId,
      });
    }
  }

  if (matches.length === 2) {
    const finalMatch: Match = {
      id: generateId(),
      stage: 'FINAL',
      round: 2,
      homePlayerId: '',
      awayPlayerId: '',
      feederMatchIds: matches.map((m) => m.id),
    };
    return [...matches, finalMatch];
  }

  return matches;
}

export function canUseTwoGroupPlayoffFormat(tournament: Tournament): boolean {
  if (tournament.groups.length !== 2) return false;
  if (tournament.advanceCount < 3) return false;
  return tournament.groups.every((g) => g.playerIds.length >= 3);
}

export function generatePlayoffMatches(tournament: Tournament): Match[] {
  if (canUseTwoGroupPlayoffFormat(tournament)) {
    return generateTwoGroupPlayoffs(tournament);
  }
  return generateGenericPlayoffs(tournament);
}

export function propagatePlayoffWinner(
  matches: Match[],
  completedMatchId: string,
  winnerId: string,
): Match[] {
  const withWinner = matches.map((m) =>
    m.id === completedMatchId ? { ...m, winnerId } : m,
  );

  return withWinner.map((m) => {
    if (m.stage === 'GROUP' || !m.feederMatchIds?.includes(completedMatchId)) {
      return m;
    }

    const idx = m.feederMatchIds.indexOf(completedMatchId);
    const updated = { ...m };

    if (m.feederMatchIds.length === 1) {
      if (!updated.awayPlayerId) updated.awayPlayerId = winnerId;
      else if (!updated.homePlayerId) updated.homePlayerId = winnerId;
      return updated;
    }

    if (idx === 0 && !updated.homePlayerId) updated.homePlayerId = winnerId;
    else if (idx === 1 && !updated.awayPlayerId) updated.awayPlayerId = winnerId;
    else if (!updated.homePlayerId) updated.homePlayerId = winnerId;
    else if (!updated.awayPlayerId) updated.awayPlayerId = winnerId;

    return updated;
  });
}

export function getChampion(matches: Match[]): string | null {
  const final = matches.find((m) => m.stage === 'FINAL');
  if (!final?.winnerId) return null;
  return final.winnerId;
}
