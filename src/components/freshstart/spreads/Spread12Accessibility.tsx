import { Spread } from '../Spread';

interface Pair {
  name: string;
  fg: string;
  bg: string;
  /** Contrast ratio, computed from the two HEX values per WCAG 2.2. */
  ratio: string;
  pass: boolean;
  note: string;
  border?: boolean;
}

/**
 * Every pairing the system allows, and the one it forbids.
 *
 * The ratios are computed, not estimated — they were checked against the
 * WCAG relative-luminance formula when this was ported. Changing a brand
 * hex means recomputing them; a stale ratio printed as fact is worse than
 * no ratio at all.
 */
const PAIRS: Pair[] = [
  { name: 'Midnight on Mist', fg: '#302A7C', bg: '#EEF2FB', ratio: '10.72 : 1', pass: true, note: 'Body and large text', border: true },
  { name: 'Midnight on White', fg: '#302A7C', bg: '#FFFFFF', ratio: '12.01 : 1', pass: true, note: 'Body and large text', border: true },
  { name: 'White on Midnight', fg: '#FFFFFF', bg: '#302A7C', ratio: '12.01 : 1', pass: true, note: 'Body and large text' },
  { name: 'White on Founder Blue', fg: '#FFFFFF', bg: '#4F56E8', ratio: '5.48 : 1', pass: true, note: 'Body and large text' },
  { name: 'Midnight on Launch Cyan', fg: '#302A7C', bg: '#6AE2F2', ratio: '7.88 : 1', pass: true, note: 'Body and large text' },
  { name: 'Launch Cyan on Midnight', fg: '#6AE2F2', bg: '#302A7C', ratio: '7.88 : 1', pass: true, note: 'Body and large text' },
  { name: 'White on Launch Cyan', fg: '#FFFFFF', bg: '#6AE2F2', ratio: '1.52 : 1', pass: false, note: 'Never use' },
];

export function Spread12Accessibility() {
  return (
    <Spread
      number="12"
      title="Accessible colour pairs"
      note="WCAG 2.2 AA · ratios computed from HEX"
    >
      <div className="grid h-full grid-cols-4 gap-4">
        {PAIRS.map((p) => (
          <figure key={p.name} className="m-0 flex flex-col gap-2">
            <div
              className="flex flex-col justify-center gap-1 px-4"
              style={{
                height: 92,
                borderRadius: 'var(--fs-tile-radius)',
                background: p.bg,
                color: p.fg,
                border: p.border ? '1px solid var(--fs-line)' : undefined,
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 600, lineHeight: 1 }}>Aa</span>
              <span style={{ fontSize: 12 }}>Start fresh. Scale fast.</span>
            </div>
            <figcaption className="flex flex-col gap-1">
              <span style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</span>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, fontWeight: 600 }}>{p.ratio}</span>
                <span
                  className="uppercase"
                  style={{
                    padding: '2px 7px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    // Pass and fail are told apart by fill as well as by the
                    // word, so the badge does not rely on colour alone.
                    background: p.pass ? 'var(--fs-midnight)' : 'var(--fs-white)',
                    color: p.pass ? 'var(--fs-white)' : 'var(--fs-midnight)',
                    border: p.pass ? 'none' : '1.5px solid var(--fs-midnight)',
                  }}
                >
                  {p.pass ? 'Pass' : 'Fail'}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--fs-ink-muted)' }}>{p.note}</span>
            </figcaption>
          </figure>
        ))}

        <div
          className="flex flex-col justify-center gap-3 p-5"
          style={{ background: 'var(--fs-mist)', borderRadius: 'var(--fs-card-radius)' }}
        >
          <span
            className="uppercase"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'var(--fs-founder-blue)',
            }}
          >
            AA thresholds
          </span>
          {[
            { value: '4.5 : 1', label: 'Body text' },
            { value: '3 : 1', label: 'Large text and UI' },
          ].map((t) => (
            <div key={t.value} className="flex flex-col gap-0.5">
              <span style={{ fontSize: 18, fontWeight: 600 }}>{t.value}</span>
              <span style={{ fontSize: 11, color: 'var(--fs-ink-muted)' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Spread>
  );
}
