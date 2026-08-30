# Coach portraits

Head-shots for the coach-run picker on the team panel (`src/components/DynastyRunPicker.tsx`).

```
assets/coaches-src/<id>.png    original (450–600px), git-tracked, not served
      │  scripts/optimize-logos.mjs   (sharp → 128px, centre-cropped)
      ▼
public/coaches/<id>.png        shipped, ~8 KB
```

`npm run build` runs the optimizer via `prebuild`. `<id>` is the run's `id` in
`src/config/dynastyRuns.ts`:

| id | coach | program | tenure |
| --- | --- | --- | --- |
| `saban` | Nick Saban | Alabama | 2007–23 |
| `bryant` | Bear Bryant | Alabama | 1958–82 |
| `hayes` | Woody Hayes | Ohio State | 1951–78 |
| `bierman` | Bernie Bierman | Minnesota | 1932–41 |
| `leahy` | Frank Leahy | Notre Dame | 1941–53 |
| `switzer` | Barry Switzer | Oklahoma | 1973–88 |
| `osborne` | Tom Osborne | Nebraska | 1973–97 |
| `swinney` | Dabo Swinney | Clemson | 2009–25 |
| `smart` | Kirby Smart | Georgia | 2016–25 |
| `meyer` | Urban Meyer | Florida | 2005–10 |

Missing files fall back to the coach's initials in a circle — no error.
