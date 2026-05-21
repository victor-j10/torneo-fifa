import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournamentStore } from '@/store/useTournamentStore';
import { Badge, Button, Card, Input, STATUS_LABELS } from '@/components/ui';

export default function HomePage() {
  const tournaments = useTournamentStore((s) => s.tournaments);
  const createTournament = useTournamentStore((s) => s.createTournament);
  const deleteTournament = useTournamentStore((s) => s.deleteTournament);
  const importTournament = useTournamentStore((s) => s.importTournament);

  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTournament({ name });
    setName('');
    setShowForm(false);
  };

  const handleExport = (id: string) => {
    const t = tournaments.find((x) => x.id === id);
    if (!t) return;
    const blob = new Blob([JSON.stringify(t, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t.name.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.id && data.name) importTournament(data);
      } catch {
        alert('Archivo JSON inválido');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mis torneos</h2>
          <p className="text-slate-400 text-sm mt-1">
            Datos guardados en tu navegador (localStorage).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleImport}>
            Importar JSON
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nuevo torneo'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              placeholder="Nombre del torneo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Button type="submit">Crear</Button>
          </form>
        </Card>
      )}

      {tournaments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-400 mb-4">No hay torneos todavía.</p>
          <Button onClick={() => setShowForm(true)}>Crear tu primer torneo</Button>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {tournaments
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            .map((t) => (
              <li key={t.id}>
                <Card className="hover:border-green-800 transition">
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      to={`/tournament/${t.id}`}
                      className="text-lg font-semibold hover:text-green-400"
                    >
                      {t.name}
                    </Link>
                    <Badge color="green">{STATUS_LABELS[t.status]}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    {t.players.length} jugadores · {t.groups.length} grupos ·{' '}
                    {t.matches.length} partidos
                  </p>
                  <div className="flex gap-2">
                    <Link to={`/tournament/${t.id}`} className="flex-1">
                      <Button className="w-full" variant="primary">
                        Abrir
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="text-xs"
                      onClick={() => handleExport(t.id)}
                    >
                      Exportar
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs text-red-400"
                      onClick={() => {
                        if (confirm('¿Eliminar este torneo?')) deleteTournament(t.id);
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
