import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ClubDraw from '@/components/ClubDraw';
import GroupEditor from '@/components/GroupEditor';
import MatchCalendar from '@/components/MatchCalendar';
import MatchResultModal from '@/components/MatchResultModal';
import PlayerList from '@/components/PlayerList';
import PlayoffBracket from '@/components/PlayoffBracket';
import StandingsTable from '@/components/StandingsTable';
import { Badge, Button, Card, STATUS_LABELS } from '@/components/ui';
import { getChampion } from '@/lib/bracket';
import { areAllGroupMatchesPlayed } from '@/lib/standings';
import { getPlayerName } from '@/lib/utils';
import { useTournamentStore } from '@/store/useTournamentStore';
import type { Match } from '@/types/tournament';

type Tab =
  | 'resumen'
  | 'jugadores'
  | 'equipos'
  | 'grupos'
  | 'calendario'
  | 'clasificacion'
  | 'playoffs';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'resumen', label: 'Resumen', icon: '📊' },
  { id: 'jugadores', label: 'Jugadores', icon: '👤' },
  { id: 'equipos', label: 'Sorteo equipos', icon: '🎲' },
  { id: 'grupos', label: 'Grupos', icon: '⚔️' },
  { id: 'calendario', label: 'Calendario', icon: '📅' },
  { id: 'clasificacion', label: 'Clasificación', icon: '🏆' },
  { id: 'playoffs', label: 'Playoffs', icon: '🎯' },
];

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>();
  const tournament = useTournamentStore((s) =>
    s.tournaments.find((t) => t.id === id),
  );
  const updateMatchResult = useTournamentStore((s) => s.updateMatchResult);
  const startPlayoffs = useTournamentStore((s) => s.startPlayoffs);

  const [tab, setTab] = useState<Tab>('resumen');
  const [editMatch, setEditMatch] = useState<Match | null>(null);

  if (!tournament) {
    return (
      <Card>
        <p>Torneo no encontrado.</p>
        <Link to="/" className="text-emerald-400 text-sm mt-2 inline-block hover:underline">
          ← Volver
        </Link>
      </Card>
    );
  }

  const championId = getChampion(tournament.matches);
  const groupMatches = tournament.matches.filter((m) => m.stage === 'GROUP');
  const playedGroup = groupMatches.filter(
    (m) => m.homeScore !== undefined && m.awayScore !== undefined,
  ).length;
  const hasPlayoffs = tournament.matches.some((m) => m.stage !== 'GROUP');
  const progress =
    groupMatches.length > 0 ? Math.round((playedGroup / groupMatches.length) * 100) : 0;

  const handleSaveResult = (
    homeScore: number,
    awayScore: number,
    winnerId?: string,
  ) => {
    if (!editMatch) return;
    updateMatchResult(tournament.id, editMatch.id, homeScore, awayScore, winnerId);
  };

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-emerald-400 transition mb-4"
      >
        ← Torneos
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl tracking-wide text-white uppercase">
            {tournament.name}
          </h2>
          <Badge color="blue">{STATUS_LABELS[tournament.status]}</Badge>
        </div>
        {groupMatches.length > 0 && (
          <div className="glass-panel rounded-xl px-4 py-2 min-w-[140px]">
            <p className="text-[10px] uppercase tracking-widest text-slate-300">Progreso grupos</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-400">{progress}%</span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex gap-1 overflow-x-auto pb-1 mb-8 scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-gradient-to-r from-emerald-600/90 to-emerald-500/80 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-base opacity-80">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'resumen' && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-xl tracking-wide text-white uppercase mb-4">
              Estado del torneo
            </h3>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                ['Jugadores', tournament.players.length],
                ['Grupos', tournament.groups.length],
                ['Partidos grupo', `${playedGroup} / ${groupMatches.length}`],
                ['Puntos V/E/D', `${tournament.pointsWin}/${tournament.pointsDraw}/${tournament.pointsLoss}`],
                ['Clasifican', tournament.advanceCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-800 px-4 py-3 border border-slate-600/50">
                  <dt className="text-slate-300 text-xs uppercase tracking-wider">{label}</dt>
                  <dd className="font-display text-xl text-white mt-1">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {championId && (
            <Card glow className="text-center py-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
              <p className="text-amber-400/90 text-xs uppercase tracking-[0.3em] mb-2">Campeón</p>
              <p className="font-display text-4xl sm:text-5xl text-amber-300 uppercase tracking-wide">
                {getPlayerName(tournament.players, championId)}
              </p>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold mb-3 text-white">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setTab('jugadores')}>
                Jugadores
              </Button>
              <Button variant="secondary" onClick={() => setTab('equipos')}>
                Sorteo equipos
              </Button>
              <Button variant="secondary" onClick={() => setTab('grupos')}>
                Grupos
              </Button>
              {groupMatches.length > 0 && (
                <Button variant="secondary" onClick={() => setTab('calendario')}>
                  Calendario
                </Button>
              )}
              {areAllGroupMatchesPlayed(tournament) && !hasPlayoffs && (
                <Button onClick={() => startPlayoffs(tournament.id)}>
                  Iniciar playoffs
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === 'jugadores' && <PlayerList tournament={tournament} />}
      {tab === 'equipos' && <ClubDraw tournament={tournament} />}
      {tab === 'grupos' && <GroupEditor tournament={tournament} />}
      {tab === 'calendario' && (
        <MatchCalendar tournament={tournament} onEditMatch={setEditMatch} />
      )}
      {tab === 'clasificacion' && <StandingsTable tournament={tournament} />}
      {tab === 'playoffs' && (
        <PlayoffBracket tournament={tournament} onEditMatch={setEditMatch} />
      )}

      <MatchResultModal
        tournament={tournament}
        match={editMatch}
        onClose={() => setEditMatch(null)}
        onSave={handleSaveResult}
      />
    </div>
  );
}
