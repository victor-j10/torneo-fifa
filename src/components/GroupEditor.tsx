import { useState } from 'react';
import type { Tournament } from '@/types/tournament';
import { canEditGroups, useTournamentStore } from '@/store/useTournamentStore';
import { Button, Card, Input, Select } from './ui';

export default function GroupEditor({ tournament }: { tournament: Tournament }) {
  const [groupName, setGroupName] = useState('');
  const createGroup = useTournamentStore((s) => s.createGroup);
  const removeGroup = useTournamentStore((s) => s.removeGroup);
  const assignPlayerToGroup = useTournamentStore((s) => s.assignPlayerToGroup);
  const removePlayerFromGroup = useTournamentStore((s) => s.removePlayerFromGroup);
  const distributePlayersEvenly = useTournamentStore((s) => s.distributePlayersEvenly);
  const generateGroupFixtures = useTournamentStore((s) => s.generateGroupFixtures);

  const editable = canEditGroups(tournament);
  const hasFixtures = tournament.matches.some((m) => m.stage === 'GROUP');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup(tournament.id, groupName);
    setGroupName('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-display text-xl tracking-wide text-white uppercase mb-4">
          Grupos
        </h2>
        {!editable && (
          <p className="text-amber-400/90 text-sm mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            No puedes editar grupos: ya hay partidos jugados.
          </p>
        )}
        {editable && (
          <form onSubmit={handleCreateGroup} className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              placeholder="Nombre del grupo (ej. A)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="sm:shrink-0">
              Crear grupo
            </Button>
          </form>
        )}
        {editable && tournament.players.length > 0 && tournament.groups.length > 0 && (
          <Button
            variant="outline"
            className="mb-6"
            onClick={() => distributePlayersEvenly(tournament.id)}
          >
            Repartir jugadores equitativamente
          </Button>
        )}
        {tournament.groups.length === 0 ? (
          <p className="text-muted text-sm">Crea al menos 2 grupos.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tournament.groups.map((g) => (
              <div
                key={g.id}
                className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/80 to-emerald-950/10 p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-display text-lg tracking-wide text-emerald-400 uppercase">
                    Grupo {g.name}
                  </h3>
                  {editable && (
                    <Button
                      variant="ghost"
                      className="text-red-400 text-xs px-2"
                      onClick={() => removeGroup(tournament.id, g.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <ul className="space-y-1.5 mb-3 min-h-[2rem]">
                  {g.playerIds.length === 0 && (
                    <li className="text-slate-300 text-xs py-2">Sin jugadores</li>
                  )}
                  {g.playerIds.map((pid) => {
                    const player = tournament.players.find((p) => p.id === pid);
                    return (
                      <li
                        key={pid}
                        className="flex justify-between items-center text-sm bg-slate-800 rounded-lg px-3 py-2 border border-slate-600/50 text-slate-100"
                      >
                        {player?.name}
                        {editable && (
                          <button
                            type="button"
                            className="text-slate-400 hover:text-red-400 ml-2"
                            onClick={() =>
                              removePlayerFromGroup(tournament.id, g.id, pid)
                            }
                          >
                            ×
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {editable && (
                  <Select
                    className="w-full"
                    value=""
                    onChange={(e) => {
                      if (e.target.value)
                        assignPlayerToGroup(tournament.id, g.id, e.target.value);
                    }}
                  >
                    <option value="">+ Añadir jugador…</option>
                    {tournament.players
                      .filter((p) => !g.playerIds.includes(p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </Select>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {tournament.groups.length >= 2 &&
        tournament.groups.every((g) => g.playerIds.length >= 2) && (
          <Card glow>
            <h3 className="font-display text-lg tracking-wide text-white uppercase mb-2">
              Calendario de grupos
            </h3>
            <p className="text-muted text-sm mb-4">
              Genera todos los partidos (todos contra todos) por grupo.
            </p>
            {!hasFixtures ? (
              <Button onClick={() => generateGroupFixtures(tournament.id)}>
                Generar calendario
              </Button>
            ) : (
              <p className="text-emerald-400 text-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Calendario generado — ve a Calendario o Clasificación
              </p>
            )}
          </Card>
        )}
    </div>
  );
}
