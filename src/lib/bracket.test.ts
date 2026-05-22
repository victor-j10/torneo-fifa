import { describe, expect, it } from 'vitest';
import { canUseTwoGroupPlayoffFormat, generatePlayoffMatches } from './bracket';
import type { Tournament } from '@/types/tournament';

function mockTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: 't1',
    name: 'Test',
    status: 'GROUP_STAGE',
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    advanceCount: 3,
    thirdPlace: false,
    players: [
      { id: 'p1', name: 'A1' },
      { id: 'p2', name: 'A2' },
      { id: 'p3', name: 'A3' },
      { id: 'p4', name: 'B1' },
      { id: 'p5', name: 'B2' },
      { id: 'p6', name: 'B3' },
    ],
    groups: [
      { id: 'g1', name: 'A', playerIds: ['p1', 'p2', 'p3'] },
      { id: 'g2', name: 'B', playerIds: ['p4', 'p5', 'p6'] },
    ],
    matches: [
      { id: 'm1', groupId: 'g1', stage: 'GROUP', round: 1, homePlayerId: 'p1', awayPlayerId: 'p2', homeScore: 2, awayScore: 0 },
      { id: 'm2', groupId: 'g1', stage: 'GROUP', round: 1, homePlayerId: 'p1', awayPlayerId: 'p3', homeScore: 1, awayScore: 1 },
      { id: 'm3', groupId: 'g1', stage: 'GROUP', round: 2, homePlayerId: 'p2', awayPlayerId: 'p3', homeScore: 0, awayScore: 1 },
      { id: 'm4', groupId: 'g2', stage: 'GROUP', round: 1, homePlayerId: 'p4', awayPlayerId: 'p5', homeScore: 3, awayScore: 1 },
      { id: 'm5', groupId: 'g2', stage: 'GROUP', round: 1, homePlayerId: 'p4', awayPlayerId: 'p6', homeScore: 2, awayScore: 2 },
      { id: 'm6', groupId: 'g2', stage: 'GROUP', round: 2, homePlayerId: 'p5', awayPlayerId: 'p6', homeScore: 1, awayScore: 0 },
    ],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('two group playoff format', () => {
  it('detecta formato válido con 2 grupos y 3 jugadores', () => {
    expect(canUseTwoGroupPlayoffFormat(mockTournament())).toBe(true);
  });

  it('genera previa, semis y final', () => {
    const matches = generatePlayoffMatches(mockTournament());
    expect(matches.filter((m) => m.stage === 'PRELIM')).toHaveLength(2);
    expect(matches.filter((m) => m.stage === 'SF')).toHaveLength(2);
    expect(matches.filter((m) => m.stage === 'FINAL')).toHaveLength(1);

    const sf = matches.filter((m) => m.stage === 'SF');
    expect(sf[0].homePlayerId).toBe('p1');
    expect(sf[1].homePlayerId).toBe('p4');
  });
});
