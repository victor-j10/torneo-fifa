import { Route, Routes } from 'react-router-dom';
import Logo from '@/components/Logo';
import HomePage from '@/routes/HomePage';
import TournamentPage from '@/routes/TournamentPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0f1a]/90 backdrop-blur-xl">
        <div className="absolute inset-0 pitch-pattern opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Gestión de torneos 1v1
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournament/:id" element={<TournamentPage />} />
        </Routes>
      </main>
      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-400">
        FIFA Torneo · Datos en tu navegador
      </footer>
    </div>
  );
}
