import { useId } from 'react';
import { FS_ICONS, FsIcon } from '../FsIcon';
import { Spread } from '../Spread';

const RULES = [
  { term: 'Grid', detail: '24 px, 2 px live-area padding' },
  { term: 'Keylines', detail: 'Circle 20, square 18, portrait 16 × 20, landscape 20 × 16' },
  { term: 'Stroke', detail: '2 px, round caps and joins' },
  {
    term: 'Accent',
    detail: "One Launch Cyan dot per icon, borrowed from the mark's head-dots",
  },
];

/**
 * The 24px grid, live area and keylines, drawn at 8× so they can be read.
 *
 * The grid pattern takes a generated id: a hard-coded one collides when the
 * spread renders more than once on a page, and SVG resolves `url(#id)`
 * against the first match in the document — so the second instance would
 * silently borrow the first one's fill.
 */
function ConstructionPlate() {
  const gridId = useId();

  return (
    <svg
      width="192"
      height="192"
      viewBox="0 0 192 192"
      role="img"
      aria-label="24 pixel icon grid with live area and keyline shapes"
      fill="none"
      style={{ borderRadius: 8, background: 'var(--fs-white)', outline: '1px solid var(--fs-line)' }}
    >
      <defs>
        <pattern id={gridId} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M8 0H0V8" stroke="var(--fs-line-soft)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="192" height="192" fill={`url(#${gridId})`} />
      {/* The live area: 2px of padding on each side, at 8×. */}
      <rect x="16" y="16" width="160" height="160" stroke="var(--fs-midnight)" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="96" cy="96" r="80" stroke="var(--fs-founder-blue)" strokeWidth="1.2" />
      <rect x="24" y="24" width="144" height="144" rx="16" stroke="var(--fs-founder-blue)" strokeWidth="1" strokeOpacity="0.7" />
      <rect x="32" y="16" width="128" height="160" rx="16" stroke="var(--fs-founder-blue)" strokeWidth="1" strokeOpacity="0.45" />
      <rect x="16" y="32" width="160" height="128" rx="16" stroke="var(--fs-founder-blue)" strokeWidth="1" strokeOpacity="0.45" />
      <circle cx="96" cy="96" r="14" fill="var(--fs-launch-cyan)" />
    </svg>
  );
}

export function Spread14Iconography() {
  return (
    <Spread number="14" title="Iconography" note="Drawn on 24 px · shown at 2×">
      <div className="grid h-full gap-10" style={{ gridTemplateColumns: '208px minmax(0,1fr)' }}>
        <div className="flex flex-col gap-4">
          <ConstructionPlate />
          <dl className="m-0 flex flex-col gap-2.5" style={{ fontSize: 12, lineHeight: 1.4 }}>
            {RULES.map((r) => (
              <div key={r.term}>
                <dt style={{ fontWeight: 600 }}>{r.term}</dt>
                <dd className="m-0" style={{ color: 'var(--fs-ink-muted)' }}>
                  {r.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-6 gap-3">
            {FS_ICONS.map((i) => (
              <figure
                key={i.name}
                className="m-0 flex flex-col items-center gap-2.5"
                style={{
                  borderRadius: 'var(--fs-tile-radius)',
                  background: 'var(--fs-mist)',
                  padding: '16px 8px 12px',
                }}
              >
                <FsIcon name={i.name} size={48} />
                <figcaption
                  className="text-center"
                  style={{ fontSize: 11, fontWeight: 500, color: 'var(--fs-midnight)' }}
                >
                  {i.label}
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Reversed, to show the stroke inheriting colour while the dot
              stays Launch Cyan on both grounds. */}
          <div
            className="flex items-center justify-around"
            style={{
              background: 'var(--fs-midnight)',
              color: 'var(--fs-white)',
              borderRadius: 'var(--fs-tile-radius)',
              padding: '18px 24px',
            }}
          >
            {FS_ICONS.slice(0, 6).map((i) => (
              <FsIcon key={i.name} name={i.name} size={40} />
            ))}
          </div>
        </div>
      </div>
    </Spread>
  );
}
