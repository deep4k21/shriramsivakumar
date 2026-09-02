import { AnimatePresence } from 'motion/react';
import { useCallback, useState } from 'react';
import type { RowAsset } from '../data/content';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { Overlay } from './Overlay';

/** Caps the row so a tall piece cannot push the process row out of shape. */
const DEFAULT_MAX_HEIGHT = 420;

/** A caption's line box plus the gap above it, reserved out of the slot height. */
const CAPTION_SPACE = 22;

/**
 * A process-row slot holding a set of related pieces side by side.
 *
 * Each asset is flex-sized by its real aspect ratio rather than given an equal
 * share, so a portrait poster sits narrower than a landscape spread and the set
 * reads as the actual artefacts rather than a grid of equal boxes.
 *
 * Clicking one opens it full-size in a lightbox over the modal — never a new
 * tab, matching the site-wide rule that the reader never leaves the page.
 *
 * Pieces are contained rather than cropped, so an asset whose shape is nothing
 * like the slot's — a five-card carousel strip at roughly 5:1, say — fits to
 * the width and letterboxes vertically instead of losing its ends.
 *
 * `height` matches this set to the other rows of a project whose slots are a
 * fixed height; without it the row finds its own, which reads as a step when it
 * sits between two taller slots.
 */
export function AssetSet({ assets, height }: { assets: RowAsset[]; height?: string }) {
  const maxHeight = height ?? `${DEFAULT_MAX_HEIGHT}px`;
  /*
    The height available to the artwork itself, which is the slot less the
    caption beneath it. Captions are a fixed 10px line plus their gap, so this
    is a constant rather than something to measure.
  */
  const captionSpace = assets.some((a) => a.caption) ? CAPTION_SPACE : 0;
  const imageHeight = height ? `(${height} - ${captionSpace}px)` : `${DEFAULT_MAX_HEIGHT}px`;
  const [open, setOpen] = useState<RowAsset | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useEscapeKey(close);

  return (
    <>
      <div
        className={`flex w-full justify-center gap-[clamp(12px,1.4vw,24px)] ${height ? 'items-center' : 'items-end'}`}
        // A fixed height fills the slot rather than capping it: a wide asset
        // never reaches the cap on its own, so the row would otherwise collapse
        // to the image height and sit short beside the other rows.
        style={height ? { height, maxHeight: height } : { maxHeight }}
      >
        {assets.map((a) => (
          <figure
            key={a.src}
            className={`m-0 flex min-w-0 flex-col gap-2 ${height ? 'h-full justify-center' : ''}`}
            /*
              Width derived from the row's height, not from a share of its
              width.

              Sizing by width share leaves every piece short in a tall slot: a
              piece's width fixes its height through its ratio, so three pieces
              sharing a column each end up a third as tall as the slot allows.
              Deriving the width from the height instead means the pieces stand
              at the same height and the ratio decides how wide each one is — a
              portrait standee narrow, a square board wider — which is the real
              relationship between the artefacts. `shrink` keeps a wide set from
              overflowing when the ratios add up to more than the row can hold.
            */
            style={
              height
                ? { flex: `0 1 auto`, width: `calc(${imageHeight} * ${a.ratio ?? 1})`, minWidth: 0 }
                : { flex: `${a.ratio ?? 1} 1 0%`, minWidth: 0 }
            }
          >
            <button
              type="button"
              onClick={() => setOpen(a)}
              aria-label={a.caption ? `View ${a.caption}` : 'View asset'}
              className={`flex min-h-0 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-xl border p-0 transition-colors duration-180 ${
                a.light
                  ? 'border-black/10 bg-[#F3F1EC] hover:border-black/20'
                  : 'border-white/7 bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)] hover:border-white/20'
              }`}
            >
              <img
                src={a.src}
                alt=""
                // Contained on both axes, so a portrait piece letterboxes inside
                // the slot instead of being cropped to its shape.
                className={`block object-contain ${height ? 'max-h-full max-w-full' : 'w-full'}`}
                style={height ? undefined : { maxHeight: '100%' }}
              />
            </button>
            {a.caption && (
              <figcaption className="font-body text-[10px] tracking-[0.14em] text-grey uppercase">
                {a.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <Overlay
            z="z-70"
            onClose={close}
            className="relative max-h-full w-auto max-w-[min(1200px,100%)]"
          >
            <img
              src={open.src}
              alt={open.caption ?? ''}
              className="block max-h-[82vh] w-auto max-w-full rounded-[14px] border border-white/9 object-contain"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 size-9 cursor-pointer rounded-[9px] border-0 bg-black/70 font-body text-base text-white transition-colors duration-180 hover:bg-black/90"
            >
              ✕
            </button>
            {open.caption && (
              <figcaption className="mt-3 text-center font-body text-[10px] tracking-[0.14em] text-grey uppercase">
                {open.caption}
              </figcaption>
            )}
          </Overlay>
        )}
      </AnimatePresence>
    </>
  );
}
