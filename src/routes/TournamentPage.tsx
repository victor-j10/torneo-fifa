import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

type Tab = 'resumen' | 'jugadores' | 'grupos' | 'calendario' | 'clasificacion' | 'playoffs';

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'jugadores', label: 'Jugadores' },
  { id: 'grupos', label: 'Grupos' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'clasificacion', label: 'Clasificación' },
  { id: 'playoffs', label: 'Playoffs' },
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
        <Link to="/" className="text-green-400 text-sm mt-2 inline-block">
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
      <div className="mb-6">
        <Link to="/" className="text-sm text-slate-400 hover:text-green-400">
          ← Torneos
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <h2 className="text-2xl font-bold">{tournament.name}</h2>
          <Badge color="blue">{STATUS_LABELS[tournament.status]}</Badge>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-slate-800 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              tab === t.id
                ? 'bg-slate-800 text-green-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'resumen' && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-3">Estado del torneo</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Jugadores</dt>
                <dd className="font-medium">{tournament.players.length}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Grupos</dt>
                <dd className="font-medium">{tournament.groups.length}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Partidos de grupo</dt>
                <dd className="font-medium">
                  {playedGroup} / {groupMatches.length}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Puntos (V/E/D)</dt>
                <dd className="font-medium">
                  {tournament.pointsWin}/{tournament.pointsDraw}/
                  {tournament.pointsLoss}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Clasifican por grupo</dt>
                <dd className="font-medium">{tournament.advanceCount}</dd>
              </div>
            </dl>
          </Card>

          {championId && (
            <Card className="border-green-700 bg-green-950/20 text-center py-6">
              <p className="text-green-400 text-sm">Campeón del torneo</p>
              <p className="text-3xl font-bold mt-1">
                {getPlayerName(tournament.players, championId)}
              </p>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold mb-2">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setTab('jugadores')}>
                Gestionar jugadores
              </Button>
              <Button variant="secondary" onClick={() => setTab('grupos')}>
                Configurar grupos
              </Button>
              {groupMatches.length > 0 && (
                <Button variant="secondary" onClick={() => setTab('calendario')}>
                  Ver calendario
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
      {tab === 'grupos' && <GroupEditor tournament={tournament} />}
      {tab === 'calendario' && (
        <MatchCalendar
          tournament={tournament}
          onEditMatch={setEditMatch}
        />
      )}
      {tab === 'clasificacion' && <StandingsTable tournament={tournament} />}
      {tab === 'playoffs' && (
        <PlayoffBracket
          tournament={tournament}
          onEditMatch={setEditMatch}
        />
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
