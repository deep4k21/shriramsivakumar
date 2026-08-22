import { useMotionValueEvent, useScroll } from 'motion/react';
import { useState } from 'react';

/**
 * The sidebar rail appears once the visitor scrolls past the hero, i.e. when
 * the intro section's top crosses 45% of the viewport.
 *
 * Reads scroll through a MotionValue and only sets React state on the actual
 * crossing, so scrolling doesn't re-render the tree every frame.
 */
export function useNavVisible(): boolean {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', () => {
    const intro = document.getElementById('intro');
    if (!intro) return;
    const next = intro.getBoundingClientRect().top <= window.innerHeight * 0.45;
    setVisible((prev) => (prev === next ? prev : next));
  });

  return visible;
}
