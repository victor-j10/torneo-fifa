import type { Tournament } from '@/types/tournament';
import { getClubById } from '@/data/europeanClubs';
import { computeGroupStandings } from '@/lib/standings';
import { getQualificationBadge } from '@/lib/qualification';
import { canUseTwoGroupPlayoffFormat } from '@/lib/bracket';
import { Badge, Card } from './ui';

export default function StandingsTable({
  tournament,
}: {
  tournament: Tournament;
}) {
  if (tournament.groups.length === 0) {
    return (
      <Card>
        <p className="text-muted">Configura los grupos primero.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tournament.groups.map((group) => {
        const standings = computeGroupStandings(
          group,
          tournament.matches,
          tournament.players,
          tournament.pointsWin,
          tournament.pointsDraw,
          tournament.pointsLoss,
        );

        return (
          <Card key={group.id}>
            <h3 className="font-display text-xl tracking-wide text-emerald-400 uppercase mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-sm font-bold text-emerald-300">
                {group.name}
              </span>
              Grupo {group.name}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-left text-slate-200 text-xs uppercase tracking-wider">
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">Jugador</th>
                    <th className="px-3 py-3 text-center">PJ</th>
                    <th className="px-3 py-3 text-center">G</th>
                    <th className="px-3 py-3 text-center">E</th>
                    <th className="px-3 py-3 text-center">P</th>
                    <th className="px-3 py-3 text-center">GF</th>
                    <th className="px-3 py-3 text-center">GC</th>
                    <th className="px-3 py-3 text-center">DG</th>
                    <th className="px-3 py-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => {
                    const qualifies = row.position <= tournament.advanceCount;
                    const qualBadge = canUseTwoGroupPlayoffFormat(tournament)
                      ? getQualificationBadge(row.position)
                      : null;
                    return (
                      <tr
                        key={row.playerId}
                        className={`border-t border-slate-800/50 transition ${
                          qualifies
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                              qualifies
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {row.position}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-semibold text-white block">{row.playerName}</span>
                          {(() => {
                            const club = getClubById(
                              tournament.players.find((p) => p.id === row.playerId)?.clubId ?? '',
                            );
                            return club ? (
                              <span className="text-[10px] text-emerald-400/90 block">{club.name}</span>
                            ) : null;
                          })()}
                          {qualBadge && (
                            <span className="inline-block mt-1">
                              <Badge color={qualBadge.color}>{qualBadge.label}</Badge>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center text-slate-300">{row.played}</td>
                        <td className="px-3 py-3 text-center">{row.won}</td>
                        <td className="px-3 py-3 text-center">{row.drawn}</td>
                        <td className="px-3 py-3 text-center">{row.lost}</td>
                        <td className="px-3 py-3 text-center">{row.goalsFor}</td>
                        <td className="px-3 py-3 text-center">{row.goalsAgainst}</td>
                        <td className="px-3 py-3 text-center font-medium">
                          {row.goalDifference > 0 ? '+' : ''}
                          {row.goalDifference}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-display text-lg text-emerald-400">
                            {row.points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-slate-300 mt-3 space-y-1">
              <p>Clasifican los {tournament.advanceCount} primeros de cada grupo.</p>
              {canUseTwoGroupPlayoffFormat(tournament) && (
                <>
                  <p className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    1º → semifinal directa
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-600" />
                    2º vs 3º del otro grupo → fase previa → semifinal
                  </p>
                </>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
