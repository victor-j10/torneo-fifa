import type { Tournament } from '@/types/tournament';
import { computeGroupStandings } from '@/lib/standings';
import { Card } from './ui';

export default function StandingsTable({
  tournament,
}: {
  tournament: Tournament;
}) {
  if (tournament.groups.length === 0) {
    return (
      <Card>
        <p className="text-slate-500">Configura los grupos primero.</p>
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
            <h3 className="font-semibold text-green-400 mb-3">
              Grupo {group.name}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="pb-2 pr-2">#</th>
                    <th className="pb-2 pr-2">Jugador</th>
                    <th className="pb-2 pr-2 text-center">PJ</th>
                    <th className="pb-2 pr-2 text-center">G</th>
                    <th className="pb-2 pr-2 text-center">E</th>
                    <th className="pb-2 pr-2 text-center">P</th>
                    <th className="pb-2 pr-2 text-center">GF</th>
                    <th className="pb-2 pr-2 text-center">GC</th>
                    <th className="pb-2 pr-2 text-center">DG</th>
                    <th className="pb-2 text-center font-bold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr
                      key={row.playerId}
                      className={`border-b border-slate-800 ${
                        row.position <= tournament.advanceCount
                          ? 'bg-green-950/30'
                          : ''
                      }`}
                    >
                      <td className="py-2 pr-2">{row.position}</td>
                      <td className="py-2 pr-2 font-medium">{row.playerName}</td>
                      <td className="py-2 pr-2 text-center">{row.played}</td>
                      <td className="py-2 pr-2 text-center">{row.won}</td>
                      <td className="py-2 pr-2 text-center">{row.drawn}</td>
                      <td className="py-2 pr-2 text-center">{row.lost}</td>
                      <td className="py-2 pr-2 text-center">{row.goalsFor}</td>
                      <td className="py-2 pr-2 text-center">{row.goalsAgainst}</td>
                      <td className="py-2 pr-2 text-center">
                        {row.goalDifference > 0 ? '+' : ''}
                        {row.goalDifference}
                      </td>
                      <td className="py-2 text-center font-bold text-green-400">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Clasifican los {tournament.advanceCount} primeros (fondo verde).
            </p>
          </Card>
        );
      })}
    </div>
  );
}
