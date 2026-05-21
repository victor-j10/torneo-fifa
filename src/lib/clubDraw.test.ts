import { describe, expect, it } from 'vitest';
import { drawClubsToPlayers } from './clubDraw';

describe('drawClubsToPlayers', () => {
  it('asigna un club único por jugador', () => {
    const players = ['p1', 'p2', 'p3'];
    const clubs = ['c1', 'c2', 'c3', 'c4'];
    const result = drawClubsToPlayers(players, clubs);

    expect(result.assignments).toHaveLength(3);
    const usedClubs = new Set(result.assignments.map((a) => a.clubId));
    expect(usedClubs.size).toBe(3);
    const usedPlayers = new Set(result.assignments.map((a) => a.playerId));
    expect(usedPlayers.size).toBe(3);
  });

  it('deja jugadores sin club si hay más jugadores que clubes', () => {
    const result = drawClubsToPlayers(['p1', 'p2', 'p3'], ['c1', 'c2']);
    expect(result.assignments).toHaveLength(2);
    expect(result.unassignedPlayerIds).toHaveLength(1);
  });
});
