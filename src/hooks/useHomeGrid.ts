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
  rotate: number;
  width: number;
  side: Side;
}

const LEFT_ANCHORS: SlotAnchor[] = [
  { top: '2%', left: '1%', rotate: -6, width: 176, side: 'left' },
  { top: '56%', left: '0%', rotate: 4, width: 172, side: 'left' },
  { top: '28%', left: '6%', rotate: -3, width: 148, side: 'left' },
  { top: '80%', left: '13%', rotate: 5, width: 140, side: 'left' },
  { top: '2%', left: '24%', rotate: 4, width: 128, side: 'left' },
];

const RIGHT_ANCHORS: SlotAnchor[] = [
  { top: '6%', right: '2%', rotate: 5, width: 160, side: 'right' },
  { top: '60%', right: '1%', rotate: -5, width: 164, side: 'right' },
  { top: '32%', right: '5%', rotate: 6, width: 154, side: 'right' },
  { top: '80%', right: '13%', rotate: -4, width: 144, side: 'right' },
  { top: '2%', right: '24%', rotate: -5, width: 132, side: 'right' },
];

const ANCHORS_BY_SIDE: Record<Side, SlotAnchor[]> = { left: LEFT_ANCHORS, right: RIGHT_ANCHORS };

export interface HomeGridSlot {
  src: string;
  anchor: SlotAnchor;
  visible: boolean;
  /** true while the slot is flying/fading out toward the scatter position */
  scattered: boolean;
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

/** Builds slots split evenly across both sides (slotCount must be even). */
function buildSlots(mode: HomeGridMode, slotCount: number): HomeGridSlot[] {
  const paths = IMAGE_SETS[mode];
  const perSide = slotCount / 2;
  const imageIdx = pickIndices(slotCount, new Set(), paths.length);
  const leftAnchors = pickAnchors('left', perSide);
  const rightAnchors = pickAnchors('right', perSide);
  const anchors = [...leftAnchors, ...rightAnchors];
  return imageIdx.map((idx, i) => ({ src: paths[idx], anchor: anchors[i], visible: true, scattered: false }));
}

const FADE_OUT_MS = 400;
const SCATTER_OUT_MS = 480;
const SCATTER_IN_DELAY_MS = 120;

export function useHomeGrid(mode: HomeGridMode, slotCount = 6, swapIntervalMs = 1500) {
  const [slots, setSlots] = useState<HomeGridSlot[]>(() => buildSlots(mode, slotCount));
  const modeRef = useRef(mode);
  const nextSlotRef = useRef(0);

  // Scatter-out / scatter-in when the mode (design <-> travel) changes.
  useEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;

    setSlots((prev) => prev.map((s) => ({ ...s, scattered: true, visible: false })));

    const inTimer = setTimeout(() => {
      // Mount the new set already scattered + invisible, then settle it on the
      // next frame so the browser animates the fly-in instead of snapping.
      setSlots(buildSlots(mode, slotCount).map((s) => ({ ...s, scattered: true, visible: false })));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlots((prev) => prev.map((s) => ({ ...s, scattered: false, visible: true })));
        });
      });
    }, SCATTER_OUT_MS + SCATTER_IN_DELAY_MS);

    return () => clearTimeout(inTimer);
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

      setSlots((prev) => prev.map((s, i) => (i === swapSlot ? { ...s, visible: false } : s)));

      setTimeout(() => {
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
            i === swapSlot
              ? { src: paths[nextIdx], anchor: nextAnchor, visible: true, scattered: false }
              : s,
          );
        });
      }, FADE_OUT_MS);
    }, swapIntervalMs);

    return () => clearInterval(id);
  }, [mode, slotCount, swapIntervalMs]);

  return slots;
}
