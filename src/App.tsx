import { Route, Routes } from 'react-router-dom';
import HomePage from '@/routes/HomePage';
import TournamentPage from '@/routes/TournamentPage';

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <h1 className="text-xl font-bold tracking-tight text-green-400">
            FIFA Torneo
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournament/:id" element={<TournamentPage />} />
        </Routes>
      </main>
    </div>
  );
}
