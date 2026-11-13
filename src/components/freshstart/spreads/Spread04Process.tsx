import { Fragment } from 'react';
import { PhotoSlot } from '../PhotoSlot';
import { Spread } from '../Spread';

const STEPS = [
  {
    step: '01 · Origin',
    filename: 'origin-community-icon.png',
    caption: 'Three figures holding hands',
    src: '/images/Brand Identity/Freshstart/ORIGIN.webp',
    text: "Started from the parent brand's community icon: three figures holding hands. The mark inherits meaning instead of introducing it.",
  },
  {
    step: '02 · Translation',
    filename: 'translation-sequence.png',
    caption: 'Icon morphed into the family drop shape',
    src: '/images/Brand Identity/Freshstart/TRANSLATION.webp',
    text: "Morphed toward the parent brand's drop shape, so the sub-mark sits inside the family rather than beside it.",
  },
  {
    step: '03 · Inversion',
    filename: 'inversion-outline-to-solid.png',
    caption: 'Negative space becomes a rocket',
    src: '/images/Brand Identity/Freshstart/INVERSION.webp',
    text: "Inverting the colour turned the drop's negative space into a rocket. Partnership and startup became the same shape.",
  },
];

/** The connector between steps. */
function Arrow() {
  return (
    <svg
      width="36"
      height="16"
      viewBox="0 0 36 16"
      aria-hidden="true"
      fill="none"
      stroke="var(--fs-midnight)"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8h30M26 2l6 6-6 6" />
    </svg>
  );
}

/**
 * How the mark was made — origin, translation, inversion.
 *
 * The three process images already exist in the repo from the previous
 * version of this case study, so they are shown rather than left as
 * placeholders. Note that the translation image carries the parent
 * company's logo; it was already published on the live site, but the
 * handoff flags it as needing the owner's sign-off before publishing.
 */
export function Spread04Process() {
  return (
    <Spread number="04" title="How the mark was made" note="Three steps, one shape" ground="mist">
      <div className="flex h-full flex-col justify-between gap-7">
        <div
          className="grid items-center gap-2"
          style={{ gridTemplateColumns: 'minmax(0,1fr) 36px minmax(0,1fr) 36px minmax(0,1fr)' }}
        >
          {STEPS.map((s, i) => (
            <Fragment key={s.step}>
              {i > 0 && <Arrow />}
              <article
                className="box-border flex h-full flex-col gap-3.5 p-4"
                style={{ background: 'var(--fs-white)', borderRadius: 'var(--fs-card-radius)' }}
              >
                <PhotoSlot filename={s.filename} description={s.caption} src={s.src} />
                <h3
                  className="m-0 uppercase"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    color: 'var(--fs-founder-blue)',
                  }}
                >
                  {s.step}
                </h3>
                <p
                  className="m-0"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'var(--fs-ink-muted)',
                    textWrap: 'pretty',
                  }}
                >
                  {s.text}
                </p>
              </article>
            </Fragment>
          ))}
        </div>

        <p
          className="m-0 max-w-[820px]"
          style={{
            fontSize: 22,
            lineHeight: 1.4,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            textWrap: 'pretty',
          }}
        >
          The rocket wasn't the plan. It appeared once the colour inverted, and two ideas resolved
          into one shape.
        </p>
      </div>
    </Spread>
  );
}
