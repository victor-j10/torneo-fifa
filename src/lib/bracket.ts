import type { Match, MatchStage, Tournament } from '@/types/tournament';
import { getQualifiedPlayers } from './standings';
import { generateId } from './utils';

function stagesForCount(n: number): MatchStage[] {
  if (n <= 2) return ['FINAL'];
  if (n <= 4) return ['SF', 'FINAL'];
  if (n <= 8) return ['QF', 'SF', 'FINAL'];
  return ['R16', 'QF', 'SF', 'FINAL'];
}

function matchesInStage(stage: MatchStage): number {
  return { R16: 8, QF: 4, SF: 2, FINAL: 1, THIRD: 1, GROUP: 0 }[stage];
}

/** Cruces típicos: 1º grupo A vs 2º B, 1º B vs 2º A… */
function buildFirstRoundPairings(
  qualified: ReturnType<typeof getQualifiedPlayers>,
): [string, string][] {
  const byGroup = new Map<string, { first: string; second: string }>();

  for (const q of qualified) {
    if (!byGroup.has(q.groupName)) {
      byGroup.set(q.groupName, { first: '', second: '' });
    }
    const entry = byGroup.get(q.groupName)!;
    if (q.position === 1) entry.first = q.playerId;
    else entry.second = q.playerId;
  }

  const groups = [...byGroup.keys()].sort();
  const pairings: [string, string][] = [];

  for (let i = 0; i < groups.length; i++) {
    const gA = groups[i];
    const gB = groups[(i + 1) % groups.length];
    if (i % 2 === 0 && gA !== gB) {
      const a = byGroup.get(gA)!;
      const b = byGroup.get(gB)!;
      if (a.first && b.second) pairings.push([a.first, b.second]);
      if (b.first && a.second) pairings.push([b.first, a.second]);
    }
  }

  if (pairings.length === 0) {
    const ids = qualified.map((q) => q.playerId);
    for (let i = 0; i < ids.length; i += 2) {
      if (ids[i + 1]) pairings.push([ids[i], ids[i + 1]]);
    }
  }

  return pairings;
}

export function generatePlayoffMatches(tournament: Tournament): Match[] {
  const qualified = getQualifiedPlayers(tournament);
  if (qualified.length < 2) return [];

  const stages = stagesForCount(qualified.length);
  const matches: Match[] = [];
  const stageIds: MatchStage[] = [...stages];

  const pairings = buildFirstRoundPairings(qualified);
  const firstStage = stageIds[0];
  const needed = matchesInStage(firstStage);

  const firstRound: Match[] = [];
  for (let i = 0; i < needed; i++) {
    const [home, away] = pairings[i] ?? ['', ''];
    const m: Match = {
      id: generateId(),
      stage: firstStage,
      round: 1,
      homePlayerId: home,
      awayPlayerId: away,
    };
    firstRound.push(m);
    matches.push(m);
  }

  let previousRound = firstRound;

  for (let si = 1; si < stageIds.length; si++) {
    const stage = stageIds[si];
    const count = matchesInStage(stage);
    const currentRound: Match[] = [];

    for (let i = 0; i < count; i++) {
      const feederA = previousRound[i * 2];
      const feederB = previousRound[i * 2 + 1];
      const m: Match = {
        id: generateId(),
        stage,
        round: si + 1,
        homePlayerId: '',
        awayPlayerId: '',
        feederMatchIds: [feederA?.id, feederB?.id].filter(Boolean) as string[],
      };
      currentRound.push(m);
      matches.push(m);
    }

    previousRound = currentRound;
  }

  if (tournament.thirdPlace && stageIds.includes('SF')) {
    matches.push({
      id: generateId(),
      stage: 'THIRD',
      round: stageIds.length,
      homePlayerId: '',
      awayPlayerId: '',
    });
  }

  return matches;
}

export function propagatePlayoffWinner(
  matches: Match[],
  completedMatchId: string,
  winnerId: string,
): Match[] {
  const withWinner = matches.map((m) =>
    m.id === completedMatchId ? { ...m, winnerId } : m,
  );

  const next = withWinner.find(
    (m) =>
      m.stage !== 'GROUP' && m.feederMatchIds?.includes(completedMatchId),
  );

  if (!next) return withWinner;

  return withWinner.map((m) => {
    if (m.id !== next.id) return m;
    const feeders = m.feederMatchIds ?? [];
    const idx = feeders.indexOf(completedMatchId);
    if (idx === 0 && !m.homePlayerId) return { ...m, homePlayerId: winnerId };
    if (idx === 1 && !m.awayPlayerId) return { ...m, awayPlayerId: winnerId };
    if (!m.homePlayerId) return { ...m, homePlayerId: winnerId };
    return { ...m, awayPlayerId: winnerId };
  });
}

export function getChampion(matches: Match[]): string | null {
  const final = matches.find((m) => m.stage === 'FINAL');
  if (!final?.winnerId) return null;
  return final.winnerId;
}
