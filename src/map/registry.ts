/**
 * The element map (?map=1). Every `data-map="<term>"` in the app is a region we
 * have a shared name for; this file is the term → one-line description lookup the
 * overlay shows on each label. The `data-map` value IS the term to say back and
 * forth when asking for an edit ("make the stat strip taller").
 *
 * Keep this in sync with GLOSSARY.md and the UI Field Guide artifact.
 */
export const MAP_BLURB: Record<string, string> = {
  // ---- global chrome ----
  'the masthead': 'Top strip on every page — the BlueBloodFootball wordmark and tagline.',
  'the theme buttons': 'Match-system / light / dark, top-right of the masthead.',
  'the map toggle': 'Turns this labelled overlay on and off. Also reachable as ?map=1 in the URL.',
  'the filter bar': 'The bordered box holding the conference filters, team picker and vacated wins toggle.',
  'the conference filters': '“All” plus one pill per conference; narrows every list and chart to those teams.',
  'the team picker': 'The ★ Team dropdown that highlights one program everywhere, plus its ✕ clear.',
  'the vacated wins toggle': 'NCAA official (default) vs. as played — drops or re-adds NCAA-vacated wins. Locked in a point-in-time snapshot.',
  'the year picker': 'As of Now / a decade off-season (1950–2020). Picking a year rebuilds every rating and tier from only the seasons through that off-season — experimental.',
  'the snapshot banner': 'Shown while a point-in-time year is selected — names the off-season the site is frozen to, with a Back-to-now button.',
  'the footer': 'Data date, sources, and the lone link out to The Chart.',

  // ---- the tab row ----
  'the tab row': 'The fixed row: the Blue Blood Rating tab, the five criteria tabs, and the view switch.',
  'the Rating tab': 'The bold first tab → the home ranking. Always keeps a team highlighted.',
  'the criteria tabs': 'AP Poll Success · Wins · Championships · All-Americans · NFL Draft Success.',
  'the view switch': 'List View / Chart View / Bell Curve — only shown on a criterion page.',
  'the notes toggle': 'The ✎ in the left margin; shows/hides the hand-drawn gap & range notes. Off by default.',

  // ---- the ranking ----
  'a tier': 'One banded block per grouping: Blue Bloods, Fringe, Contenders, National Powers, National Brands, The Field.',
  'the tier header': 'The grouping name + program count line above its rows.',
  'the tier description': 'The one-line blurb under a tier header describing what that grouping means.',
  'a ranking row': 'One team’s line in the ranking — click it to highlight that program.',
  'the rank cell': 'The “▲ 3” at the far left — rank number plus the trajectory arrow.',
  'the trajectory arrow': '▲ Ascending / ▼ Descending / – Maintaining, versus the program’s own history. A doubled, stacked arrow marks an emphatic move (Surging up, Collapsing down) — a last-decade rating a whole class from the all-time one. A dash also means too few seasons on record to judge.',
  'the ranking row subline': 'The muted line under the team name — the trajectory, described (Surging / Ascending / Level / Descending / Collapsing).',
  'the ranking row blurb hover': 'Hover the team name → a card with the Trajectory, Standing and Path Forward blurbs, plus team details.',
  'the method & data notes': 'The block under the ranking: how the rating is built, how the trajectory arrow works, and how far back the data for each of the ten stats runs.',
  'the ranking row stat hover': 'Hover the stat strip / rating → the ten-stat breakdown card (stat · value · percentile), same format as the benchmark hover.',
  'the stat strip': 'The ten little bars = the ten stats; greyed bars are the two dropped outliers.',
  'the rating number': 'The bold 0–100 Blue Blood Rating at the right of the row.',
  'the blue blood benchmark': 'The dashed line inside the Blue Bloods tier at where the “average Blue Blood” would rank. Hover for its rating and ten-stat breakdown.',
  'the what-if editor': 'Sliders that edit the highlighted team’s ten stats and re-rank every list and chart live. Ticks mark the real value and the Blue Blood benchmark.',
  'the what-if banner': 'Dashed amber strip shown while a what-if scenario is live — names the edited team and stat count, with a Reset.',
  'the gap note': 'Margin note: “≈N% gap” with an arrow into the break between two tiers. Needs the notes toggle on.',
  'the range note': 'Margin note: a curly brace + “≈N% range” spanning a tier. Needs the notes toggle on.',

  // ---- the team panel ----
  'the team panel': 'The highlighted-team card — sticky right rail on list views. Stats / Analysis toggle switches full breakdown ⟷ Trajectory·Standing·Path Forward; "What if?" opens the editor.',
  'the team strip': 'The compact highlighted-team bar on chart / bell-curve views — header plus a 2-row × 5-column stat strip.',
  'the panel header': 'Logo, name, identity line and tagline — the same block at two sizes for the panel and the strip, ruled off from the stats below.',
  'the identity line': '“#1 · 99.0 rating · Blue Bloods” under the team name.',
  'the tagline': 'The one hand-written line about the program’s history.',
  'the stat breakdown': 'The ten rating stats, three densities: full (panel default, criterion-grouped, value + percentile), compact (panel what-if/analysis, 5 rows × 2), strip (chart views, 2 rows × 5). Outliers greyed & struck.',
  'the panel view toggle': 'Stats / Analysis segmented control at the top of the team panel — Stats shows the full breakdown, Analysis swaps it for a compact breakdown plus Trajectory, Standing and Path Forward.',
  'a stat bar': 'One stat’s percentile-of-130 as a filled bar, with its raw value and percentile beside it. Greyed = a trimmed outlier.',
  'the trajectory blurb': 'Trajectory — the last decade’s rating against the all-time one, headed by the direction word (Surging / Ascending / Level / Descending / Collapsing).',
  'the standing blurb': 'Standing — where the program sits against the tier it wants (the blue-blood line for the top three tiers, the next tier up otherwise), told in last-decade terms.',
  'the path-forward blurb': 'Path Forward — what it would take, in modern-season terms, to reach that tier; for those already at the top, what it takes to hold the line.',
  'the coach runs': 'A row of dynasty head coaches — click one to add their actual tenure totals to this program in the what-if editor; hover for the run and the numbers it adds.',
  'the what-if button': 'The dashed amber ⚡ button at the bottom of the panel (Stats mode) — opens the what-if editor on this program.',
  'the jump button': '⌖ jump — scrolls the list to this team’s row. List views only.',
  'the clear button': '★ clear — removes the highlight. Hidden on the Rating tab.',

  // ---- criterion pages ----
  'the criterion list': 'The sortable flat list on a criterion’s List View — no tier bands.',
  'the sortable headers': 'Program / stat / stat / Percentile — click to sort, click again to flip. Always two lines tall so the row height never shifts between criteria.',
  'the scatter': 'Chart View — every program plotted on the criterion’s two stats.',
  'the bell curve': 'Every program placed on the normal curve by its criterion score, ±1σ / ±2σ bands.',
  'the chart frame': 'The card around a chart: title, subtitle, footer caption.',
  'the chart action bar': 'Top-right of the chart frame — the expand toggle, the marker toggle and the PNG button.',
  'the chart expand toggle': '⤢ Expand / ⤡ Shrink — blows the plot area up to near-viewport height (like “The Chart”) and back.',
  'the marker toggle': 'Logos vs. coloured Bubbles for the chart markers.',
};
