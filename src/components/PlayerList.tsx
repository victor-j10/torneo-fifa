import { useState } from 'react';
import type { Tournament } from '@/types/tournament';
import { useTournamentStore } from '@/store/useTournamentStore';
import { Button, Card, Input } from './ui';

export default function PlayerList({ tournament }: { tournament: Tournament }) {
  const [name, setName] = useState('');
  const addPlayer = useTournamentStore((s) => s.addPlayer);
  const removePlayer = useTournamentStore((s) => s.removePlayer);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addPlayer(tournament.id, name);
    setName('');
  };

  return (
    <Card>
      <h2 className="font-display text-xl tracking-wide text-white uppercase mb-4">
        Jugadores
      </h2>
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-6">
        <Input
          placeholder="Nombre del jugador"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" className="sm:shrink-0">
          Añadir jugador
        </Button>
      </form>
      {tournament.players.length === 0 ? (
        <p className="text-muted text-sm text-center py-6">
          Añade al menos 4 jugadores para empezar.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {tournament.players.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-slate-600/50 bg-slate-800 px-4 py-3 group hover:border-emerald-500/30 transition"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 font-display text-sm text-emerald-400">
                  {i + 1}
                </span>
                <span className="font-medium text-white">{p.name}</span>
              </div>
              <Button
                variant="ghost"
                className="text-red-400/80 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition"
                onClick={() => removePlayer(tournament.id, p.id)}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
