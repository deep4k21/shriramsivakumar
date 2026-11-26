import type { RowPersona } from '../data/content';

/**
 * A proto-persona, as markup rather than an exported image.
 *
 * The version this replaces was a Figma sheet dropped in as a `.webp`: text
 * that could not be selected, searched, read by a screen reader or reflowed,
 * and that went stale the moment the copy changed. Everything here is real
 * text in the site's own styles.
 *
 * The avatar is initials on a flat ground, never a stock photograph — a
 * borrowed face implies a real person was interviewed, which is exactly what
 * the note beneath the card exists to deny.
 */
export function PersonaCard({ persona }: { persona: RowPersona }) {
  const initials = persona.name
    .replace(/^(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-5 rounded-[14px] border border-white/10 bg-white/7 px-7 py-6.5">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-12 flex-none items-center justify-center rounded-full font-heading text-[15px] font-semibold tracking-[0.01em] text-white"
            style={{ background: persona.avatarColor ?? '#15697A' }}
          >
            {initials}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-heading text-[17px] font-semibold tracking-[-0.01em] text-white">
              {persona.name}
            </span>
            <span className="font-body text-[12.5px] text-grey">{persona.meta}</span>
          </div>
        </div>

        <p className="m-0 font-body text-[14px]/[1.65] text-grey italic">{persona.bio}</p>

        {/*
          The quote is the one line in the card written in the persona's own
          voice, so it is set apart rather than run in with the description.
        */}
        <blockquote
          className="m-0 rounded-[10px] border-l-2 px-4 py-3 font-body text-[14px]/[1.6] text-[#D7DCE3]"
          style={{ borderColor: persona.avatarColor ?? '#15697A', background: 'rgba(255,255,255,0.04)' }}
        >
          {persona.quote}
        </blockquote>

        {/*
          The two columns take the same pair of colours the case study uses
          for its problem and solution cards: green for what she needs, orange
          for what is in the way. The persona then reads in the same terms as
          the rest of the page rather than as one undifferentiated teal block.
        */}
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { label: 'Core needs', items: persona.needs, tone: 'text-green' },
            { label: 'Frustrations', items: persona.frustrations, tone: 'text-orange' },
          ].map((col) => (
            <div key={col.label} className="flex flex-col gap-2">
              <span
                className={`font-heading text-[11px] font-semibold tracking-[0.14em] uppercase ${col.tone}`}
              >
                {col.label}
              </span>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {col.items.map((item) => (
                  <li key={item} className="flex gap-2 font-body text-[13px]/[1.5] text-grey">
                    <span aria-hidden="true" className={`flex-none ${col.tone}`}>
                      ·
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {persona.note && (
        <p className="m-0 font-body text-[12px] text-[#8A919C]">{persona.note}</p>
      )}
    </div>
  );
}
