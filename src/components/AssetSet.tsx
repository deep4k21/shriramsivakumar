import { AnimatePresence } from 'motion/react';
import { useCallback, useState } from 'react';
import type { RowAsset } from '../data/content';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { Overlay } from './Overlay';

/** Caps the row so a tall piece cannot push the process row out of shape. */
const DEFAULT_MAX_HEIGHT = 420;

/** A caption's line box plus the gap above it, reserved out of the slot height. */
const CAPTION_SPACE = 22;

/** Gap between stacked pieces — the "breathing room" a row/column set of two doesn't need. */
const STACK_GAP = 20;

/**
 * A process-row slot holding a set of related pieces.
 *
 * Side by side by default: each asset is flex-sized by its real aspect ratio
 * rather than given an equal share, so a portrait poster sits narrower than a
 * landscape spread and the set reads as the actual artefacts rather than a
 * grid of equal boxes.
 *
 * `stack` lays them top to bottom instead — a board and the token set applied
 * beneath it, say, where the two aren't being compared side by side but read
 * in sequence. Each piece is then height-led rather than width-led: it takes
 * the full height budget for itself, at its own ratio, rather than splitting
 * that budget across every piece in the stack — splitting it shrank each
 * image below a readable size the moment a row held two, which defeated the
 * cap's own purpose. Full height each, one after another, reads as a set of
 * full-size artefacts the reader scrolls through rather than a strip of
 * thumbnails.
 *
 * Clicking one opens it full-size in a lightbox over the modal — never a new
 * tab, matching the site-wide rule that the reader never leaves the page.
 *
 * Pieces are contained rather than cropped, so an asset whose shape is nothing
 * like the slot's — a five-card carousel strip at roughly 5:1, say — fits to
 * the width and letterboxes vertically instead of losing its ends.
 *
 * `height` sets this set's height outright, matching it to the other rows of
 * a project whose slots are a fixed height. `maxHeight` only caps it — for a
 * row that should fit whatever the reader's own screen leaves available
 * rather than claim a fixed amount regardless. The two are mutually
 * exclusive in practice: a row picks one or leaves both, and `height` wins if
 * somehow both are given.
 */
export function AssetSet({
  assets,
  height,
  maxHeight: maxHeightProp,
  stack,
  align = 'center',
  columns,
}: {
  assets: RowAsset[];
  height?: string;
  /** Caps rather than sets the height — the row keeps its own natural size below this. */
  maxHeight?: string;
  /** Lays the set top to bottom, each piece height-led, rather than side by side. */
  stack?: boolean;
  /**
   * Default horizontal alignment of stacked pieces within the slot column —
   * `stack` only. `end` reads as the artwork sitting flush with the modal's
   * own right edge, away from the text beside it, rather than floating
   * centred in a column that's wider than any single piece. A piece's own
   * `align` overrides this for just that one.
   */
  align?: 'center' | 'end';
  /**
   * Lays the set side by side in even columns — each piece an equal share
   * of the row's width, rather than the default's own-ratio share. For a
   * pair meant to read as two halves of one comparison (a light and dark
   * rendering of the same screen, say) rather than two differently-shaped
   * artefacts sized to their own content.
   */
  columns?: boolean;
}) {
  const cap = height ?? maxHeightProp ?? `${DEFAULT_MAX_HEIGHT}px`;
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
        className={
          stack
            ? `flex w-full flex-col ${align === 'end' ? 'items-end' : 'items-center'}`
            : columns
              ? 'flex w-full items-stretch gap-[clamp(12px,1.4vw,24px)]'
              : `flex w-full justify-center gap-[clamp(12px,1.4vw,24px)] ${height ? 'items-center' : 'items-end'}`
        }
        style={
          stack
            ? { gap: STACK_GAP }
            : columns
              ? { height: cap, maxHeight: cap }
              : height
                ? { height, maxHeight: height }
                : { maxHeight: cap }
        }
      >
        {assets.map((a) => (
          <figure
            key={a.src}
            className={`m-0 flex min-w-0 flex-col items-center gap-2 ${(columns || (!stack && height)) ? 'h-full justify-center' : ''} ${
              stack ? ((a.align ?? align) === 'end' ? 'self-end' : 'self-center') : ''
            }`}
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

              Stacked pieces share this same height-led relationship, each at
              the stack's full height budget rather than a slice of it — as
              wide as that height and its own ratio allow, up to the slot's
              own width, and centred within it.

              `columns` is the one mode that ignores ratio for the figure's
              own box — an even width share regardless of what each piece's
              shape would otherwise ask for, since the point is two equal
              halves of a comparison rather than two artefacts at their own
              natural size.
            */
            style={
              stack
                ? { flex: `0 0 auto`, height: cap, width: `calc(${cap} * ${a.ratio ?? 1})`, maxWidth: '100%' }
                : columns
                  ? { flex: `1 1 0%`, height: cap, minWidth: 0 }
                  : height
                    ? { flex: `0 1 auto`, width: `calc(${imageHeight} * ${a.ratio ?? 1})`, minWidth: 0 }
                    : { flex: `${a.ratio ?? 1} 1 0%`, minWidth: 0 }
            }
          >
            <button
              type="button"
              onClick={() => setOpen(a)}
              aria-label={a.caption ? `View ${a.caption}` : 'View asset'}
              className={`flex min-h-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition-colors duration-180 ${
                stack ? 'size-full' : 'flex-1'
              } ${a.padded ? 'p-6' : 'p-0'} ${
                a.white
                  ? 'border-black/10 bg-white hover:border-black/20'
                  : a.light
                    ? 'border-black/10 bg-[#F3F1EC] hover:border-black/20'
                    : 'border-white/7 bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)] hover:border-white/20'
              }`}
            >
              <img
                src={a.src}
                alt=""
                // Contained on both axes, so a portrait piece letterboxes inside
                // the slot instead of being cropped to its shape.
                className={`block object-contain ${stack || columns || height ? 'max-h-full max-w-full' : 'w-full'}`}
                style={stack || columns || height ? undefined : { maxHeight: '100%' }}
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
