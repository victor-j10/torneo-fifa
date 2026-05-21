import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
}) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  const variants = {
    primary:
      'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/35',
    secondary:
      'bg-slate-700 text-white border border-slate-500/60 hover:bg-slate-600 hover:border-slate-400',
    danger:
      'bg-gradient-to-r from-red-700 to-red-600 text-white hover:from-red-600 hover:to-red-500',
    ghost: 'bg-transparent text-slate-200 hover:text-white hover:bg-white/10',
    outline:
      'bg-transparent border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400/60',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-500/60 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-400 transition focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`rounded-xl border border-slate-500/60 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Card({
  children,
  className = '',
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`glass-panel p-5 sm:p-6 ${glow ? 'accent-glow border-emerald-500/20' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  color = 'slate',
}: {
  children: ReactNode;
  color?: 'slate' | 'green' | 'amber' | 'blue' | 'gold';
}) {
  const colors = {
    slate: 'bg-slate-700 text-slate-100 border-slate-500/50',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    gold: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${colors[color]}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-white uppercase">
        {children}
      </h2>
      {subtitle && (
        <p className="text-muted text-sm mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  GROUP_STAGE: 'Fase de grupos',
  PLAYOFFS: 'Playoffs',
  FINISHED: 'Finalizado',
};

export const STAGE_LABELS: Record<string, string> = {
  GROUP: 'Grupo',
  R16: 'Octavos',
  QF: 'Cuartos',
  SF: 'Semifinal',
  FINAL: 'Final',
  THIRD: '3er puesto',
};
