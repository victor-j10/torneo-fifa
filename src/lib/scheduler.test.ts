import { describe, expect, it } from 'vitest';
import {
  generateRoundRobinPairings,
  generateGroupMatches,
  getRestPlayerForRound,
} from './scheduler';
import type { Match } from '@/types/tournament';

describe('generateRoundRobinPairings', () => {
  it('genera todas las parejas sin repetir para 4 jugadores', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const rounds = generateRoundRobinPairings(ids);
    expect(rounds).toHaveLength(3);
    const allPairs = rounds.flat();
    expect(allPairs).toHaveLength(6);
    const keys = allPairs.map(([h, a]) => [h, a].sort().join('-'));
    expect(new Set(keys).size).toBe(6);
  });
});

describe('generateGroupMatches', () => {
  it('crea 6 partidos para grupo de 4', () => {
    const matches = generateGroupMatches('g1', ['a', 'b', 'c', 'd']);
    expect(matches).toHaveLength(6);
    expect(matches.every((m) => m.stage === 'GROUP' && m.groupId === 'g1')).toBe(
      true,
    );
  });

  it('con 3 jugadores hay un descanso por jornada', () => {
    const matches = generateGroupMatches('g1', ['a', 'b', 'c']);
    const round1 = matches.filter((m) => m.round === 1);
    expect(round1).toHaveLength(1);
    const rest = getRestPlayerForRound(['a', 'b', 'c'], round1);
    expect(rest).toBeTruthy();
    expect(['a', 'b', 'c']).toContain(rest);
  });
});

describe('getRestPlayerForRound', () => {
  it('no hay descanso con número par de jugadores', () => {
    const matches: Match[] = [
      {
        id: '1',
        groupId: 'g1',
        stage: 'GROUP',
        round: 1,
        homePlayerId: 'a',
        awayPlayerId: 'b',
      },
    ];
    expect(getRestPlayerForRound(['a', 'b', 'c', 'd'], matches)).toBeNull();
  });
});
