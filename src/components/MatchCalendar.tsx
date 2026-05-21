import { useMemo, useState } from 'react';
import type { Match, Tournament } from '@/types/tournament';
import { getRestPlayerForRound } from '@/lib/scheduler';
import { getPlayerName, isMatchPlayed } from '@/lib/utils';
import { Badge, Button, Card, STAGE_LABELS } from './ui';

interface Props {
  tournament: Tournament;
  onEditMatch: (match: Match) => void;
}

export default function MatchCalendar({ tournament, onEditMatch }: Props) {
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'played'>(
    'all',
  );
  const [viewMode, setViewMode] = useState<'round' | 'list'>('round');

  const matches = useMemo(() => {
    let list = [...tournament.matches];
    if (filterGroup !== 'all') {
      list = list.filter((m) => m.groupId === filterGroup);
    }
    if (filterStatus === 'pending') {
      list = list.filter((m) => !isMatchPlayed(m));
    } else if (filterStatus === 'played') {
      list = list.filter(isMatchPlayed);
    }
    return list.sort((a, b) => a.round - b.round || a.stage.localeCompare(b.stage));
  }, [tournament.matches, filterGroup, filterStatus]);

  const byRound = useMemo(() => {
    const sections: {
      key: string;
      matches: Match[];
      restPlayerId: string | null;
    }[] = [];
    const map = new Map<string, Match[]>();

    for (const m of matches) {
      const key =
        m.stage === 'GROUP'
          ? `Jornada ${m.round}${m.groupId ? ` — ${tournament.groups.find((g) => g.id === m.groupId)?.name ?? ''}` : ''}`
          : STAGE_LABELS[m.stage] ?? m.stage;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }

    for (const [key, roundMatches] of map) {
      const sample = roundMatches[0];
      let restPlayerId: string | null = null;

      if (sample?.stage === 'GROUP' && sample.groupId) {
        const group = tournament.groups.find((g) => g.id === sample.groupId);
        if (group) {
          restPlayerId = getRestPlayerForRound(group.playerIds, roundMatches);
        }
      }

      sections.push({ key, matches: roundMatches, restPlayerId });
    }

    return sections.sort((a, b) => {
      const roundA = a.matches[0]?.round ?? 0;
      const roundB = b.matches[0]?.round ?? 0;
      return roundA - roundB || a.key.localeCompare(b.key, 'es');
    });
  }, [matches, tournament.groups]);

  const groupMatches = tournament.matches.filter((m) => m.stage === 'GROUP');
  const playoffMatches = tournament.matches.filter((m) => m.stage !== 'GROUP');

  if (groupMatches.length === 0 && playoffMatches.length === 0) {
    return (
      <Card>
        <p className="text-slate-500">Genera el calendario desde la pestaña Grupos.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm"
          >
            <option value="all">Todos los grupos</option>
            {tournament.groups.map((g) => (
              <option key={g.id} value={g.id}>
                Grupo {g.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as 'all' | 'pending' | 'played')
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="played">Jugados</option>
          </select>
          <div className="flex gap-1 ml-auto">
            <Button
              variant={viewMode === 'round' ? 'primary' : 'ghost'}
              className="text-xs"
              onClick={() => setViewMode('round')}
            >
              Por jornada
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              className="text-xs"
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
          </div>
        </div>

        {viewMode === 'round' ? (
          <div className="space-y-6">
            {byRound.map(({ key: roundLabel, matches: roundMatches, restPlayerId }) => (
              <div key={roundLabel}>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">
                  {roundLabel}
                </h3>
                <div className="space-y-2">
                  {roundMatches.map((m) => (
                    <MatchRow
                      key={m.id}
                      match={m}
                      tournament={tournament}
                      onEdit={() => onEditMatch(m)}
                    />
                  ))}
                  {restPlayerId && (
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-800/30 px-3 py-2 text-sm text-slate-400">
                      <span className="text-slate-500">Descansa:</span>
                      <span className="font-medium text-slate-300">
                        {getPlayerName(tournament.players, restPlayerId)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                tournament={tournament}
                onEdit={() => onEditMatch(m)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function MatchRow({
  match,
  tournament,
  onEdit,
}: {
  match: Match;
  tournament: Tournament;
  onEdit: () => void;
}) {
  const home = getPlayerName(tournament.players, match.homePlayerId) || 'TBD';
  const away = getPlayerName(tournament.players, match.awayPlayerId) || 'TBD';
  const played = isMatchPlayed(match);

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/50 px-3 py-2 text-sm">
      <div className="flex-1 min-w-0">
        <span className={played && match.homeScore! > match.awayScore! ? 'font-bold' : ''}>
          {home}
        </span>
        <span className="text-slate-500 mx-2">
          {played ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
        </span>
        <span className={played && match.awayScore! > match.homeScore! ? 'font-bold' : ''}>
          {away}
        </span>
      </div>
      <Badge color={played ? 'green' : 'amber'}>
        {played ? 'Jugado' : 'Pendiente'}
      </Badge>
      {(match.homePlayerId && match.awayPlayerId) && (
        <Button variant="ghost" className="text-xs shrink-0" onClick={onEdit}>
          {played ? 'Editar' : 'Resultado'}
        </Button>
      )}
    </div>
  );
}
