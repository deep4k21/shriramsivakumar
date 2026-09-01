import { useEffect, useRef, useState } from 'react';

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
 * An exact 5×5: each cell is a fifth of the hero and starts where the last one
 * ended, so the checkerboard tiles edge to edge with no seams between filled
 * neighbours.
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
 * Every filled cell, in reading order, paired with the image that lives there.
 *
 * The layout is fixed rather than shuffled: each picture has a chosen home and
 * keeps it for the life of the page, so the composition is designed rather than
 * whatever a shuffle happened to produce. `card10_freshsprint_hackathon` is
 * pinned to bottom-centre, [2,4], the one cell the brief names.
 *
 * The rest are placed for balance across the field:
 *   - the two portraits, 01 and 20, sit on opposite sides and opposite rows
 *   - the near-blank plates, 04 and 17, are split to either side of the card so
 *     the quiet cells do not pool in one corner
 *   - the two logo marks (03, 16/22) and the two icon grids (18, 21) are each
 *     separated, since a repeated look side by side reads as a mistake
 *
 * The full 5×5 less the three cells the card covers — column 2, rows 1–3 —
 * leaves exactly 22, one per image in the set.
 */
const CELLS: Array<{ cell: [number, number]; file: string }> = [
  // Top row, left to right.
  { cell: [0, 0], file: 'card01_portrait_man.png' },
  { cell: [1, 0], file: 'card06_phone_screens.png' },
  { cell: [2, 0], file: 'card13_six_reasons_freshworks.png' },
  { cell: [3, 0], file: 'card18_icons_grid.png' },
  { cell: [4, 0], file: 'card08_ufo_desert.png' },

  // Second row — the card blocks the middle from here down.
  { cell: [0, 1], file: 'card04_pale_blue.png' },
  { cell: [1, 1], file: 'card15_project_agresar.png' },
  { cell: [3, 1], file: 'card02_experience_nxt.png' },
  { cell: [4, 1], file: 'card11_food_illustration.png' },

  // Third row, flanking the card.
  { cell: [0, 2], file: 'card19_mobily_dashboard.png' },
  { cell: [1, 2], file: 'card03_forge_logo.png' },
  { cell: [3, 2], file: 'card16_freshstart_logo.png' },
  { cell: [4, 2], file: 'card09_recognizing_needs.png' },

  // Fourth row.
  { cell: [0, 3], file: 'card14_city_illustration.png' },
  { cell: [1, 3], file: 'card21_icons_grid.png' },
  { cell: [3, 3], file: 'card07_iprovision.png' },
  { cell: [4, 3], file: 'card17_lavender_blank.png' },

  // Bottom row — card10 sits dead centre, as specified.
  { cell: [0, 4], file: 'card12_phones_travel.png' },
  { cell: [1, 4], file: 'card05_orbit_shift_podcast.png' },
  { cell: [2, 4], file: 'card10_freshsprint_hackathon.png' },
  { cell: [3, 4], file: 'card20_man_thinking.png' },
  { cell: [4, 4], file: 'card22_freshstart_logo.png' },
];

/**
 * The back face's image for a given cell, offset through the list so a tile
 * never shows the same picture on both sides. Fixed like the front: the same
 * cell reveals the same second picture every time it turns.
 */
const BACK_OFFSET = Math.floor(CELLS.length / 2);

/** Wait between one column starting its flip and the next, in seconds. */
const FLIP_STAGGER = 0.11;

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

export interface HomeGridSlot {
  /** Stable identity — the tile keeps its cell and image for the page's life. */
  key: string;
  /** Shown on the tile's front face, while the card shows its design side. */
  src: string;
  /** Shown on the back face, revealed when the tile turns over. */
  backSrc: string;
  anchor: SlotAnchor;
  /** False while this tile is contracted. Drives both faces at once. */
  visible: boolean;
}

/**
 * How far a tile shrinks toward its own centre — all the way to nothing, so it
 * collapses into the middle of its cell and grows back out of it.
 */
export const SHRINK_FLOOR = 0;
/**
 * Opacity at full contraction. Redundant against a scale of zero, but it keeps
 * the tile from reading as a hard-edged shape shrinking to a point.
 */
