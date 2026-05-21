import { useEffect, useState } from 'react';
import type { Match, Tournament } from '@/types/tournament';
import { getPlayerName } from '@/lib/utils';
import { Button, Input } from './ui';

interface Props {
  tournament: Tournament;
  match: Match | null;
  onClose: () => void;
  onSave: (
    homeScore: number,
    awayScore: number,
    winnerId?: string,
  ) => void;
}

export default function MatchResultModal({
  tournament,
  match,
  onClose,
  onSave,
}: Props) {
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');
  const [winnerId, setWinnerId] = useState('');

  useEffect(() => {
    if (match) {
      setHomeScore(String(match.homeScore ?? 0));
      setAwayScore(String(match.awayScore ?? 0));
      setWinnerId(match.winnerId ?? '');
    }
  }, [match]);

  if (!match) return null;

  const isKO = match.stage !== 'GROUP';
  const homeName = getPlayerName(tournament.players, match.homePlayerId);
  const awayName = getPlayerName(tournament.players, match.awayPlayerId);
  const isTie =
    isKO &&
    homeScore !== '' &&
    awayScore !== '' &&
    Number(homeScore) === Number(awayScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Math.max(0, parseInt(homeScore, 10) || 0);
    const a = Math.max(0, parseInt(awayScore, 10) || 0);
    if (isKO && h === a && !winnerId) return;
    onSave(h, a, isKO && h === a ? winnerId : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Resultado del partido</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <p className="text-sm text-slate-400 mb-1">Local</p>
              <p className="font-medium truncate">{homeName || 'TBD'}</p>
              <Input
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="mt-2 text-center text-xl"
              />
            </div>
            <span className="text-2xl text-slate-500 pt-6">—</span>
            <div className="flex-1 text-center">
              <p className="text-sm text-slate-400 mb-1">Visitante</p>
              <p className="font-medium truncate">{awayName || 'TBD'}</p>
              <Input
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="mt-2 text-center text-xl"
              />
            </div>
          </div>

          {isTie && (
            <div>
              <p className="text-sm text-amber-400 mb-2">
                Empate en eliminatoria — elige ganador:
              </p>
              <select
                value={winnerId}
                onChange={(e) => setWinnerId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                required
              >
                <option value="">Seleccionar…</option>
                {match.homePlayerId && (
                  <option value={match.homePlayerId}>{homeName}</option>
                )}
                {match.awayPlayerId && (
                  <option value={match.awayPlayerId}>{awayName}</option>
                )}
              </select>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
