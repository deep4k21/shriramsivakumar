import type { RowResearch } from '../data/content';

/**
 * The findings a project rests on, beside its premise.
 *
 * Where a persona card would invent a person, this cites what is actually
 * known and names the source in the text. The chips beneath are the audiences
 * the work assumes, labelled as assumptions rather than dressed up as
 * research — which is what the note under the card says outright.
 */
export function ResearchCard({ research }: { research: RowResearch }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-4 rounded-[14px] border border-white/10 bg-white/7 px-7 py-6.5">
        <span className="font-heading text-[15.5px] font-semibold tracking-[-0.01em] text-white">
          {research.title}
        </span>

        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {research.points.map((p) => (
            <li key={p} className="flex gap-2.5 font-body text-[13.5px]/[1.6] text-grey">
              <span aria-hidden="true" className="flex-none text-teal">
                ·
              </span>
              {p}
            </li>
          ))}
        </ul>

        {research.chips && (
          <div className="flex flex-wrap gap-2">
            {research.chips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/12 px-3 py-1.5 font-body text-[12px] text-[#C9D0DA]"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {research.note && (
        <p className="m-0 font-body text-[12px] text-[#8A919C]">{research.note}</p>
      )}
    </div>
  );
}
