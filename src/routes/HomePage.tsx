import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournamentStore } from '@/store/useTournamentStore';
import { Badge, Button, Card, Input, SectionTitle, STATUS_LABELS } from '@/components/ui';

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
    <div className="space-y-8">
      <SectionTitle subtitle="Organiza liguillas, grupos y playoffs entre amigos">
        Mis torneos
      </SectionTitle>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleImport}>
          Importar JSON
        </Button>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo torneo'}
        </Button>
      </div>

      {showForm && (
        <Card glow>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Ej. Copa FIFA 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="flex-1"
            />
            <Button type="submit" className="sm:shrink-0">
              Crear torneo
            </Button>
          </form>
        </Card>
      )}

      {tournaments.length === 0 ? (
        <Card className="text-center py-16 pitch-pattern">
          <img src="/logo.svg" alt="" className="h-20 w-20 mx-auto mb-6 opacity-90" />
          <p className="text-muted mb-6 max-w-sm mx-auto">
            Crea tu primer torneo, añade jugadores y deja que la app calcule
            clasificación y playoffs.
          </p>
          <Button onClick={() => setShowForm(true)}>Empezar ahora</Button>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {tournaments
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            .map((t) => (
              <li key={t.id}>
                <Card className="h-full flex flex-col hover:border-emerald-500/30 transition-all duration-300 group">
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <Link
                      to={`/tournament/${t.id}`}
                      className="font-display text-xl sm:text-2xl tracking-wide text-white uppercase hover:text-emerald-400 transition line-clamp-2"
                    >
                      {t.name}
                    </Link>
                    <Badge
                      color={
                        t.status === 'FINISHED'
                          ? 'gold'
                          : t.status === 'PLAYOFFS'
                            ? 'blue'
                            : 'green'
                      }
                    >
                      {STATUS_LABELS[t.status]}
                    </Badge>
                  </div>

                  <div className="flex gap-4 text-sm text-slate-300 mb-5">
                    <span>
                      <strong className="text-white font-semibold">{t.players.length}</strong>{' '}
                      jugadores
                    </span>
                    <span>
                      <strong className="text-white font-semibold">{t.groups.length}</strong>{' '}
                      grupos
                    </span>
                    <span>
                      <strong className="text-white font-semibold">{t.matches.length}</strong>{' '}
                      partidos
                    </span>
                  </div>

                  <div className="flex gap-2 mt-auto pt-2">
                    <Link to={`/tournament/${t.id}`} className="flex-1">
                      <Button className="w-full" variant="primary">
                        Entrar al torneo
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="text-xs px-2"
                      onClick={() => handleExport(t.id)}
                      title="Exportar"
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs px-2 text-red-400 hover:text-red-300"
                      onClick={() => {
                        if (confirm('¿Eliminar este torneo?')) deleteTournament(t.id);
                      }}
                      title="Eliminar"
                    >
                      ×
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
