import { useScroll, type MotionValue } from 'motion/react';
import { useRef, type RefObject } from 'react';

export interface SectionScroll<T extends HTMLElement> {
  /** Attach to the tall pinned section wrapper. */
  ref: RefObject<T | null>;
  /** 0 → 1 as the section scrolls from first pinned to fully scrolled through. */
  progress: MotionValue<number>;
}

/**
 * Scroll progress through a pinned section, as a MotionValue.
 *
 * These sections are a tall block (e.g. `h-[300vh]`) wrapping a `sticky`
 * child. Progress must run 0 → 1 over exactly the window the child stays
 * pinned: from the section's top reaching the viewport top, until its bottom
 * reaches the viewport bottom.
 *
 * `end end` would reverse partway (it tracks the target's own box, which stops
 * advancing once the sticky child releases), so the range is measured against
 * the section's scroll span directly.
 *
 * Unlike a React-state scroll handler, this drives transforms without
 * re-rendering on every frame.
 */
export function useSectionScroll<T extends HTMLElement = HTMLElement>(): SectionScroll<T> {
  const ref = useRef<T>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end 100vh'],
  });

  return { ref, progress: scrollYProgress };
}
