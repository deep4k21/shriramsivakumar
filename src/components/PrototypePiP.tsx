import { motion } from 'motion/react';
import { useState } from 'react';
import type { ProjectPrototype } from '../data/content';

/**
 * The process-row image slot's picture-in-picture variant: a static mockup
 * image with an inset "LIVE PROTOTYPE" panel in the lower-right corner.
 * Clicking the inset swaps it with the main image — prototype fills the
 * slot, mockup shrinks to the inset — without changing the slot's height, so
 * the row never grows and the page never jumps.
 */
export function PrototypePiP({ prototype }: { prototype: ProjectPrototype }) {
  const [platformIdx, setPlatformIdx] = useState(0);
  const [swapped, setSwapped] = useState(false);
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const multiPlatform = prototype.platforms.length > 1;
  const platform = prototype.platforms[platformIdx];

  const mainLabel = swapped ? `LIVE PROTOTYPE — ${platform.label.toUpperCase()}` : prototype.imageLabel;
  const insetLabel = swapped ? prototype.imageLabel : 'LIVE PROTOTYPE';

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.32, ease: [0.2, 0.7, 0.2, 1] as const };

  return (
    <div className="relative size-full overflow-hidden rounded-xl border border-white/7 bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)]">
      {/* Main surface — the static image, or (once swapped) the live prototype. */}
      <div className="absolute inset-0 grid place-items-center">
        {swapped ? (
          <iframe
            title={`${platform.label} prototype`}
            src={platform.embedUrl}
            className="size-full border-0"
          />
        ) : (
          <span className="font-body text-[10px] tracking-[0.14em] text-grey">{mainLabel}</span>
        )}
      </div>

      {/* Segmented control — only shown with more than one platform. */}
      {multiPlatform && (
        <div className="absolute top-3 left-3 z-10 flex gap-0.5 rounded-[7px] border border-white/15 bg-black/70 p-0.5 backdrop-blur-md">
          {prototype.platforms.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPlatformIdx(i)}
              className="cursor-pointer rounded-[5px] border-none px-2.5 py-1 font-body text-[10.5px] transition-colors duration-150"
              style={{
                background: i === platformIdx ? 'rgba(255,154,92,.16)' : 'transparent',
                color: i === platformIdx ? '#FF9A5C' : '#808080',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Inset panel — swaps main/inset roles on click. Sized ~35% of the slot's width. */}
      <motion.button
        type="button"
        onClick={() => setSwapped((s) => !s)}
        aria-label={swapped ? `Show ${prototype.imageLabel.toLowerCase()}` : 'Show live prototype'}
        layout
        transition={transition}
        className="absolute right-3 bottom-3 z-10 grid aspect-video w-[35%] cursor-pointer place-items-center overflow-hidden rounded-lg border border-white/25 bg-black/75 shadow-[0_12px_32px_rgba(0,0,0,.45)] backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
      >
        {!swapped && multiPlatform && (
          <div className="pointer-events-none absolute top-1.5 left-1.5 rounded-[4px] bg-black/60 px-1.5 py-0.5 font-body text-[8.5px] tracking-[0.1em] text-white/80">
            {platform.label.toUpperCase()}
          </div>
        )}
        <span className="font-body text-[10px] tracking-[0.14em] text-grey uppercase">{insetLabel}</span>
      </motion.button>
    </div>
  );
}
