import { useId } from 'react';
import { FsLockup } from '../FsLockup';
import { RuleMarker } from '../RuleMarker';
import { Spread } from '../Spread';

/**
 * The launch-line pattern: one trail and one dot on a 40 × 40 unit.
 *
 * Each instance generates its own id. SVG resolves `url(#id)` against the
 * first matching element in the document, so a shared literal id would make
 * every later instance paint with the first one's pattern — which looks
 * correct until one of them changes.
 */
function LaunchPattern({ opacity = 0.4 }: { opacity?: number }) {
  const id = useId();

  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M6 34L24 16"
            stroke="var(--fs-launch-cyan)"
            strokeOpacity={opacity}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="28.5" cy="11.5" r="3.5" fill="var(--fs-launch-cyan)" fillOpacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function Crop({
  ratio,
  caption,
  children,
}: {
  ratio: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div
        className="relative flex flex-col justify-end overflow-hidden p-5"
        style={{
          aspectRatio: ratio,
          borderRadius: 'var(--fs-tile-radius)',
          background: 'var(--fs-midnight)',
          color: 'var(--fs-white)',
        }}
      >
        <LaunchPattern />
        <div className="relative flex h-full flex-col justify-between">{children}</div>
      </div>
      <figcaption style={{ fontSize: 11, color: 'var(--fs-ink-muted)' }}>{caption}</figcaption>
    </figure>
  );
}

export function Spread15LaunchLines() {
  return (
    <Spread
      number="15"
      title="Launch lines"
      note="Pattern sits behind headlines, never behind the logo"
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'minmax(0,1.778fr) minmax(0,1fr) minmax(0,0.5625fr)' }}
        >
          <Crop ratio="16 / 9" caption="Hero · 16:9">
            <FsLockup layout="horizontal" tone="reverse" markSize={22} />
            <p className="m-0" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.1 }}>
              Start fresh.
              <br />
              Scale fast.
            </p>
          </Crop>

          <Crop ratio="1 / 1" caption="Social tile · 1:1">
            <FsLockup layout="horizontal" tone="reverse" markSize={18} />
            <p className="m-0" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>
              We back founders from day one.
            </p>
          </Crop>

          <Crop ratio="9 / 16" caption="Story · 9:16">
            <span />
            <p className="m-0" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>
              Start fresh.
            </p>
          </Crop>
        </div>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)' }}
        >
          <figure className="m-0 flex flex-col gap-2">
            <div
              className="relative overflow-hidden"
              style={{
                height: 92,
                borderRadius: 'var(--fs-tile-radius)',
                background: 'var(--fs-midnight)',
              }}
            >
              <LaunchPattern opacity={0.65} />
            </div>
            <figcaption style={{ fontSize: 11, color: 'var(--fs-ink-muted)' }}>
              Repeat unit 40 × 40
            </figcaption>
          </figure>

          <figure className="m-0 flex flex-col gap-2">
            <div
              className="relative flex items-center overflow-hidden px-5"
              style={{
                height: 92,
                borderRadius: 'var(--fs-tile-radius)',
                background: 'var(--fs-midnight)',
                color: 'var(--fs-white)',
              }}
            >
              <LaunchPattern />
              <p
                className="relative m-0"
                style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.15 }}
              >
                Scale fast.
              </p>
              <div className="absolute" style={{ top: 6, right: 6 }}>
                <RuleMarker kind="do" size={18} />
              </div>
            </div>
            <figcaption style={{ fontSize: 11, color: 'var(--fs-ink-muted)' }}>
              Behind a headline
            </figcaption>
          </figure>

          <figure className="m-0 flex flex-col gap-2">
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                height: 92,
                borderRadius: 'var(--fs-tile-radius)',
                background: 'var(--fs-midnight)',
              }}
            >
              <LaunchPattern />
              <div className="relative">
                <FsLockup layout="horizontal" tone="reverse" markSize={22} />
              </div>
              <div className="absolute" style={{ top: 6, right: 6 }}>
                <RuleMarker kind="dont" size={18} />
              </div>
            </div>
            <figcaption style={{ fontSize: 11, color: 'var(--fs-ink-muted)' }}>
              Behind the logo
            </figcaption>
          </figure>
        </div>
      </div>
    </Spread>
  );
}
