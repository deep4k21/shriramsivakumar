import type { ProcessRow } from '../data/content';
import { BehaviourCards } from './BehaviourCards';
import { DecisionGrid } from './DecisionGrid';
import { PrototypeBanner } from './PrototypeBanner';

/**
 * Whatever a row carries below its own content: the decisions behind it, the
 * way into the live thing, and screens of what it does.
 *
 * Shared by the standard and `textOnly` row shapes, which render their text
 * differently but end the same way. Renders nothing unless the row asks for
 * one of these, so every existing row is unaffected.
 */
export function RowLiveTail({ row }: { row: ProcessRow }) {
  if (!row.decisions && !row.prototypeBanner && !row.behaviours) return null;

  return (
    <div className="flex w-full flex-col gap-6 pt-1">
      {/* The row's own label names this section, so the grid stands alone. */}
      {row.decisions && <DecisionGrid decisions={row.decisions} />}

      {row.prototypeBanner && <PrototypeBanner banner={row.prototypeBanner} />}

      {row.behaviours && (
        <div className="flex flex-col gap-3.5">
          <span className="font-heading text-xs font-semibold tracking-[0.14em] text-teal">
            TRY THIS
          </span>
          <BehaviourCards cards={row.behaviours} />
        </div>
      )}
    </div>
  );
}
