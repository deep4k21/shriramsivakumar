import { useEffect, useRef, useState } from 'react';

/**
 * Every image in the grid pool — one per filled cell, so the whole set is on
 * screen at once rather than a subset cycling through a larger library.
 */
const FILENAMES = [
  'card01_portrait_man.png',
  'card02_experience_nxt.png',
  'card03_forge_logo.png',
  'card04_pale_blue.png',
  'card05_orbit_shift_podcast.png',
  'card06_phone_screens.png',
  'card07_iprovision.png',
  'card08_ufo_desert.png',
  'card09_recognizing_needs.png',
  'card10_freshsprint_hackathon.png',
  'card11_food_illustration.png',
  'card12_phones_travel.png',
  'card13_six_reasons_freshworks.png',
  'card14_city_illustration.png',
  'card15_project_agresar.png',
  'card16_freshstart_logo.png',
  'card17_lavender_blank.png',
  'card18_icons_grid.png',
  'card19_mobily_dashboard.png',
  'card20_man_thinking.png',
  'card21_icons_grid.png',
  'card22_freshstart_logo.png',
];

const IMAGES = FILENAMES.map((name) => `/images/homegrid/${name}`);

/**
 * The card's two faces still show different pictures, so the flip reveals a
 * changed scene rather than the same one twice. Both faces draw from the same
 * pool; the back is offset by half the pool so a tile never shows the same
 * image on both sides.
 */
const BACK_OFFSET = Math.floor(IMAGES.length / 2);

interface SlotAnchor {
  top: string;
  left?: string;
  right?: string;
  /** Width as a share of the hero, so the pattern holds at any viewport. */
  width: string;
  /** Grid column, which sets when this cell joins a sweeping flip. */
  col: number;
}

/**
 * The tiles sit on a checkerboard: a 5×5 grid where alternating cells are
 * filled, leaving the centre 3×3 clear for the hero card.
 *
 * Columns 0–1 land left of the card, 3–4 right; the middle column only carries
 * tiles in the top and bottom rows, where the card is not in the way. Rows and
 * columns are expressed in percentages so the pattern scales with the hero.
 */
/**
 * An exact 5×5: each cell is a fifth of the hero and starts where the last one
 * ended, so the checkerboard tiles edge to edge with no seams between filled
 * neighbours. The previous values were hand-tuned per column and left gaps of
 * up to 11% horizontally and 6% vertically.
 *
 * The centre cell [2,2] is deliberately unfilled — it sits at 40–60% on both
 * axes, and the hero card covers 36–64% × 21–79% at the narrowest viewport, so
 * a tile there would be hidden behind the card anyway.
 */
const COL = ['0%', '20%', '40%', '60%', '80%'];
const ROW = ['0%', '20%', '40%', '60%', '80%'];
const CELL_W = '20%';
/** Cell height as a share of the hero — a full fifth, so rows meet exactly. */
export const CELL_H = '20%';

/**
 * [col, row] of every filled cell.
 *
 * The full 5×5 grid, less the three cells the hero card covers — column 2,
 * rows 1 through 3. That leaves 22 cells, one for each image in the pool, so
 * the whole set is visible at once with no cell left empty.
 */
const FILLED_CELLS: Array<[number, number]> = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
  [0, 1], [1, 1],         [3, 1], [4, 1],
  [0, 2], [1, 2],         [3, 2], [4, 2],
  [0, 3], [1, 3],         [3, 3], [4, 3],
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
];

/** Wait between one column starting its flip and the next, in seconds. */
const FLIP_STAGGER = 0.11;

function cellAnchor([col, row]: [number, number]): SlotAnchor {
  return { top: ROW[row], left: COL[col], width: CELL_W, col };
}

/**
 * How long a cell waits before flipping, so the turn sweeps across the grid
 * one column at a time rather than every tile going at once.
 *
 * `reverse` runs the sweep right-to-left, which is what makes the return trip
 * travel back the way it came instead of repeating the same left-to-right pass.
 */
export function flipDelayFor(col: number, reverse: boolean): number {
  const order = reverse ? COL.length - 1 - col : col;
  return order * FLIP_STAGGER;
}

const CELL_ANCHORS = FILLED_CELLS.map(cellAnchor);

export interface HomeGridSlot {
  /** Stable identity for AnimatePresence — changes whenever the tile's content does. */
  key: string;
  /** Shown on the tile's front face, while the card shows its design side. */
  src: string;
  /** Shown on the back face, revealed when the tile turns over. */
  backSrc: string;
  anchor: SlotAnchor;
}

/** A shuffled copy, so the pool lands in a different order on each visit. */
function shuffled<T>(items: T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

let keySeq = 0;
const nextKey = () => `tile-${++keySeq}`;

/**
 * One slot per filled cell, holding the whole image pool at once.
 *
 * Cells are not chosen — every one is filled, which is what makes the grid
 * read as a complete checkerboard rather than a scattering of tiles. Only the
 * assignment of images to cells is random.
 */
function buildSlots(): HomeGridSlot[] {
  const order = shuffled(IMAGES.map((_, i) => i));
  return CELL_ANCHORS.map((anchor, i) => {
    const front = order[i % order.length];
    return {
      key: nextKey(),
      src: IMAGES[front],
      backSrc: IMAGES[(front + BACK_OFFSET) % IMAGES.length],
      anchor,
    };
  });
}

/**
 * The tiles behind the hero card.
 *
 * Every cell of the checkerboard is filled from the start, so the whole image
 * pool is on screen at once. The cycle then swaps one tile at a time: a tile
 * keeps its cell and takes a new image, which the view cross-fades because the
 * slot's `key` changes.
 *
 * The tile is picked at random rather than in sequence, so the changes read as
 * scattered across the grid instead of marching through it in order. The one
 * rule is that it never picks the tile it just changed — back-to-back swaps in
 * the same cell look like a glitch rather than a rotation.
 *
 * Images cycle among the tiles rather than being drawn from a larger library:
 * with the pool exactly filling the grid there is no unseen image to bring in,
 * so a swap trades pictures with another cell.
 */
export function useHomeGrid(swapIntervalMs = 2600) {
  const [slots, setSlots] = useState<HomeGridSlot[]>(() => buildSlots());
  /** The cell changed last, so the next pick can avoid repeating it. */
  const lastSwapped = useRef(-1);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      setSlots((prev) => {
        if (prev.length < 2) return prev;

        // A random cell, never the one changed last.
        let target = Math.floor(Math.random() * prev.length);
        if (target === lastSwapped.current) target = (target + 1) % prev.length;
        lastSwapped.current = target;

        // Trade images with another cell: the pool exactly fills the grid, so
        // a new picture for this tile has to come from somewhere on it.
        let donor = Math.floor(Math.random() * prev.length);
        if (donor === target) donor = (donor + 1) % prev.length;

        return prev.map((s, i) => {
          if (i === target)
            return { ...s, key: nextKey(), src: prev[donor].src, backSrc: prev[donor].backSrc };
          if (i === donor)
            return { ...s, key: nextKey(), src: prev[target].src, backSrc: prev[target].backSrc };
          return s;
        });
      });
    }, swapIntervalMs);

    return () => clearInterval(id);
  }, [swapIntervalMs]);

  return slots;
}
