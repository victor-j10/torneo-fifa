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
      <Card>
        <h2 className="text-lg font-semibold mb-2">Playoffs</h2>
        <p className="text-slate-400 text-sm mb-4">
          Cuando termines la fase de grupos, genera el cuadro eliminatorio.
        </p>
        <Button
          onClick={() => startPlayoffs(tournament.id)}
          disabled={!allGroupDone}
        >
          Iniciar playoffs
        </Button>
        {!allGroupDone && (
          <p className="text-amber-400 text-xs mt-2">
            Completa todos los partidos de grupo primero.
          </p>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {championName && (
        <Card className="border-green-700 bg-green-950/30 text-center">
          <p className="text-sm text-green-400">Campeón</p>
          <p className="text-2xl font-bold">{championName}</p>
        </Card>
      )}

      {STAGE_ORDER.map((stage) => {
        const stageMatches = playoffMatches.filter((m) => m.stage === stage);
        if (stageMatches.length === 0) return null;

        return (
          <Card key={stage}>
            <h3 className="font-semibold text-green-400 mb-3">
              {STAGE_LABELS[stage]}
            </h3>
            <div className="space-y-2">
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
                    className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-3"
                  >
                    <div>
                      <span
                        className={
                          m.winnerId === m.homePlayerId ? 'font-bold text-green-400' : ''
                        }
                      >
                        {home}
                      </span>
                      <span className="text-slate-500 mx-2">
                        {played ? `${m.homeScore} - ${m.awayScore}` : 'vs'}
                      </span>
                      <span
                        className={
                          m.winnerId === m.awayPlayerId ? 'font-bold text-green-400' : ''
                        }
                      >
                        {away}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color={played ? 'green' : 'amber'}>
                        {played ? 'Jugado' : 'Pendiente'}
                      </Badge>
                      {canPlay && (
                        <Button
                          variant="ghost"
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
