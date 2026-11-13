import type { CSSProperties, ReactNode } from 'react';

export type SpreadGround = 'white' | 'mist' | 'midnight';

const GROUND: Record<SpreadGround, CSSProperties> = {
  white: { background: 'var(--fs-white)', color: 'var(--fs-midnight)' },
  mist: { background: 'var(--fs-mist)', color: 'var(--fs-midnight)' },
  midnight: { background: 'var(--fs-midnight)', color: 'var(--fs-white)' },
};

interface SpreadProps {
  /** The number printed in the corner, e.g. "13". */
  number?: string;
  title?: string;
  /** The right-aligned note across from the title. */
  note?: ReactNode;
  ground?: SpreadGround;
  /** Accessible name, used when the spread has no visible title. */
  label?: string;
  children: ReactNode;
}

/**
 * One brand-book spread: a 16:9 artboard with the shared chrome.
 *
 * Every spread is drawn at the same size and carries the same header, so
 * both live here rather than being repeated fifteen times. `SpreadFrame`
 * handles fitting this to the viewport — this component is always laid out
 * at full design size.
 */
export function Spread({ number, title, note, ground = 'white', label, children }: SpreadProps) {
  const dark = ground === 'midnight';

  return (
    <section
      aria-label={label ?? title}
      className="fs-brand box-border flex w-full flex-col overflow-hidden"
      style={{
        aspectRatio: '16 / 9',
        borderRadius: 'var(--fs-spread-radius)',
        padding: 'var(--fs-spread-pad)',
        ...GROUND[ground],
      }}
    >
      {(number || title || note) && (
        <header className="mb-7 flex items-baseline justify-between gap-6">
          <div className="flex items-baseline gap-3">
            {number && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: dark ? 'var(--fs-launch-cyan)' : 'var(--fs-founder-blue)',
                }}
              >
                {number}
              </span>
            )}
            {title && (
              <h3
                className="m-0"
                style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em' }}
              >
                {title}
              </h3>
            )}
          </div>
          {note && (
            <span
              className="text-right"
              style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.72)' : 'var(--fs-ink-muted)' }}
            >
              {note}
            </span>
          )}
        </header>
      )}
      {/* `min-h-0` so a spread's own content can scroll-clip rather than
          pushing the artboard past its 16:9 box. */}
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
