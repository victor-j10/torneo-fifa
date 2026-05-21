export interface EuropeanClub {
  id: string;
  name: string;
  league: string;
  rating: number;
  /** Color de acento para la UI */
  color: string;
}

export const EUROPEAN_CLUBS: EuropeanClub[] = [
  { id: 'rm', name: 'Real Madrid', league: 'LaLiga', rating: 85, color: '#FEBE10' },
  { id: 'fcb', name: 'FC Barcelona', league: 'LaLiga', rating: 85, color: '#A50044' },
  { id: 'liv', name: 'Liverpool', league: 'Premier League', rating: 85, color: '#C8102E' },
  { id: 'mci', name: 'Manchester City', league: 'Premier League', rating: 84, color: '#6CABDD' },
  { id: 'bay', name: 'FC Bayern de Múnich', league: 'Bundesliga', rating: 84, color: '#DC052D' },
  { id: 'ars', name: 'Arsenal', league: 'Premier League', rating: 84, color: '#EF0107' },
  { id: 'psg', name: 'Paris Saint-Germain', league: 'Ligue 1', rating: 84, color: '#004170' },
  { id: 'juv', name: 'Juventus', league: 'Serie A', rating: 83, color: '#000000' },
  { id: 'atm', name: 'Atlético de Madrid', league: 'LaLiga', rating: 83, color: '#CB3524' },
  { id: 'che', name: 'Chelsea', league: 'Premier League', rating: 83, color: '#034694' },
];

export function getClubById(clubId: string): EuropeanClub | undefined {
  return EUROPEAN_CLUBS.find((c) => c.id === clubId);
}
