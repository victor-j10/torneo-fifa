import { useState } from 'react';
import type { Tournament } from '@/types/tournament';
import { EUROPEAN_CLUBS, getClubById } from '@/data/europeanClubs';
import { useTournamentStore } from '@/store/useTournamentStore';
import PlayerClubBadge from './PlayerClubBadge';
import { Badge, Button, Card } from './ui';

interface Props {
  tournament: Tournament;
}

export default function ClubDraw({ tournament }: Props) {
  const drawClubsForPlayers = useTournamentStore((s) => s.drawClubsForPlayers);
  const clearClubAssignments = useTournamentStore((s) => s.clearClubAssignments);

  const [isDrawing, setIsDrawing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const assignedCount = tournament.players.filter((p) => p.clubId).length;
  const hasAssignments = assignedCount > 0;

  const handleDraw = async () => {
    if (tournament.players.length === 0) return;
    setIsDrawing(true);
    setRevealed(false);
    clearClubAssignments(tournament.id);

    await new Promise((r) => setTimeout(r, 600));
    drawClubsForPlayers(tournament.id);
    setIsDrawing(false);
    setRevealed(true);
  };

  const handleReset = () => {
    clearClubAssignments(tournament.id);
    setRevealed(false);
  };

  const maxAssignable = Math.min(tournament.players.length, EUROPEAN_CLUBS.length);

  return (
    <div className="space-y-6">
      <Card glow>
        <h2 className="font-display text-2xl tracking-wide text-white uppercase mb-2">
          Sorteo de equipos
        </h2>
        <p className="text-muted text-sm mb-6">
          Asigna al azar uno de los {EUROPEAN_CLUBS.length} mejores clubes de Europa a cada
          jugador. Cada club solo puede salir una vez.
        </p>

        {tournament.players.length === 0 ? (
          <p className="text-amber-300/90 text-sm rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3">
            Añade jugadores en la pestaña Jugadores antes de sortear.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="rounded-xl bg-slate-800 px-4 py-2 border border-slate-600/50">
                <span className="text-xs text-slate-300 uppercase tracking-wider">Jugadores</span>
                <p className="font-display text-xl text-white">{tournament.players.length}</p>
              </div>
              <div className="rounded-xl bg-slate-800 px-4 py-2 border border-emerald-500/30">
                <span className="text-xs text-slate-300 uppercase tracking-wider">Asignados</span>
                <p className="font-display text-xl text-emerald-400">{assignedCount}</p>
              </div>
              <div className="rounded-xl bg-slate-800 px-4 py-2 border border-slate-600/50">
                <span className="text-xs text-slate-300 uppercase tracking-wider">Clubes</span>
                <p className="font-display text-xl text-white">{EUROPEAN_CLUBS.length}</p>
              </div>
            </div>

            {tournament.players.length > EUROPEAN_CLUBS.length && (
              <p className="text-amber-300/90 text-sm mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                Hay más jugadores que clubes: solo {EUROPEAN_CLUBS.length} recibirán equipo en
                cada sorteo.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleDraw}
                disabled={isDrawing}
                className="min-w-[160px]"
              >
                {isDrawing ? 'Sorteando…' : hasAssignments ? 'Volver a sortear' : 'Sortear equipos'}
              </Button>
              {hasAssignments && (
                <Button variant="outline" onClick={handleReset}>
                  Limpiar asignaciones
                </Button>
              )}
            </div>
          </>
        )}
      </Card>

      <Card>
        <h3 className="font-display text-lg tracking-wide text-white uppercase mb-4">
          Pool de clubes
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {EUROPEAN_CLUBS.map((club) => {
            const takenBy = tournament.players.find((p) => p.clubId === club.id);
            return (
              <div
                key={club.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                  takenBy
                    ? 'border-emerald-500/40 bg-emerald-950/30'
                    : 'border-slate-600/50 bg-slate-800/80'
                }`}
                style={{ borderLeftColor: club.color, borderLeftWidth: 4 }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{club.name}</p>
                  <p className="text-xs text-slate-300">{club.league}</p>
                </div>
                <span className="font-display text-lg text-emerald-400 shrink-0">
                  {club.rating}
                </span>
                {takenBy && (
                  <Badge color="green">{takenBy.name.split(' ')[0]}</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {tournament.players.length > 0 && (
        <Card>
          <h3 className="font-display text-lg tracking-wide text-white uppercase mb-4">
            Resultado del sorteo
          </h3>
          {!hasAssignments ? (
            <p className="text-muted text-sm text-center py-8">
              Pulsa &quot;Sortear equipos&quot; para asignar clubes a los jugadores.
            </p>
          ) : (
            <ul className="space-y-3">
              {tournament.players.map((p, i) => {
                const club = p.clubId ? getClubById(p.clubId) : null;
                const showReveal = revealed || hasAssignments;

                return (
                  <li
                    key={p.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${
                      club
                        ? 'border-emerald-500/30 bg-gradient-to-r from-slate-800 to-emerald-950/20'
                        : 'border-slate-600/50 bg-slate-800/60'
                    } ${showReveal ? 'opacity-100 translate-y-0' : 'opacity-70'}`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 font-display text-lg text-emerald-400">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{p.name}</p>
                        {club ? (
                          <p className="text-xs text-slate-300 mt-0.5">
                            juega con <span className="text-emerald-300">{club.name}</span>
                          </p>
                        ) : (
                          <p className="text-xs text-amber-300/80 mt-0.5">Sin club asignado</p>
                        )}
                      </div>
                    </div>
                    {club ? (
                      <PlayerClubBadge player={p} size="md" />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {hasAssignments && maxAssignable < tournament.players.length && (
            <p className="text-xs text-slate-300 mt-4">
              {tournament.players.length - maxAssignable} jugador(es) quedaron sin club (solo hay{' '}
              {EUROPEAN_CLUBS.length} equipos disponibles).
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
