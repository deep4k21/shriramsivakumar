import type { RowBehaviour } from '../data/content';

/**
 * "Try this" — a grid of screens, each showing one thing the build does.
 *
 * A case study can describe a behaviour or it can show it; these show it. The
 * screenshot carries the demonstration, the line beneath says what to notice,
 * and the pair is short enough that a reader can take in all five without
 * committing to the live prototype.
 */
export function BehaviourCards({ cards }: { cards: RowBehaviour[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {cards.map((card) => (
        <figure
          key={card.image}
          className="m-0 flex flex-col gap-3.5 rounded-[14px] border border-white/10 bg-white/7 p-4"
        >
          <img
            src={card.image}
            alt={card.alt ?? card.title}
            className="w-full rounded-[10px] border border-white/7"
          />
          <figcaption className="flex flex-col gap-1.5">
            <span className="font-heading text-[14.5px] font-semibold tracking-[-0.01em] text-white">
              {card.title}
            </span>
            <span className="font-body text-[13px]/[1.55] text-grey">{card.line}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
