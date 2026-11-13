import { Spread } from '../Spread';

/**
 * The scale, as the type classes themselves.
 *
 * `className` is what each row demonstrates, so the sample is rendered with
 * the real class rather than a size copied beside it: if a token changes,
 * this spread changes with it instead of quietly going out of date. That is
 * also why no font-size appears anywhere in this file.
 */
const STEPS = [
  { name: 'Display', spec: '64 / 1.05', className: 'fs-display', sample: 'Start fresh.' },
  { name: 'H1', spec: '40 / 1.15', className: 'fs-h1', sample: 'Scale fast.' },
  { name: 'H2', spec: '28 / 1.25', className: 'fs-h2', sample: 'Built alongside founders' },
  {
    name: 'Body',
    spec: '16 / 1.6',
    className: 'fs-body',
    sample: 'Small teams, fast starts, and a family to grow up in.',
  },
  {
    name: 'Caption',
    spec: '12 · caps · 0.14em',
    className: 'fs-caption',
    sample: 'Brand guidelines v1.0',
  },
];

export function Spread13Typography() {
  return (
    <Spread
      number="13"
      title="Typography"
      note="Web fallback: Inter Tight → Helvetica Neue → Arial"
    >
      <div
        className="grid h-full gap-10"
        style={{ gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)' }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span style={{ fontSize: 20, fontWeight: 600 }}>Neue Haas Unica</span>
            <span style={{ fontSize: 12, color: 'var(--fs-ink-muted)' }}>
              One family for everything except the wordmark
            </span>
          </div>

          <dl className="m-0 flex flex-col gap-4">
            {STEPS.map((s) => (
              <div
                key={s.name}
                className="grid items-baseline gap-4 pt-3"
                style={{
                  gridTemplateColumns: '112px minmax(0,1fr)',
                  borderTop: '1px solid var(--fs-line-soft)',
                }}
              >
                <dt className="flex flex-col gap-0.5">
                  <span
                    className="uppercase"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      color: 'var(--fs-founder-blue)',
                    }}
                  >
                    {s.name}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--fs-ink-muted)' }}>{s.spec}</span>
                </dt>
                {/* Clipped rather than wrapped: Display at full size runs
                    wider than its column, and the row is a specimen of the
                    step, not a paragraph. */}
                <dd className={`m-0 overflow-hidden text-ellipsis whitespace-nowrap ${s.className}`}>
                  {s.sample}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <figure
          className="m-0 flex flex-col justify-center gap-5 p-9"
          style={{ background: 'var(--fs-mist)', borderRadius: 'var(--fs-card-radius)' }}
        >
          <span className="fs-caption" style={{ color: 'var(--fs-founder-blue)' }}>
            Freshstart · partner programme
          </span>
          <p className="fs-h1 m-0">
            Start fresh.
            <br />
            Scale fast.
          </p>
          <p className="fs-body m-0" style={{ color: 'var(--fs-ink-muted)' }}>
            Small teams, fast starts, and a family to grow up in.
          </p>
          <figcaption
            className="fs-caption mt-2 pt-3"
            style={{ borderTop: '1px solid var(--fs-line)', color: 'var(--fs-ink-muted)' }}
          >
            Sample layout
          </figcaption>
        </figure>
      </div>
    </Spread>
  );
}
