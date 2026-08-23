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
 * Columns 1 and 3 stop short of the card and column 2 only carries tiles in the
 * top and bottom rows, so nothing crosses it. Rows 1 and 3 likewise clear the
 * card's vertical band.
 *
 * The clearance is generous because the card is a fixed pixel width: on a
 * narrower viewport it covers a larger share of the hero, so columns tuned
 * tightly to one width bite into it at another.
 */
const COL = ['0%', '17.5%', '37%', '65%', '83%'];
const ROW = ['2%', '20%', '42%', '64%', '82%'];
const CELL_W = '17%';
/** Cell height as a share of the hero, matching the reference's wide cells. */
export const CELL_H = '16%';

/** [col, row] of every filled cell, read off the reference checkerboard. */
const FILLED_CELLS: Array<[number, number]> = [
  [0, 0], [2, 0], [4, 0],
  [1, 1], [3, 1],
  [0, 2], [4, 2],
  [1, 3], [3, 3],
  [0, 4], [2, 4], [4, 4],
];

function cellAnchor([col, row]: [number, number]): SlotAnchor {
  const side: Side = col < 2 ? 'left' : col > 2 ? 'right' : row < 2 ? 'left' : 'right';
  return { top: ROW[row], left: COL[col], width: CELL_W, side };
}

const CELL_ANCHORS = FILLED_CELLS.map(cellAnchor);

const LEFT_ANCHORS: SlotAnchor[] = CELL_ANCHORS.filter((a) => a.side === 'left');
const RIGHT_ANCHORS: SlotAnchor[] = CELL_ANCHORS.filter((a) => a.side === 'right');

const ANCHORS_BY_SIDE: Record<Side, SlotAnchor[]> = { left: LEFT_ANCHORS, right: RIGHT_ANCHORS };

export interface HomeGridSlot {
  /** Stable identity for AnimatePresence — changes whenever the tile's content does. */
  key: string;
  src: string;
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
function buildSlots(mode: HomeGridMode, slotCount: number): HomeGridSlot[] {
  const paths = IMAGE_SETS[mode];
  const perSide = slotCount / 2;
  const imageIdx = pickIndices(slotCount, new Set(), paths.length);
  const leftAnchors = pickAnchors('left', perSide);
  const rightAnchors = pickAnchors('right', perSide);
  const anchors = [...leftAnchors, ...rightAnchors];
  return imageIdx.map((idx, i) => ({ key: nextKey(), src: paths[idx], anchor: anchors[i] }));
}

/**
 * The floating tiles behind the hero card.
 *
 * Each slot carries a fresh `key` whenever its content changes, so
 * `AnimatePresence` in the view animates the old tile out and the new one in —
 * no visibility flags or hand-rolled timing here.
 */
export function useHomeGrid(mode: HomeGridMode, slotCount = 6, swapIntervalMs = 1500) {
  const [slots, setSlots] = useState<HomeGridSlot[]>(() => buildSlots(mode, slotCount));
  const modeRef = useRef(mode);
  const nextSlotRef = useRef(0);

  // Flipping the hero card swaps the whole set for the other mode's images.
  useEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    setSlots(buildSlots(mode, slotCount));
  }, [mode, slotCount]);

  // Steady-state: rotate one slot at a time to a fresh image + position.
  // Only meaningful when the active set has more images than visible slots —
  // with slotCount >= pool size every image is already on screen, so there's
  // nothing left to rotate in and this stays idle.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    if (slotCount >= IMAGE_SETS[mode].length) return;

    const id = setInterval(() => {
      const swapSlot = nextSlotRef.current % slotCount;
      nextSlotRef.current += 1;

      setSlots((prev) => {
        const paths = IMAGE_SETS[modeRef.current];
        const usedIdx = new Set(prev.map((s) => paths.indexOf(s.src)).filter((idx) => idx !== -1));
        const [nextIdx] = pickIndices(1, usedIdx, paths.length);
        if (nextIdx === undefined) return prev;
        const side = prev[swapSlot].anchor.side;
        const usedAnchors = new Set(prev.filter((s) => s.anchor.side === side).map((s) => s.anchor));
        const [nextAnchor] = pickAnchors(side, 1, usedAnchors);
        if (nextAnchor === undefined) return prev;
        return prev.map((s, i) =>
          i === swapSlot ? { key: nextKey(), src: paths[nextIdx], anchor: nextAnchor } : s,
        );
      });
    }, swapIntervalMs);

    return () => clearInterval(id);
  }, [mode, slotCount, swapIntervalMs]);

  return slots;
}
