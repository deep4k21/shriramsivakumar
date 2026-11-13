import { FsMark } from '../FsMark';

const RULES = [
  { term: 'Grid', detail: "12 × 12 module across the mark's bounding square." },
  {
    term: 'Circles',
    detail: 'The drop is one full circle, closed by a tighter radius at the launch corner.',
  },
  { term: 'Launch trails', detail: 'Parallel strokes set at 45°.' },
];

/**
 * The geometry behind the drop.
 *
 * The overlay is drawn against the placeholder mark, so every coordinate
 * below is provisional: when `freshstart-mark.svg` lands, the circles and
 * trails have to be realigned to the real outline. The spread says so on
 * its face rather than only in the handoff.
 */
export function Spread06Construction() {
  return (
    <section
      aria-label="Construction"
      className="fs-brand box-border grid w-full items-center gap-12 overflow-hidden"
      style={{
        aspectRatio: '16 / 9',
        borderRadius: 'var(--fs-spread-radius)',
        padding: '44px 48px',
        background: 'var(--fs-white)',
        gridTemplateColumns: 'minmax(0,1fr) auto',
      }}
    >
      <div className="flex flex-col justify-between gap-8 self-stretch">
        <div className="flex items-baseline gap-3.5">
          <span
            style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--fs-founder-blue)' }}
          >
            06
          </span>
          <h2 className="m-0" style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Construction
          </h2>
        </div>

        <dl className="m-0 flex flex-col gap-5">
          {RULES.map((r) => (
            <div
              key={r.term}
              className="flex flex-col gap-1.5 pt-3.5"
              style={{ borderTop: '1px solid var(--fs-line-soft)' }}
            >
              <dt
                className="uppercase"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  color: 'var(--fs-founder-blue)',
                }}
              >
                {r.term}
              </dt>
              <dd className="m-0" style={{ fontSize: 16, lineHeight: 1.45 }}>
                {r.detail}
              </dd>
            </div>
          ))}
        </dl>

        <p className="m-0" style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--fs-ink-muted)' }}>
          Overlay drawn on the placeholder. Realign it to freshstart-mark.svg.
        </p>
      </div>

      <figure
        className="relative m-0"
        style={{
          width: 420,
          height: 420,
          backgroundColor: '#F6F8FD',
          // The 12 × 12 module the rules describe: 420 / 12 = 35.
          backgroundImage:
            'linear-gradient(var(--fs-line) 1px, transparent 1px), linear-gradient(90deg, var(--fs-line) 1px, transparent 1px)',
          backgroundSize: '35px 35px',
          outline: '1px solid var(--fs-line)',
        }}
      >
        <div className="absolute inset-0" style={{ opacity: 0.9 }}>
          <FsMark size={420} />
        </div>
        <svg
          width="420"
          height="420"
          viewBox="0 0 420 420"
          role="img"
          aria-label="Construction overlay: full circle, corner radius circle, and launch trails at 45 degrees"
          className="absolute inset-0"
          style={{ overflow: 'visible' }}
          fill="none"
        >
          <circle cx="210" cy="210" r="210" stroke="var(--fs-midnight)" strokeWidth="1" strokeDasharray="5 5" />
          <circle cx="344.4" cy="75.6" r="75.6" stroke="var(--fs-midnight)" strokeWidth="1" strokeDasharray="5 5" />
          <path d="M210 0V420M0 210H420" stroke="var(--fs-midnight)" strokeOpacity="0.35" strokeWidth="1" />
          <path d="M90 330L230 190M140 360L270 230" stroke="var(--fs-midnight)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M90 330H210" stroke="var(--fs-midnight)" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M140 330A50 50 0 0 0 125.36 294.64" stroke="var(--fs-midnight)" strokeWidth="1.4" />
          <rect x="148" y="298" width="44" height="24" rx="5" fill="var(--fs-white)" />
          <text
            x="170"
            y="315"
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="var(--fs-midnight)"
          >
            45°
          </text>
        </svg>
      </figure>
    </section>
  );
}
