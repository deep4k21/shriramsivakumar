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
 *
 * Files live in `Design/`, not the flat `homegrid/` folder — the original set
 * moved there when two of them (04, 17) became GIFs, which is what these paths
 * point at now.
 */
const CELLS: Array<{ cell: [number, number]; file: string; bg?: string }> = [
  // Top row, left to right.
  { cell: [0, 0], file: 'card01_portrait_man.png' },
  { cell: [1, 0], file: 'card06_phone_screens.png' },
  { cell: [2, 0], file: 'card13_six_reasons_freshworks.png' },
  { cell: [3, 0], file: 'card18_icons_grid.png' },
  { cell: [4, 0], file: 'card08_ufo_desert.png' },

  // Second row — the card blocks the middle from here down.
  // `bg`: the phone mockup this gif animates sits tall and centred in a wide
  // canvas, so `object-cover` crops its top and bottom off in most tile
  // shapes. Contained instead, with the gif's own backing colour filling the
  // margin `object-contain` leaves — sampled off its background — rather than
  // whatever's behind the tile showing through as a mismatched letterbox.
  { cell: [0, 1], file: 'card04_pale_blue.gif', bg: '#E6DDF4' },
  { cell: [1, 1], file: 'card15_project_agresar.png' },
  { cell: [3, 1], file: 'card02_experience_nxt.png' },
  // Same reasoning as card04/card17 above — a wide illustration on a light
  // textured ground, cropped hard on the sides by a square tile. Contained
  // instead, with white filling the margin `object-contain` leaves.
  { cell: [4, 1], file: 'card11_food_illustration.png', bg: '#FFFFFF' },

  // Third row, flanking the card.
  { cell: [0, 2], file: 'card19_mobily_dashboard.png' },
  { cell: [1, 2], file: 'card03_forge_logo.png' },
  { cell: [3, 2], file: 'card16_freshstart_logo.png' },
  { cell: [4, 2], file: 'card09_recognizing_needs.png' },

  // Fourth row.
  { cell: [0, 3], file: 'card14_city_illustration.png' },
  { cell: [1, 3], file: 'card21_icons_grid.png' },
  { cell: [3, 3], file: 'card07_iprovision.png' },
  // Same reasoning as card04 above — the illustration's head and desk sit
  // close to the top and bottom edges of its own canvas, so a crop clips one
  // or the other in most tile shapes.
  { cell: [4, 3], file: 'card17_lavender_blank.gif', bg: '#FFFFFF' },

  // Bottom row — card10 sits dead centre, as specified.
  { cell: [0, 4], file: 'card12_phones_travel.png' },
  { cell: [1, 4], file: 'card05_orbit_shift_podcast.png' },
  { cell: [2, 4], file: 'card10_freshsprint_hackathon.png' },
  { cell: [3, 4], file: 'card20_man_thinking.png' },
  { cell: [4, 4], file: 'card22_freshstart_logo.png' },
];

/**
 * The back face's pool — one photo per cell, in the same reading order as
 * `CELLS` above, so cell *i*'s travel photo is `TRAVEL_FILES[i]`.
 *
 * 21 real photos against 22 cells: the last one repeats the first rather than
 * falling back to a Design image, so every back face is a genuine travel
 * photo. `travel20_portrait` is a placeholder for the one video in the
 * source set (`20220103_183611.mp4`) — the grid has no video tile yet, so
 * this holds its place until a poster frame or a video tile exists.
 */
/*
 * Index-matched to `CELLS`' reading order, so position here is position on
 * the grid — see the note on `TRAVEL_FILES` above. `travel04_lanka_pano` (3)
 * and `travel05_sikkim_pano` (4) land on `[3,0]`/`[4,0]`, adjacent cells in
 * the top row, which put the two panoramas next to each other. Swapped
 * `travel05` with `travel19_portrait` (18, `[3,4]` — the bottom row, four
 * rows away) so the panos land apart instead.
 */
