import type { ProjectPrototype } from '../data/content';

/** The process row's embedded live-prototype slot. Never opens in a new tab — stays on the page. */
export function PrototypePiP({ prototype }: { prototype: ProjectPrototype }) {
  return (
    <div className="size-full overflow-hidden rounded-xl border border-white/7 bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)]">
      <iframe title="Live prototype" src={prototype.embedUrl} className="size-full border-0" />
    </div>
  );
}
