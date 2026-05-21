import { describe, expect, it } from 'vitest';
import { computeGroupStandings } from './standings';
import type { Group, Match, Player } from '@/types/tournament';

const players: Player[] = [
  { id: 'p1', name: 'Ana' },
  { id: 'p2', name: 'Bob' },
  { id: 'p3', name: 'Carlos' },
];

const group: Group = {
  id: 'g1',
  name: 'A',
  playerIds: ['p1', 'p2', 'p3'],
};

describe('computeGroupStandings', () => {
  it('ordena por puntos y diferencia de goles', () => {
    const matches: Match[] = [
      {
        id: 'm1',
        groupId: 'g1',
        stage: 'GROUP',
        round: 1,
        homePlayerId: 'p1',
        awayPlayerId: 'p2',
        homeScore: 3,
        awayScore: 0,
      },
      {
        id: 'm2',
        groupId: 'g1',
        stage: 'GROUP',
        round: 1,
        homePlayerId: 'p1',
        awayPlayerId: 'p3',
        homeScore: 1,
        awayScore: 1,
      },
      {
        id: 'm3',
        groupId: 'g1',
        stage: 'GROUP',
        round: 2,
        homePlayerId: 'p2',
        awayPlayerId: 'p3',
        homeScore: 2,
        awayScore: 0,
      },
    ];

    const standings = computeGroupStandings(group, matches, players, 3, 1, 0);
    expect(standings[0].playerId).toBe('p1');
    expect(standings[0].points).toBe(4);
    expect(standings[1].playerId).toBe('p2');
    expect(standings[2].playerId).toBe('p3');
  });
});
