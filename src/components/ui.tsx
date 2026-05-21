import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-green-600 hover:bg-green-500 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    danger: 'bg-red-700 hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
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
      className={`w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 ${className}`}
      {...props}
    />
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/60 p-5 ${className}`}
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
  color?: 'slate' | 'green' | 'amber' | 'blue';
}) {
  const colors = {
    slate: 'bg-slate-800 text-slate-300',
    green: 'bg-green-900/50 text-green-300',
    amber: 'bg-amber-900/50 text-amber-300',
    blue: 'bg-blue-900/50 text-blue-300',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
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
