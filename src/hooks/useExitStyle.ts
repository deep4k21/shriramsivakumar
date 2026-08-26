import { useTransform, type MotionValue } from 'motion/react';

export interface ExitOptions {
  /** Progress value where the content starts fading out. */
  start?: number;
  /** Progress value where it's fully gone. */
  end?: number;
  /** Pixels the content drifts upward as it leaves. */
  shift?: number;
}

/**
 * The counterpart to `useRevealStyle`: fades a pinned section's content back
 * out over the tail of its own scroll window, so the copy clears the screen as
 * the section unpins and the travelling ghost outline leaves for the next one.
 *
 * The window has to close *before* the ghost lifts off (intro progress 1.0,
 * where `STAGE_ONE` in AboutTravelGhosts starts), so the copy is already gone
 * as the outline departs rather than still fading while it travels. It also has
 * to open after that section's own reveals have finished, or the two fight over
 * the same opacity — hence callers pass a window rather than sharing one
 * default that cannot suit every section.
 *
 * The ghost's destination (the intro panel, the about tiles) deliberately does
 * not take this — the outline needs something to hand off to, so the target box
 * stays put while everything around it goes.
 */
export function useExitStyle(
  progress: MotionValue<number>,
  { start = 0.88, end = 0.98, shift = 18 }: ExitOptions = {},
) {
  const range: [number, number] = [start, end];

  const opacity = useTransform(progress, range, [1, 0], { clamp: true });
  const y = useTransform(progress, range, [0, -shift], { clamp: true });

  return { opacity, y };
}
