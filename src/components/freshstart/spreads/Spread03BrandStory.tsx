import { FsMark } from '../FsMark';

const PILLARS = [
  { title: 'Partnership', line: 'We build alongside, not above.' },
  { title: 'Momentum', line: 'Small teams, fast starts.' },
  { title: 'Belonging', line: 'Part of the family from the first commit.' },
];

/**
 * The brand platform, on Midnight.
 *
 * Carries its own header rather than the shared spread chrome: this is the
 * one spread that leads with the mark, and the "Proposed brand platform"
 * pill has to sit opposite it — the piece is a proposal, and the spread
 * that states the purpose is where that has to be unambiguous.
 */
export function Spread03BrandStory() {
  return (
    <section
      aria-label="Brand story"
      className="fs-brand box-border flex w-full flex-col justify-between gap-10 overflow-hidden"
      style={{
        aspectRatio: '16 / 9',
        borderRadius: 'var(--fs-spread-radius)',
        padding: '48px 56px',
        background: 'var(--fs-midnight)',
        color: 'var(--fs-white)',
      }}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3.5">
          <FsMark size={28} />
          <span
            style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--fs-launch-cyan)' }}
          >
            03
          </span>
          <h2 className="m-0" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Brand story
          </h2>
        </div>
        <span
          className="rounded-full uppercase"
          style={{
            padding: '7px 14px',
            border: '1px solid rgba(106,226,242,0.55)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: 'var(--fs-launch-cyan)',
          }}
        >
          Proposed brand platform
        </span>
      </div>

      <div className="flex max-w-[860px] flex-col gap-4">
        <span
          className="uppercase"
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          Purpose
        </span>
        <p
          className="m-0"
          style={{
            fontSize: 64,
            lineHeight: 1.04,
            fontWeight: 600,
            letterSpacing: '-0.025em',
            textWrap: 'balance',
          }}
        >
          We back founders from day one.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="flex flex-col gap-2.5 pt-[18px]"
            style={{ borderTop: '1px solid rgba(255,255,255,0.24)' }}
          >
            <h3
              className="m-0 uppercase"
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: 'var(--fs-launch-cyan)',
              }}
            >
              {p.title}
            </h3>
            <p className="m-0" style={{ fontSize: 20, lineHeight: 1.35 }}>
              {p.line}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
