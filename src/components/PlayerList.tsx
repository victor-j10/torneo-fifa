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
      <h2 className="text-lg font-semibold mb-4">Jugadores</h2>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input
          placeholder="Nombre del jugador"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">Añadir</Button>
      </form>
      {tournament.players.length === 0 ? (
        <p className="text-slate-500 text-sm">Añade al menos 4 jugadores.</p>
      ) : (
        <ul className="space-y-2">
          {tournament.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2"
            >
              <span>{p.name}</span>
              <Button
                variant="ghost"
                className="text-red-400 text-xs px-2 py-1"
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