export const FADE_FLOOR = 0;
/** One leg of the shrink-and-grow, in seconds. Slow enough not to catch the eye. */
export const SHRINK_S = 3.4;
/**
 * How long the collapsed tile stays gone before growing back, in ms.
 *
 * This has to outlast one leg of the animation (`SHRINK_S`) or the tile turns
 * around before it ever reaches the centre — which is what made an earlier,
 * faster version bottom out halfway and read as a flicker.
 */
const HIDDEN_MS: [number, number] = [3600, 5200];
/** The pause after a tile has returned before that lane picks another, in ms. */
const BETWEEN_MS: [number, number] = [1200, 3200];
/**
 * How many tiles are animating at once.
 *
 * Five of twenty-two: enough that the grid always has something moving in it,
 * while leaving seventeen steady so the checkerboard still reads as a complete
 * field rather than a dissolving one. Each runs in its own lane — an
 * independent shrink-pause-grow loop — and the lanes never collide on the same
 * cell.
 */
const CONCURRENT = 5;

const randBetween = ([lo, hi]: [number, number]) => lo + Math.random() * (hi - lo);

const SLOTS: HomeGridSlot[] = CELLS.map(({ cell, file }, i) => ({
  key: `cell-${cell[0]}-${cell[1]}`,
  src: `/images/homegrid/${file}`,
  backSrc: `/images/homegrid/${CELLS[(i + BACK_OFFSET) % CELLS.length].file}`,
  anchor: { top: ROW[cell[1]], left: COL[cell[0]], width: CELL_W, col: cell[0] },
  visible: true,
}));

/**
 * The tiles behind the hero card.
 *
 * Every cell is filled from the start and every image keeps its cell — the
 * layout above is the composition, not a starting point it drifts away from.
 * All 22 pictures are on screen throughout.
 *
 * The life in the grid comes from five tiles at a time, each in its own lane:
 * a tile shrinks into its own centre, pauses, and grows back, and only once it
 * has returned does that lane choose another. No lane repeats its own last
 * cell, and no two lanes hold the same one. Seventeen of the twenty-two are
 * therefore steady at any moment, so the checkerboard still reads as a complete
 * field. That is also why the flip needs no special handling: a contracting
 * tile takes both its faces with it.
 */
export function useHomeGrid() {
  const [slots, setSlots] = useState<HomeGridSlot[]>(SLOTS);
  /** Live timers, one per lane, so unmount cannot leave any running. */
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const setVisible = (index: number, visible: boolean) =>
      setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, visible } : s)));

    /** Cells currently spoken for, so two lanes never animate the same tile. */
    const busy = new Set<number>();
    /** The last cell each lane ran, so a lane does not repeat itself. */
    const lastOfLane = new Array<number>(CONCURRENT).fill(-1);
    let stopped = false;

    const after = (lane: number, ms: number, fn: () => void) => {
      timers.current[lane] = window.setTimeout(() => {
        if (!stopped) fn();
      }, ms);
    };

    /**
     * Pick a cell for this lane: never one another lane is already animating,
     * and never the one this lane just ran. Choosing at random without those
     * guards lets a cell come up twice running, which reads as a glitch in one
     * place rather than as movement across the grid.
     */
    const pick = (lane: number): number => {
      const free = SLOTS.map((_, i) => i).filter(
        (i) => !busy.has(i) && i !== lastOfLane[lane],
      );
      // `free` cannot be empty: 22 cells against 5 lanes plus one excluded.
      return free[Math.floor(Math.random() * free.length)];
    };

    /** One lane's endless cycle: choose, collapse, pause, grow back, repeat. */
    const step = (lane: number) => {
      const index = pick(lane);
      busy.add(index);
      lastOfLane[lane] = index;

      setVisible(index, false);
      after(lane, randBetween(HIDDEN_MS), () => {
        setVisible(index, true);
        // Hold the cell until it has finished growing, so the lane cannot
        // reclaim it — or hand it to another lane — mid-return.
        after(lane, SHRINK_S * 1000 + randBetween(BETWEEN_MS), () => {
          busy.delete(index);
          step(lane);
        });
      });
    };

    // Stagger the lanes' first picks so they do not all collapse together and
    // leave the grid pulsing in unison rather than shifting continuously.
    for (let lane = 0; lane < CONCURRENT; lane++) {
      after(lane, randBetween(BETWEEN_MS) + lane * 900, () => step(lane));
    }

    const running = timers.current;
    return () => {
      stopped = true;
      running.forEach(clearTimeout);
    };
  }, []);

  return slots;
}
