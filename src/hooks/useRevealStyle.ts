import { useTransform, type MotionValue } from 'motion/react';

export interface RevealOptions {
  /** Progress value where this element starts revealing. */
  start: number;
  /** Progress value where it's fully revealed. */
  end: number;
  /** Pixels the element rises as it reveals. */
  shift?: number;
  /** Blur radius in pixels at the start of the reveal. 0 disables blur. */
  blur?: number;
  /** Opacity before the reveal begins. */
  from?: number;
}

/**
 * Maps a section's scroll progress onto the site's shared reveal treatment:
 * fade up from `from` → 1, rise by `shift`px, and optionally unblur.
 *
 * Returns motion style props, so the element animates off the React render
 * path — no re-render per scroll frame.
 */
export function useRevealStyle(
  progress: MotionValue<number>,
  { start, end, shift = 24, blur = 0, from = 0 }: RevealOptions,
) {
  const range: [number, number] = [start, end];

  const opacity = useTransform(progress, range, [from, 1], { clamp: true });
  const y = useTransform(progress, range, [shift, 0], { clamp: true });
  const filter = useTransform(progress, range, [`blur(${blur}px)`, 'blur(0px)'], { clamp: true });

  return blur > 0 ? { opacity, y, filter } : { opacity, y };
}
