import type { Match, Tournament } from '@/types/tournament';
import { areAllGroupMatchesPlayed } from '@/lib/standings';
import { getChampion } from '@/lib/bracket';
import { getPlayerName, isMatchPlayed } from '@/lib/utils';
import { useTournamentStore } from '@/store/useTournamentStore';
import { Badge, Button, Card, STAGE_LABELS } from './ui';

interface Props {
  tournament: Tournament;
  onEditMatch: (match: Match) => void;
}

const STAGE_ORDER = ['R16', 'QF', 'SF', 'FINAL', 'THIRD'] as const;

export default function PlayoffBracket({ tournament, onEditMatch }: Props) {
  const startPlayoffs = useTournamentStore((s) => s.startPlayoffs);
  const playoffMatches = tournament.matches.filter((m) => m.stage !== 'GROUP');
  const allGroupDone = areAllGroupMatchesPlayed(tournament);
  const championId = getChampion(tournament.matches);
  const championName = championId
    ? getPlayerName(tournament.players, championId)
    : null;

  if (playoffMatches.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="font-display text-2xl text-white uppercase mb-2">Playoffs</p>
        <p className="text-muted text-sm mb-6 max-w-md mx-auto">
          Cuando termines la fase de grupos, genera el cuadro eliminatorio.
        </p>
        <Button
          onClick={() => startPlayoffs(tournament.id)}
          disabled={!allGroupDone}
        >
          Iniciar playoffs
        </Button>
        {!allGroupDone && (
          <p className="text-amber-400 text-xs mt-4">
            Completa todos los partidos de grupo primero.
          </p>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {championName && (
        <Card glow className="text-center py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-emerald-500/5 to-amber-500/5" />
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/90 mb-1">
            Campeón del torneo
          </p>
          <p className="font-display text-4xl text-amber-300 uppercase tracking-wide">
            {championName}
          </p>
        </Card>
      )}

      {STAGE_ORDER.map((stage) => {
        const stageMatches = playoffMatches.filter((m) => m.stage === stage);
        if (stageMatches.length === 0) return null;

        return (
          <Card key={stage}>
            <h3 className="font-display text-xl tracking-wide text-emerald-400 uppercase mb-4">
              {STAGE_LABELS[stage]}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {stageMatches.map((m) => {
                const home =
                  getPlayerName(tournament.players, m.homePlayerId) || 'Por definir';
                const away =
                  getPlayerName(tournament.players, m.awayPlayerId) || 'Por definir';
                const played = isMatchPlayed(m);
                const canPlay = m.homePlayerId && m.awayPlayerId;

                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-4 transition ${
                      played
                        ? 'border-emerald-500/30 bg-emerald-950/20'
                        : 'border-slate-600/60 bg-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <span
                        className={`flex-1 text-right text-sm truncate ${
                          m.winnerId === m.homePlayerId
                            ? 'font-bold text-emerald-300'
                            : 'text-white'
                        }`}
                      >
                        {home}
                      </span>
                      <span className="font-display text-xl text-slate-300 shrink-0">
                        {played ? `${m.homeScore}:${m.awayScore}` : 'VS'}
                      </span>
                      <span
                        className={`flex-1 text-left text-sm truncate ${
                          m.winnerId === m.awayPlayerId
                            ? 'font-bold text-emerald-300'
                            : 'text-white'
                        }`}
                      >
                        {away}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge color={played ? 'green' : 'amber'}>
                        {played ? 'Final' : 'Pendiente'}
                      </Badge>
                      {canPlay && (
                        <Button
                          variant={played ? 'ghost' : 'primary'}
                          className="text-xs"
                          onClick={() => onEditMatch(m)}
                        >
                          {played ? 'Editar' : 'Resultado'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
