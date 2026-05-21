import { getClubById } from '@/data/europeanClubs';
import type { Player } from '@/types/tournament';

export default function PlayerClubBadge({
  player,
  size = 'sm',
}: {
  player: Pick<Player, 'clubId'>;
  size?: 'sm' | 'md';
}) {
  if (!player.clubId) return null;
  const club = getClubById(player.clubId);
  if (!club) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-slate-900/80 ${
        size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
      }`}
      style={{ borderLeftColor: club.color, borderLeftWidth: 3 }}
    >
      <span className="font-semibold text-white truncate max-w-[140px]">{club.name}</span>
      <span className="text-slate-400 shrink-0">{club.league}</span>
      <span className="font-display text-emerald-400 shrink-0">{club.rating}</span>
    </span>
  );
}
