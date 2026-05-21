import { useEffect, useState } from 'react';
import type { Match, Tournament } from '@/types/tournament';
import { getPlayerClubName, findPlayer } from '@/lib/playerDisplay';
import { getPlayerName } from '@/lib/utils';
import { Button, Input, Select } from './ui';

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
  const homeClub = getPlayerClubName(findPlayer(tournament.players, match.homePlayerId));
  const awayClub = getPlayerClubName(findPlayer(tournament.players, match.awayPlayerId));
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-emerald-500/20 bg-slate-900 shadow-2xl shadow-emerald-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />
        <div className="p-6 sm:p-8">
          <h3 className="font-display text-2xl tracking-wide text-white uppercase mb-6 text-center">
            Resultado
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-stretch gap-3">
              <div className="flex-1 rounded-xl bg-slate-800 border border-slate-600/50 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-300 mb-1">
                  Local
                </p>
                <p className="font-semibold text-white truncate">{homeName || 'TBD'}</p>
                {homeClub && (
                  <p className="text-[10px] text-emerald-400 truncate mb-2">{homeClub}</p>
                )}
                {!homeClub && <div className="mb-3" />}
                <Input
                  type="number"
                  min={0}
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="text-center font-display text-3xl h-14"
                />
              </div>
              <div className="flex items-center font-display text-2xl text-slate-400 pt-8">
                :
              </div>
              <div className="flex-1 rounded-xl bg-slate-800 border border-slate-600/50 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-300 mb-1">
                  Visitante
                </p>
                <p className="font-semibold text-white truncate">{awayName || 'TBD'}</p>
                {awayClub && (
                  <p className="text-[10px] text-emerald-400 truncate mb-2">{awayClub}</p>
                )}
                {!awayClub && <div className="mb-3" />}
                <Input
                  type="number"
                  min={0}
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="text-center font-display text-3xl h-14"
                />
              </div>
            </div>

            {isTie && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm text-amber-300 mb-2">
                  Empate en eliminatoria — elige ganador:
                </p>
                <Select
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">Seleccionar…</option>
                  {match.homePlayerId && (
                    <option value={match.homePlayerId}>{homeName}</option>
                  )}
                  {match.awayPlayerId && (
                    <option value={match.awayPlayerId}>{awayName}</option>
                  )}
                </Select>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Guardar resultado
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
