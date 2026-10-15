import { SLOTS } from '../../hooks/useHomeGrid';

/**
 * The 22 image pairs the home grid is built from, stripped of the desktop
 * layout that positions them.
 *
 * Taken from `SLOTS` rather than re-listed here, so the two grids can never
 * drift apart: the desktop field and the mobile one show the same work and
 * the same travel photos, paired the same way. What is dropped is the part
 * that only means something in a 5×5 absolute composition — `anchor` (which
 * cell, which column, how wide) and `visible` (whose fade the desktop hook
 * drives). The mobile grid lays itself out and runs its own swap.
 */
export const GRID_IMAGES = SLOTS.map(({ src, backSrc, frontBg }) => ({
  src,
  backSrc,
  bg: frontBg,
}));
