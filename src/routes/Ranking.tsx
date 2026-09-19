import { useChartContext } from '../App';
import { useMemo } from 'react';
import RankedList from '../components/RankedList';
import DecadeRankChart from '../components/DecadeRankChart';

export default function Ranking() {
  const { data, teams, favorite, setFavorite, showNotes, benchmark, scenarioSchool, view, marker, wins } = useChartContext();
  const schools = useMemo(() => new Set(teams.map((t) => t.school)), [teams]);

  return (
    <div className="flex flex-col gap-4">
      {view === 'decades' ? (
        <DecadeRankChart
          marker={marker}
          favorite={favorite}
          onPick={setFavorite}
          schools={schools}
          filtered={teams.length < data.teams.length}
          wins={wins}
        />
      ) : (
        <RankedList
          teams={teams}
          favorite={favorite}
          onPick={(t) => setFavorite(t.school)}
          showNotes={showNotes}
          descriptions={data.meta.tierDescriptions}
          benchmark={benchmark}
          scenarioSchool={scenarioSchool}
        />
      )}

      <div data-map="the method & data notes" className="flex flex-col gap-3 text-xs leading-relaxed text-muted">
        <p>
          <strong className="text-ink">The method.</strong> Ten stats, in five pairs. Each stat
          becomes a percentile among all 136 FBS programs; we drop each program’s single highest and
          single lowest percentile and average the other eight. That average, on a 0–100 scale, is
          the Blue Blood Rating. Records are <em>NCAA-official</em>: wins and national titles the NCAA
          vacated aren’t counted — for USC, 14 wins from the 2004 and 2005 seasons and the 2004
          national title.
        </p>
        <p>
          <strong className="text-ink">The trajectory arrow</strong> runs the same formula a second
          time on the last {data.meta.trendRecentYears ?? 10} seasons alone — every program ranked
          against every other program’s last decade — and sets that against the same five stats
          all-time. ▲ ahead, ▼ behind, – level; a stacked arrow when the gap tops{' '}
          {data.meta.trendSurgePoints ?? 25} points. It uses the five stats that separate teams over
          a decade — wins, win rate, AP weeks, AP top-10 weeks, draft picks; the rarer counters don’t
          rank cleanly in ten years.
        </p>
        <div>
          <p className="mb-1">
            <strong className="text-ink">The data</strong> is compiled here, record by record. Each
            series reaches back as far as the thing itself does:
          </p>
          <ul className="ml-4 list-disc space-y-0.5">
            <li><strong className="font-medium text-ink">AP Poll weeks</strong> and <strong className="font-medium text-ink">weeks in the top 10</strong> — every AP poll ever published; the poll began in 1936 (preseason ballots included).</li>
            <li><strong className="font-medium text-ink">Consensus All-Americans</strong> — every selection since the first teams in 1898; the unanimous flag from 1924, when the selectors started marking it.</li>
            <li><strong className="font-medium text-ink">National titles</strong> — from 1901, the first year a recognized selector named one. A season counts only where a recognized selector picked the team (AP, UPI, FWAA, NFF, USA; CFRA / HAF / NCF before the AP) — a banner without one doesn’t. Shared titles count in full.</li>
            <li><strong className="font-medium text-ink">Conference titles</strong> — year by year: the regular-season champion, or the title-game winner where a league staged one. Co-champions count in full.</li>
            <li><strong className="font-medium text-ink">NFL Draft picks</strong> and <strong className="font-medium text-ink">first-round picks</strong> — every NFL draft since the first in 1936, plus the separate AFL drafts of 1960–66.</li>
            <li><strong className="font-medium text-ink">All-time wins</strong> and <strong className="font-medium text-ink">win pct</strong> — season by season from 1869, the first year anyone played; a tie is half a win.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
