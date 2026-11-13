import { FsLockup, type FsLockupLayout, type FsLockupTone } from '../FsLockup';

interface Cell {
  layout: FsLockupLayout;
  markSize: number;
  light: string;
  dark: string;
}

/**
 * The four approved lockups.
 *
 * Mark sizes differ per layout so each lockup reads at the same optical
 * weight in its cell: a stacked lockup carries its wordmark underneath, so
 * its mark can run larger than the horizontal one's without the pair
 * dominating the row.
 */
const CELLS: Cell[] = [
  { layout: 'horizontal', markSize: 30, light: 'Primary · horizontal', dark: 'Primary · horizontal, reversed' },
  { layout: 'stacked', markSize: 50, light: 'Stacked', dark: 'Stacked, reversed' },
  { layout: 'mark', markSize: 56, light: 'Mark only', dark: 'Mark only' },
  { layout: 'wordmark', markSize: 30, light: 'Wordmark only', dark: 'Wordmark only, white' },
];

function Row({ tone }: { tone: FsLockupTone }) {
  const dark = tone === 'reverse';

  return (
    <div
      className="grid grid-cols-4 px-6"
      style={{ background: dark ? 'var(--fs-midnight)' : 'var(--fs-mist)' }}
    >
      {CELLS.map((c) => (
        <div
          key={c.layout}
          className="flex flex-col items-center justify-center gap-[18px] px-2 py-5"
        >
          {/* A fixed-height well so all four lockups share one baseline
              regardless of how tall each composition runs. */}
          <div className="flex h-24 items-center justify-center">
            <FsLockup
              layout={c.layout}
              tone={c.layout === 'wordmark' && dark ? 'white' : tone}
              markSize={c.markSize}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: dark ? 'rgba(255,255,255,0.72)' : 'var(--fs-ink-muted)',
            }}
          >
            {dark ? c.dark : c.light}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Every lockup on both grounds, so the pair can be compared directly.
 *
 * Full-bleed rows rather than the shared spread padding: the grounds are
 * what the spread is demonstrating, so each has to reach the artboard's
 * edges.
 */
export function Spread05LogoSystem() {
  return (
    <section
      aria-label="Logo system"
      className="fs-brand box-border flex w-full flex-col overflow-hidden"
      style={{
        aspectRatio: '16 / 9',
        borderRadius: 'var(--fs-spread-radius)',
        background: 'var(--fs-white)',
      }}
    >
      <div className="flex items-baseline justify-between gap-6 px-12 pt-10 pb-7">
        <div className="flex items-baseline gap-3.5">
          <span
            style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--fs-founder-blue)' }}
          >
            05
          </span>
          <h2 className="m-0" style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Logo system
          </h2>
        </div>
        <span style={{ fontSize: 12, color: 'var(--fs-ink-muted)' }}>
          Placeholders · swap in freshstart-mark.svg and freshstart-lockup.svg
        </span>
      </div>

      <div className="grid flex-1 grid-rows-2">
        <Row tone="color" />
        <Row tone="reverse" />
      </div>
    </section>
  );
}
