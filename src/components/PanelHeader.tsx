import type { Team } from '../types';
import TeamLogo from './TeamLogo';

const RATING_HINT =
  'Blue Blood Rating: rank each of the 10 stats within FBS, drop this program’s single best and single worst percentile, average the other 8.';

interface Props {
  team: Team;
  /** `full` = the standalone team panel; `compact` = the what-if strip. Same
   *  pieces (logo, name, identity, tagline, controls) — only the scale changes. */
  size?: 'full' | 'compact';
  onClear?: () => void;
  onJump?: () => void;
}

/** The identity block that tops the team panel. Sectioned off with a bottom rule
 *  so the header reads as its own unit above whichever stat breakdown follows. */
export default function PanelHeader({ team, size = 'full', onClear, onJump }: Props) {
  const full = size === 'full';

  const jumpBtn = onJump && (
    <button
      data-map="the jump button"
      onClick={onJump}
      title="Jump to this team in the list"
      aria-label="Jump to this team in the list"
      className="text-xs text-muted hover:text-accent"
    >
      ⌖ jump
    </button>
  );
  const clearBtn = onClear && (
    <button
      data-map="the clear button"
      onClick={onClear}
      title="Remove favourite"
      className="text-xs text-muted hover:text-accent"
    >
      ★ clear
    </button>
  );

  return (
    <div
      data-map="the panel header"
      className={`flex border-b border-line ${
        full ? 'items-start gap-4 pb-3' : 'items-center gap-3 pb-2.5'
      }`}
    >
      <TeamLogo key={team.slug} slug={team.slug} className={full ? 'h-14 w-14' : 'h-10 w-10'} />
      <div className="min-w-0 flex-1">
        <div className={`flex flex-wrap items-baseline ${full ? 'gap-x-3 gap-y-1' : 'gap-x-2 gap-y-0.5'}`}>
          <h2 className={`${full ? 'text-xl' : 'text-base'} font-bold tracking-tight`}>{team.school}</h2>
          {!full && (
            <span data-map="the identity line" className="text-xs text-muted" title={RATING_HINT}>
              {team.identity}
            </span>
          )}
          {jumpBtn}
          {clearBtn}
        </div>
        {full && (
          <p data-map="the identity line" className="text-sm text-muted" title={RATING_HINT}>
            {team.identity}
          </p>
        )}
        {team.label.personal && (
          <p
            data-map="the tagline"
            className={full ? 'mt-0.5 text-sm' : 'truncate text-xs text-muted'}
          >
            {team.label.personal}
          </p>
        )}
      </div>
    </div>
  );
}
