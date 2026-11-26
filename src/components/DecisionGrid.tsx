import type { RowDecision } from '../data/content';

/**
 * The numbered decisions behind a design, as a grid.
 *
 * Each card is a choice and the reason for it, which is the part of a case
 * study worth reading: the finished screens show what was built, and only
 * this shows why. The number is set large and in the project's own accent so
 * the grid scans as a sequence rather than as six unrelated notes.
 */
export function DecisionGrid({ decisions }: { decisions: RowDecision[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decisions.map((d) => (
        <div
          key={d.number}
          className="flex flex-col gap-2 rounded-[14px] border border-white/10 bg-white/7 px-5 py-4.5"
        >
          <span
            className="font-heading text-[22px] leading-none font-bold tracking-[0.02em]"
            style={{ color: d.color ?? 'var(--color-teal)' }}
          >
            {d.number}
          </span>
          <span className="font-heading text-[14.5px] font-semibold tracking-[-0.01em] text-white">
            {d.title}
          </span>
          <p className="m-0 font-body text-[13px]/[1.55] text-grey">{d.text}</p>
        </div>
      ))}
    </div>
  );
}
