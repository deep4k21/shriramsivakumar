import { FsLockup } from '../FsLockup';
import { FsMark } from '../FsMark';
import { Spread } from '../Spread';

/** One corner's x-unit swatch on the clear-space diagram. */
function XUnit({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const pos = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  }[corner];

  return (
    <div
      aria-hidden="true"
      className="absolute flex items-center justify-center italic"
      style={{
        ...pos,
        width: 28,
        height: 28,
        background: 'rgba(79,86,232,0.16)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--fs-midnight)',
      }}
    >
      x
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-4"
      style={{
        background: 'var(--fs-mist)',
        borderRadius: 'var(--fs-card-radius)',
        padding: '24px 28px',
      }}
    >
      <h3
        className="m-0 uppercase"
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.14em',
          color: 'var(--fs-founder-blue)',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * Clear space and the two minimum sizes.
 *
 * Both measurements are provisional in the same way spread 06's overlay is:
 * "x" is defined against the real mark's head-dot, so it has to be
 * re-measured once `freshstart-mark.svg` exists.
 */
export function Spread07ClearSpace() {
  return (
    <Spread number="07" title="Clear space & minimum size" label="Clear space and minimum size">
      <div className="grid h-full grid-cols-2 gap-6">
        <Panel title="Clear space">
          <div className="flex flex-1 items-center justify-center">
            <div className="relative p-7" style={{ border: '1.5px dashed var(--fs-founder-blue)' }}>
              <XUnit corner="tl" />
              <XUnit corner="tr" />
              <XUnit corner="bl" />
              <XUnit corner="br" />
              <div style={{ outline: '1px solid rgba(48,42,124,0.35)' }}>
                <FsMark size={156} showFilename />
              </div>
            </div>
          </div>
          <p className="m-0" style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--fs-ink-muted)' }}>
            <strong style={{ fontWeight: 600, color: 'var(--fs-midnight)' }}>x</strong> = the height
            of one figure's head-dot. Keep x clear on all sides of every lockup.
          </p>
        </Panel>

        <Panel title="Minimum size">
          <div className="grid flex-1 grid-rows-2 gap-4">
            <div
              className="flex items-center justify-between gap-6"
              style={{
                background: 'var(--fs-white)',
                borderRadius: 'var(--fs-tile-radius)',
                padding: '20px 24px',
              }}
            >
              <div className="flex items-center gap-3">
                <FsMark size={24} />
                <svg
                  width="10"
                  height="24"
                  viewBox="0 0 10 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="var(--fs-midnight)"
                  strokeWidth={1.2}
                >
                  <path d="M1 0.6H9M5 0.6V23.4M1 23.4H9" />
                </svg>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className="uppercase"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    color: 'var(--fs-founder-blue)',
                  }}
                >
                  Mark
                </span>
                <span style={{ fontSize: 20, fontWeight: 600 }}>24 px / 8 mm</span>
              </div>
            </div>

            <div
              className="flex items-center justify-between gap-6"
              style={{
                background: 'var(--fs-white)',
                borderRadius: 'var(--fs-tile-radius)',
                padding: '20px 24px',
              }}
            >
              <div className="flex w-[120px] flex-col gap-2.5">
                <FsLockup layout="horizontal" markSize={20} />
                <svg
                  width="120"
                  height="10"
                  viewBox="0 0 120 10"
                  aria-hidden="true"
                  fill="none"
                  stroke="var(--fs-midnight)"
                  strokeWidth={1.2}
                >
                  <path d="M0.6 1V9M0.6 5H119.4M119.4 1V9" />
                </svg>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className="uppercase"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    color: 'var(--fs-founder-blue)',
                  }}
                >
                  Lockup
                </span>
                <span style={{ fontSize: 20, fontWeight: 600 }}>120 px / 30 mm</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </Spread>
  );
}
