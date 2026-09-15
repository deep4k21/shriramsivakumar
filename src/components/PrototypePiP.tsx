import { useState } from 'react';
import type { ProjectPrototype } from '../data/content';
import { PrototypeLoader } from './PrototypeLoader';

/** The process row's embedded live-prototype slot. Never opens in a new tab — stays on the page. */
export function PrototypePiP({ prototype }: { prototype: ProjectPrototype }) {
  // Both call sites key this component on the embed URL, so switching
  // prototypes remounts it fresh rather than reusing a `loaded: true` from
  // whatever was showing before.
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative size-full overflow-hidden rounded-xl border border-white/7 bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)]">
      {!loaded && <PrototypeLoader />}
      <iframe
        title="Live prototype"
        src={prototype.embedUrl}
        className="size-full border-0"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