const TRAVEL_FILES: string[] = [
  'travel01_lakeshore_snow.jpg',
  'travel02_night_wide.jpg',
  'travel03_landscape.jpg',
  'travel04_lanka_pano.jpg',
  'travel19_portrait.jpg',
  'travel06_landscape.jpg',
  'travel07_landscape.jpg',
  'travel08_landscape.jpg',
  'travel09_landscape.jpg',
  'travel10_landscape.jpg',
  'travel11_landscape.jpg',
  'travel12_portrait.jpg',
  'travel13_pano.jpg',
  'travel14_portrait.jpg',
  'travel15_portrait.jpg',
  'travel16_portrait.jpg',
  'travel17_portrait.jpg',
  'travel18_portrait.jpg',
  'travel05_sikkim_pano.jpg',
  'travel20_portrait.jpg',
  'travel21_portrait.jpg',
  // Repeats travel01 — 21 photos for 22 cells.
  'travel01_lakeshore_snow.jpg',
];

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
  /** False while this tile is faded out. Drives both faces at once. */
  visible: boolean;
  /**
   * The front image's own backing colour, for a source whose content doesn't
   * reach its own edges — a phone mockup centred in a wider canvas, say.
   * `object-cover` would crop that content itself in most tile shapes, so a
   * front face with this set is contained instead and this fills the margin
   * that leaves, matching the artwork's own background rather than showing
   * whatever's behind the tile through a mismatched letterbox. Omitted for
   * every other tile, which stay `object-cover` as before.
   */
  frontBg?: string;
}

/**
 * Opacity at the bottom of the fade — fully out, so the tile clears its cell
 * and comes back rather than only dimming.
 */
export const FADE_FLOOR = 0;
/** One leg of the fade, in seconds. */
export const FADE_S = 2;
/**
 * How long a faded-out tile stays gone before fading back, in ms.
 *
 * This has to outlast one leg of the fade (`FADE_S`) or the tile turns around
 * before it ever reaches full transparency — which is what made an earlier,
 * faster version bottom out halfway and read as a flicker.
 */
const HIDDEN_MS: [number, number] = [2200, 3200];
/** The pause after a tile has returned before that lane picks another, in ms. */
const BETWEEN_MS: [number, number] = [800, 2000];
/**
 * How many tiles are animating at once.
 *
 * Eight of twenty-two, so the field still has real movement in it while more
 * of the grid stays steady — a calmer field than half the tiles turning over
 * at once. Each runs in its own lane — an independent fade-out/fade-in loop —
 * and the lanes never collide on the same cell.
 */
const CONCURRENT = 8;

const randBetween = ([lo, hi]: [number, number]) => lo + Math.random() * (hi - lo);

const SLOTS: HomeGridSlot[] = CELLS.map(({ cell, file, bg }, i) => ({
  key: `cell-${cell[0]}-${cell[1]}`,
  src: `/images/homegrid/Design/${file}`,
  // The travel photo for the same cell — index-matched to CELLS, not offset,
  // since these are two distinct pools rather than one pool split in half.
  backSrc: `/images/homegrid/Travel/${TRAVEL_FILES[i]}`,
  anchor: { top: ROW[cell[1]], left: COL[cell[0]], width: CELL_W, col: cell[0] },
  visible: true,
  frontBg: bg,
}));

/**
 * The tiles behind the hero card.
 *
 * Every cell is filled from the start and every image keeps its cell — the
 * layout above is the composition, not a starting point it drifts away from.
 * All 22 pictures are on screen throughout.
 *
 * The life in the grid comes from five tiles at a time, each in its own lane:
 * a tile fades out, pauses, and fades back, and only once it has returned does
 * that lane choose another. No lane repeats its own last cell, and no two lanes
 * hold the same one. Seventeen of the twenty-two are therefore steady at any
 * moment, so the checkerboard still reads as a complete field. That is also why
 * the flip needs no special handling: fading a tile takes both its faces with
 * it.
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

    /** One lane's endless cycle: choose, fade out, pause, fade back, repeat. */
    const step = (lane: number) => {
      const index = pick(lane);
      busy.add(index);
      lastOfLane[lane] = index;

      setVisible(index, false);
      after(lane, randBetween(HIDDEN_MS), () => {
        setVisible(index, true);
        // Hold the cell until it has finished fading back in, so the lane
        // cannot reclaim it — or hand it to another lane — mid-return.
        after(lane, FADE_S * 1000 + randBetween(BETWEEN_MS), () => {
          busy.delete(index);
          step(lane);
        });
      });
    };

    // Stagger the lanes' first picks so they do not all fade together and
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
