import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { GRID_IMAGES } from './gridImages';

/**
 * How many tiles fade to their other face at once.
 *
 * The desktop field runs eight of twenty-two. A phone shows far fewer tiles
 * at a time, so the same proportion would leave almost the whole visible
 * area moving; two keeps the grid alive without the screen ever reading as
 * unsettled.
 */
const CONCURRENT = 2;

/** How long a tile holds a face before it swaps. */
const SWAP_MS = 3400;

/**
 * The image field behind the hero, as a vertical grid.
 *
 * The desktop version is a 5×5 checkerboard positioned absolutely around the
 * hero card, with a deliberately empty centre cell the card sits over — that
 * composition is built for a landscape stage and has nowhere to go on a
 * phone. This keeps what the field is *for* (the work and the travel photos,
 * quietly cycling between the two) and rebuilds the arrangement as a plain
 * two-column grid that scrolls.
 *
 * Both pools are the same 22 images the desktop grid uses, paired the same
 * way — index *i*'s design card and travel photo are two faces of one tile —
 * so a tile swapping still means the same thing it does on desktop.
 */
export function MobileGrid({ columns = 2, rows = 6 }: { columns?: number; rows?: number }) {
  const reduced = useReducedMotion();
  const count = columns * rows;

  /*
    Which tiles are currently showing their travel face.

    A set of indices rather than per-tile state: the whole point is that only
    a couple swap at once, which is a property of the field rather than of
    any one tile, and a single timer picking from the pool is what guarantees
    it. Per-tile timers would each decide independently and drift into
    stretches where most of the grid is mid-swap.
  */
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      setFlipped((prev) => {
        const next = new Set(prev);
        // Retire the oldest choices before making new ones, so a tile that
        // has swapped gets to hold its new face rather than being flipped
        // back on the very next tick.
        for (const i of prev) if (Math.random() < 0.5) next.delete(i);
        while (next.size < CONCURRENT) next.add(Math.floor(Math.random() * count));
        return next;
      });
    }, SWAP_MS);
    return () => clearInterval(timer);
  }, [reduced, count]);

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => {
        // The pool is 22 and the grid may ask for more or fewer cells, so it
        // wraps — which is what "loop the images" means here: cell 22 shows
        // image 0 again rather than the grid running out.
        const img = GRID_IMAGES[i % GRID_IMAGES.length];
        const showBack = flipped.has(i);
        return (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-[10px] bg-[#15161A]"
          >
            {/*
              Both faces are mounted and cross-faded, rather than one `src`
              being swapped: changing the source makes the browser fetch and
              decode the new image at the moment it is needed, so the tile
              goes blank for a beat on a slow connection. Holding both means
              the swap is only an opacity change.
            */}
            <motion.img
              src={img.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
              style={img.bg ? { backgroundColor: img.bg, objectFit: 'contain' } : undefined}
              animate={{ opacity: showBack ? 0 : 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
            <motion.img
              src={img.backSrc}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: showBack ? 1 : 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </div>
        );
      })}
    </div>
  );
}
