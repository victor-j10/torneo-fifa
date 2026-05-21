import { useState } from 'react';
import type { Tournament } from '@/types/tournament';
import { canEditGroups, useTournamentStore } from '@/store/useTournamentStore';
import { Button, Card, Input } from './ui';

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
        <h2 className="text-lg font-semibold mb-4">Grupos</h2>
        {!editable && (
          <p className="text-amber-400 text-sm mb-4">
            No puedes editar grupos: ya hay partidos jugados.
          </p>
        )}
        {editable && (
          <form onSubmit={handleCreateGroup} className="flex gap-2 mb-4">
            <Input
              placeholder="Nombre del grupo (ej. A)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button type="submit">Crear grupo</Button>
          </form>
        )}
        {editable && tournament.players.length > 0 && tournament.groups.length > 0 && (
          <Button
            variant="secondary"
            className="mb-4"
            onClick={() => distributePlayersEvenly(tournament.id)}
          >
            Repartir jugadores equitativamente
          </Button>
        )}
        {tournament.groups.length === 0 ? (
          <p className="text-slate-500 text-sm">Crea al menos 2 grupos.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tournament.groups.map((g) => (
              <div
                key={g.id}
                className="rounded-lg border border-slate-700 bg-slate-800/40 p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-green-400">Grupo {g.name}</h3>
                  {editable && (
                    <Button
                      variant="ghost"
                      className="text-red-400 text-xs"
                      onClick={() => removeGroup(tournament.id, g.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <ul className="space-y-1 mb-3 min-h-[2rem]">
                  {g.playerIds.map((pid) => {
                    const player = tournament.players.find((p) => p.id === pid);
                    return (
                      <li
                        key={pid}
                        className="flex justify-between text-sm bg-slate-900/50 rounded px-2 py-1"
                      >
                        {player?.name}
                        {editable && (
                          <button
                            type="button"
                            className="text-slate-500 hover:text-red-400"
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
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
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
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {tournament.groups.length >= 2 &&
        tournament.groups.every((g) => g.playerIds.length >= 2) && (
          <Card>
            <h3 className="font-semibold mb-2">Calendario de grupos</h3>
            <p className="text-slate-400 text-sm mb-4">
              Genera todos los partidos (todos contra todos) por grupo.
            </p>
            {!hasFixtures ? (
              <Button onClick={() => generateGroupFixtures(tournament.id)}>
                Generar calendario
              </Button>
            ) : (
              <p className="text-green-400 text-sm">
                Calendario generado. Ve a Calendario o Clasificación.
              </p>
            )}
          </Card>
        )}
    </div>
  );
}
