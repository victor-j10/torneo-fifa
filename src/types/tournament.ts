export type TournamentStatus = 'DRAFT' | 'GROUP_STAGE' | 'PLAYOFFS' | 'FINISHED';
export type MatchStage = 'GROUP' | 'PRELIM' | 'R16' | 'QF' | 'SF' | 'FINAL' | 'THIRD';

export interface Player {
  id: string;
  name: string;
  /** Club europeo asignado en el sorteo */
  clubId?: string;
}

export interface Group {
  id: string;
  name: string;
  playerIds: string[];
}

export interface Match {
  id: string;
  groupId?: string;
  stage: MatchStage;
  round: number;
  homePlayerId: string;
  awayPlayerId: string;
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
  playedAt?: string;
  /** Partidos de playoff cuyos ganadores alimentan este encuentro */
  feederMatchIds?: string[];
}

export interface Tournament {
  id: string;
  name: string;
  status: TournamentStatus;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  advanceCount: number;
  thirdPlace: boolean;
  players: Player[];
  groups: Group[];
  matches: Match[];
  createdAt: string;
}

export interface StandingRow {
  playerId: string;
  playerName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

export interface CreateTournamentInput {
  name: string;
  pointsWin?: number;
  pointsDraw?: number;
  pointsLoss?: number;
  advanceCount?: number;
  thirdPlace?: boolean;
}
