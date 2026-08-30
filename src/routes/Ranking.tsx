import { useChartContext } from '../App';
import RankedList from '../components/RankedList';

export default function Ranking() {
  const { data, teams, favorite, setFavorite, showNotes, benchmark, scenarioSchool } = useChartContext();

  return (
    <div className="flex flex-col gap-4">
      <RankedList
        teams={teams}
        favorite={favorite}
        onPick={(t) => setFavorite(t.school)}
        showNotes={showNotes}
        descriptions={data.meta.tierDescriptions}
        benchmark={benchmark}
        scenarioSchool={scenarioSchool}
      />

      <p className="text-xs leading-relaxed text-muted">
        <strong>How it’s built.</strong> {data.meta.modelBlurb} The default view uses each
        program’s <em>NCAA official</em> record (vacated wins removed); the toggle adds them back.
        AP-poll weeks and NFL-draft picks come from CollegeFootballData (1936–{data.meta.latestSeason});
        wins/losses are per-season from CollegeFootballData 1936 on, and before that the NCAA “FBS
        Records” all-time line where the book publishes one (Ohio State 990-337-53), else 1869–1935
        game logs (a tie counts as half a win). National titles, All-America selections and Heismans
        are hand-maintained; a
        national title counts only when a major selector (AP, UPI, FWAA, NFF, USA; CFRA/HAF/NCF
        pre-1936) picked the team. The trajectory arrow runs the rating formula twice — once on all-time totals, once on the last{' '}
        {data.meta.trendRecentYears ?? 10} seasons alone (every program ranked against every other
        program’s last decade). It uses the five stats that spread teams out over a decade — wins,
        win rate, AP-poll weeks, AP-top-10 weeks, draft picks; titles, All-Americans and first-round
        picks are too rare in ten years to rank cleanly. Programs with fewer than{' '}
        {data.meta.trendMinHistory ?? 30} seasons on record get no arrow — not enough past to judge.
        ▲ if the last-decade rating runs well ahead of the all-time one, ▼ if it lags well behind,
        – if they’re about level (or too new to judge); a doubled, stacked arrow when the gap is at
        least {data.meta.trendSurgePoints ?? 25} points on the 0–100 scale.
      </p>
    </div>
  );
}
