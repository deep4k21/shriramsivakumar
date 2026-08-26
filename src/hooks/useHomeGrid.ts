import { useEffect, useRef, useState } from 'react';

const DESIGN_FILENAMES = [
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
];

const TRAVEL_FILENAMES = [
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
];

const IMAGE_SETS: Record<HomeGridMode, string[]> = {
  design: DESIGN_FILENAMES.map((name) => `/images/homegrid/${name}`),
  travel: TRAVEL_FILENAMES.map((name) => `/images/homegrid/${name}`),
};

export type HomeGridMode = 'design' | 'travel';

type Side = 'left' | 'right';

interface SlotAnchor {
  top: string;
  left?: string;
  right?: string;
  /** Width as a share of the hero, so the pattern holds at any viewport. */
  width: string;
  side: Side;
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

/** [col, row] of every filled cell, read off the reference checkerboard. */
const FILLED_CELLS: Array<[number, number]> = [
  [0, 0], [2, 0], [4, 0],
  [1, 1], [3, 1],
  [0, 2], [4, 2],
  [1, 3], [3, 3],
  [0, 4], [2, 4], [4, 4],
];

/** Wait between one column starting its flip and the next, in seconds. */
const FLIP_STAGGER = 0.11;

function cellAnchor([col, row]: [number, number]): SlotAnchor {
  const side: Side = col < 2 ? 'left' : col > 2 ? 'right' : row < 2 ? 'left' : 'right';
  return { top: ROW[row], left: COL[col], width: CELL_W, side, col };
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

const LEFT_ANCHORS: SlotAnchor[] = CELL_ANCHORS.filter((a) => a.side === 'left');
const RIGHT_ANCHORS: SlotAnchor[] = CELL_ANCHORS.filter((a) => a.side === 'right');

const ANCHORS_BY_SIDE: Record<Side, SlotAnchor[]> = { left: LEFT_ANCHORS, right: RIGHT_ANCHORS };

export interface HomeGridSlot {
  /** Stable identity for AnimatePresence — changes whenever the tile's content does. */
  key: string;
  /** Shown on the tile's front face, while the card shows its design side. */
  src: string;
  /** Shown on the back face, revealed when the tile turns over. */
  backSrc: string;
  anchor: SlotAnchor;
}

function pickIndices(count: number, exclude: Set<number>, total: number): number[] {
  const pool = Array.from({ length: total }, (_, i) => i).filter((i) => !exclude.has(i));
  const picked: number[] = [];
  while (picked.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function pickAnchors(side: Side, count: number, exclude: Set<SlotAnchor> = new Set()): SlotAnchor[] {
  const pool = ANCHORS_BY_SIDE[side].filter((a) => !exclude.has(a));
  const picked: SlotAnchor[] = [];
  while (picked.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

let keySeq = 0;
const nextKey = () => `tile-${++keySeq}`;

/** Builds slots split evenly across both sides (slotCount must be even). */
function buildSlots(slotCount: number): HomeGridSlot[] {
  const perSide = slotCount / 2;
  const design = pickIndices(slotCount, new Set(), IMAGE_SETS.design.length);
  const travel = pickIndices(slotCount, new Set(), IMAGE_SETS.travel.length);
  const leftAnchors = pickAnchors('left', perSide);
  const rightAnchors = pickAnchors('right', perSide);
  const anchors = [...leftAnchors, ...rightAnchors];
  return anchors.map((anchor, i) => ({
    key: nextKey(),
    src: IMAGE_SETS.design[design[i]],
    backSrc: IMAGE_SETS.travel[travel[i]],
    anchor,
  }));
}

/**
 * The floating tiles behind the hero card.
 *
 * Each slot carries a fresh `key` whenever its content changes, so
 * `AnimatePresence` in the view animates the old tile out and the new one in —
 * no visibility flags or hand-rolled timing here.
 */
export function useHomeGrid(slotCount = 6, swapIntervalMs = 1500) {
  const [slots, setSlots] = useState<HomeGridSlot[]>(() => buildSlots(slotCount));
  const nextSlotRef = useRef(0);

  // Steady-state: rotate one slot at a time to fresh images + position.
  // Only meaningful when a set has more images than visible slots — with
  // slotCount >= pool size every image is already on screen, so there's nothing
  // left to rotate in and this stays idle.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    if (slotCount >= IMAGE_SETS.design.length) return;

    const id = setInterval(() => {
      const swapSlot = nextSlotRef.current % slotCount;
      nextSlotRef.current += 1;

      setSlots((prev) => {
        // Both faces are replaced together, so a tile never keeps a stale
        // picture on the side that happens to be hidden.
        const pickFor = (set: HomeGridMode, current: (s: HomeGridSlot) => string) => {
          const paths = IMAGE_SETS[set];
          const used = new Set(prev.map((s) => paths.indexOf(current(s))).filter((i) => i !== -1));
          const [idx] = pickIndices(1, used, paths.length);
          return idx === undefined ? undefined : paths[idx];
        };
        const nextSrc = pickFor('design', (s) => s.src);
        const nextBack = pickFor('travel', (s) => s.backSrc);
        if (!nextSrc || !nextBack) return prev;

        const side = prev[swapSlot].anchor.side;
        const usedAnchors = new Set(prev.filter((s) => s.anchor.side === side).map((s) => s.anchor));
        const [nextAnchor] = pickAnchors(side, 1, usedAnchors);
        if (nextAnchor === undefined) return prev;
        return prev.map((s, i) =>
          i === swapSlot
            ? { key: nextKey(), src: nextSrc, backSrc: nextBack, anchor: nextAnchor }
            : s,
        );
      });
    }, swapIntervalMs);

    return () => clearInterval(id);
  }, [slotCount, swapIntervalMs]);

  return slots;
}
