import { useMemo, useState } from 'react';
import type { Match, Tournament } from '@/types/tournament';
import { getRestPlayerForRound } from '@/lib/scheduler';
import { findPlayer, getPlayerClubName } from '@/lib/playerDisplay';
import { getPlayerName, isMatchPlayed } from '@/lib/utils';
import { Badge, Button, Card, Select, STAGE_LABELS } from './ui';

interface Props {
  tournament: Tournament;
  onEditMatch: (match: Match) => void;
}

function parseRoundLabel(key: string, match: Match | undefined) {
  if (match?.stage !== 'GROUP') {
    return { title: STAGE_LABELS[match?.stage ?? ''] ?? key, round: null, group: null };
  }
  const m = key.match(/Jornada (\d+)(?: — (.+))?/);
  return {
    title: 'Jornada',
    round: m?.[1] ?? '?',
    group: m?.[2] ?? null,
  };
}

export default function MatchCalendar({ tournament, onEditMatch }: Props) {
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'played'>(
    'all',
  );

  const allFiltered = useMemo(() => {
    let list = [...tournament.matches];
    if (filterGroup !== 'all') {
      list = list.filter((m) => m.groupId === filterGroup);
    }
    if (filterStatus === 'pending') {
      list = list.filter((m) => !isMatchPlayed(m));
    } else if (filterStatus === 'played') {
      list = list.filter(isMatchPlayed);
    }
    return list;
  }, [tournament.matches, filterGroup, filterStatus]);

  const stats = useMemo(() => {
    const total = allFiltered.length;
    const played = allFiltered.filter(isMatchPlayed).length;
    return { total, played, pending: total - played };
  }, [allFiltered]);

  const byRound = useMemo(() => {
    const sections: {
      key: string;
      matches: Match[];
      restPlayerId: string | null;
      sample: Match | undefined;
    }[] = [];
    const map = new Map<string, Match[]>();

    for (const m of allFiltered) {
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
      sections.push({ key, matches: roundMatches, restPlayerId, sample });
    }

    return sections.sort((a, b) => {
      const roundA = a.matches[0]?.round ?? 0;
      const roundB = b.matches[0]?.round ?? 0;
      return roundA - roundB || a.key.localeCompare(b.key, 'es');
    });
  }, [allFiltered, tournament.groups]);

  const hasMatches = tournament.matches.length > 0;

  if (!hasMatches) {
    return (
      <Card className="text-center py-16">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-3xl">
          📅
        </div>
        <p className="text-muted">Genera el calendario desde la pestaña Grupos.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de estadísticas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel rounded-xl px-4 py-3 text-center">
          <p className="font-display text-2xl text-white">{stats.total}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-300 mt-0.5">
            Partidos
          </p>
        </div>
        <div className="glass-panel rounded-xl px-4 py-3 text-center border-emerald-500/20">
          <p className="font-display text-2xl text-emerald-400">{stats.played}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-300 mt-0.5">
            Jugados
          </p>
        </div>
        <div className="glass-panel rounded-xl px-4 py-3 text-center border-amber-500/20">
          <p className="font-display text-2xl text-amber-400">{stats.pending}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-300 mt-0.5">
            Pendientes
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="min-w-[140px]"
          >
            <option value="all">Todos los grupos</option>
            {tournament.groups.map((g) => (
              <option key={g.id} value={g.id}>
                Grupo {g.name}
              </option>
            ))}
          </Select>
          <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-600/50">
            {(
              [
                ['all', 'Todos'],
                ['pending', 'Pendientes'],
                ['played', 'Jugados'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilterStatus(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterStatus === value
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Jornadas */}
      {byRound.length === 0 ? (
        <Card className="text-center py-10 text-muted">
          No hay partidos con estos filtros.
        </Card>
      ) : (
        <div className="space-y-8">
          {byRound.map(({ key, matches: roundMatches, restPlayerId, sample }) => {
            const parsed = parseRoundLabel(key, sample);
            const groupPlayed = roundMatches.filter(isMatchPlayed).length;

            return (
              <section key={key} className="relative">
                {/* Cabecera de jornada */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 font-display text-xl text-white shadow-lg shadow-emerald-500/30 shrink-0">
                    {parsed.round ?? '·'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl sm:text-2xl tracking-wide text-white uppercase truncate">
                      {parsed.group
                        ? `${parsed.title} ${parsed.round} · Grupo ${parsed.group}`
                        : key}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {groupPlayed} de {roundMatches.length} partidos jugados
                    </p>
                  </div>
                  <div className="hidden sm:block h-px flex-1 max-w-[80px] bg-gradient-to-r from-emerald-500/50 to-transparent" />
                </div>

                {/* Partidos */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {roundMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      tournament={tournament}
                      onEdit={() => onEditMatch(m)}
                    />
                  ))}

                  {restPlayerId && (
                    <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-dashed border-slate-500/60 bg-slate-800/80 px-4 py-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-lg">
                        💤
                      </span>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-300">
                          Descansa esta jornada
                        </p>
                        <p className="font-semibold text-white">
                          {getPlayerName(tournament.players, restPlayerId)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  tournament,
  onEdit,
}: {
  match: Match;
  tournament: Tournament;
  onEdit: () => void;
}) {
  const homePlayer = findPlayer(tournament.players, match.homePlayerId);
  const awayPlayer = findPlayer(tournament.players, match.awayPlayerId);
  const home = getPlayerName(tournament.players, match.homePlayerId) || 'Por definir';
  const away = getPlayerName(tournament.players, match.awayPlayerId) || 'Por definir';
  const homeClub = getPlayerClubName(homePlayer);
  const awayClub = getPlayerClubName(awayPlayer);
  const played = isMatchPlayed(match);
  const homeWins = played && match.homeScore! > match.awayScore!;
  const awayWins = played && match.awayScore! > match.homeScore!;
  const canEdit = match.homePlayerId && match.awayPlayerId;

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        played
          ? 'border-emerald-500/25 bg-gradient-to-br from-slate-900/90 to-emerald-950/20'
          : 'border-slate-600/60 bg-slate-800/90 hover:border-emerald-500/30 hover:bg-slate-800'
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition" />

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <Badge color={played ? 'green' : 'amber'}>
            {played ? 'Final' : 'Por jugar'}
          </Badge>
          {match.stage !== 'GROUP' && (
            <span className="text-[10px] uppercase tracking-wider text-slate-300">
              {STAGE_LABELS[match.stage]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex-1 text-right min-w-0 ${homeWins ? 'text-emerald-300' : 'text-white'}`}>
            <p className={`truncate text-sm ${homeWins ? 'font-bold' : 'font-medium'}`}>
              {home}
            </p>
            {homeClub && (
              <p className="truncate text-[10px] text-emerald-400/90 mt-0.5">{homeClub}</p>
            )}
            <span className="text-[10px] text-slate-300 uppercase">Local</span>
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center w-16 sm:w-20">
            {played ? (
              <div className="font-display text-2xl sm:text-3xl tracking-wider text-white tabular-nums">
                <span className={homeWins ? 'text-emerald-400' : ''}>{match.homeScore}</span>
                <span className="text-slate-400 mx-0.5">:</span>
                <span className={awayWins ? 'text-emerald-400' : ''}>{match.awayScore}</span>
              </div>
            ) : (
              <div className="font-display text-lg text-slate-400">VS</div>
            )}
          </div>

          <div className={`flex-1 text-left min-w-0 ${awayWins ? 'text-emerald-300' : 'text-white'}`}>
            <p className={`truncate text-sm ${awayWins ? 'font-bold' : 'font-medium'}`}>
              {away}
            </p>
            {awayClub && (
              <p className="truncate text-[10px] text-emerald-400/90 mt-0.5">{awayClub}</p>
            )}
            <span className="text-[10px] text-slate-300 uppercase">Visitante</span>
          </div>
        </div>

        {canEdit && (
          <Button
            variant={played ? 'ghost' : 'primary'}
            className="w-full mt-4 text-xs"
            onClick={onEdit}
          >
            {played ? 'Editar resultado' : 'Introducir resultado'}
          </Button>
        )}
      </div>
    </article>
  );
}
