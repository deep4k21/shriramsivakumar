import { FsLockup } from '../FsLockup';
import { RuleMarker } from '../RuleMarker';
import { Spread } from '../Spread';

function Tile({
  kind,
  label,
  children,
  background,
}: {
  kind: 'do' | 'dont';
  label: string;
  children?: React.ReactNode;
  background: string;
}) {
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          aspectRatio: '16 / 9',
          borderRadius: 'var(--fs-tile-radius)',
          background,
          border: '1px solid var(--fs-line)',
        }}
      >
        {children}
        <div className="absolute" style={{ top: 6, right: 6 }}>
          <RuleMarker kind={kind} size={18} />
        </div>
      </div>
      <figcaption style={{ fontSize: 11, lineHeight: 1.35, color: 'var(--fs-ink-muted)' }}>
        {label}
      </figcaption>
    </figure>
  );
}

/**
 * The gradient: two stops, one direction.
 *
 * The "never" row is the point of the spread — the gradient is the easiest
 * part of the system to misuse, because it is the part that looks like
 * decoration.
 */
export function Spread11Gradient() {
  return (
    <Spread number="11" title="Gradient rules">
      <div className="grid h-full gap-10" style={{ gridTemplateColumns: '260px minmax(0,1fr)' }}>
        <div className="flex flex-col gap-4">
          <div
            className="relative"
            style={{
              width: 260,
              height: 260,
              borderRadius: 'var(--fs-card-radius)',
              background: 'var(--fs-gradient)',
            }}
          >
            <svg
              width="260"
              height="260"
              viewBox="0 0 260 260"
              role="img"
              aria-label="The gradient runs at 135 degrees, from Launch Cyan at top left to Founder Blue at bottom right"
              className="absolute inset-0"
              fill="none"
            >
              <path d="M40 40L212 212" stroke="var(--fs-white)" strokeWidth="1.6" strokeLinecap="round" />
              <path
                d="M196 214H214V196"
                stroke="var(--fs-white)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="40" cy="40" r="5" fill="var(--fs-white)" />
              <rect x="112" y="100" width="56" height="26" rx="6" fill="var(--fs-midnight)" />
              <text
                x="140"
                y="118"
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill="var(--fs-white)"
              >
                135°
              </text>
            </svg>
          </div>

          <div className="flex flex-col gap-2" style={{ fontSize: 13 }}>
            {[
              { stop: '0%', name: 'Launch Cyan #6AE2F2', swatch: 'var(--fs-launch-cyan)' },
              { stop: '100%', name: 'Founder Blue #4F56E8', swatch: 'var(--fs-founder-blue)' },
            ].map((s) => (
              <div key={s.stop} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex-none"
                  style={{ width: 16, height: 16, borderRadius: 4, background: s.swatch }}
                />
                <span>
                  <strong style={{ fontWeight: 600 }}>{s.stop}</strong> {s.name}
                </span>
              </div>
            ))}
          </div>

          <p className="m-0" style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--fs-ink-muted)' }}>
            Two stops, one direction. Cyan always starts top-left; blue always lands bottom-right.
          </p>
        </div>

        <div
          className="grid gap-2.5"
          style={{ gridTemplateRows: 'auto minmax(0,1fr) auto minmax(0,1fr)' }}
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
            Use it on
          </span>
          <div className="grid grid-cols-3 gap-4">
            <Tile kind="do" label="The mark" background="var(--fs-mist)">
              <FsLockup layout="mark" markSize={44} />
            </Tile>
            <Tile kind="do" label="Hero banners" background="var(--fs-gradient)">
              <FsLockup layout="horizontal" tone="white" markSize={22} />
            </Tile>
            <Tile kind="do" label="Stage screens" background="var(--fs-gradient)" />
          </div>

          <span
            className="uppercase"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'var(--fs-founder-blue)',
            }}
          >
            Never
          </span>
          <div className="grid grid-cols-3 gap-4">
            <Tile kind="dont" label="Behind paragraphs" background="var(--fs-gradient)">
              <div className="flex w-[72%] flex-col gap-1.5" aria-hidden="true">
                {[100, 92, 96, 64].map((w, i) => (
                  <span
                    key={i}
                    style={{
                      height: 4,
                      width: `${w}%`,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.85)',
                    }}
                  />
                ))}
              </div>
            </Tile>
            <Tile
              kind="dont"
              label="Reversed direction"
              background="linear-gradient(315deg, var(--fs-launch-cyan) 0%, var(--fs-founder-blue) 100%)"
            />
            <Tile
              kind="dont"
              label="Extra colour stops"
              background="linear-gradient(135deg, #6AE2F2 0%, #8BE07A 50%, #4F56E8 100%)"
            />
          </div>
        </div>
      </div>
    </Spread>
  );
}
