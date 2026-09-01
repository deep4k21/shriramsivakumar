import { useEffect, useState } from 'react';

interface BackgroundGridProps {
  visible: boolean;
}

/**
 * Hides this grid while the hero fills the screen.
 *
 * The hero paints its own copy of the ruling — unmasked, so the whole grid
 * shows there rather than a patch at the cursor. This one is `fixed`, so it
 * covers the hero too, and its masked lines land exactly on the hero's and add
 * to them: the ruling brightened around the pointer even though the hero's own
 * layer carries no mask. Measured at +12 on the line peak.
 */
function useHeroOnScreen() {
  const [over, setOver] = useState(true);

  useEffect(() => {
    const hero = document.getElementById('home');
    if (!hero) return;

    // A little slack, so the two grids do not both fade near the boundary and
    // leave a band with no ruling at all.
    const observer = new IntersectionObserver(([entry]) => setOver(entry.intersectionRatio > 0.5), {
      threshold: [0, 0.5, 1],
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return over;
}

export function BackgroundGrid({ visible }: BackgroundGridProps) {
  const behindHero = useHeroOnScreen();

  return (
    <div
      // `z-0`, not `-z-10`: a card's `backdrop-filter` only samples what is
      // painted behind it *within the same stacking context*, so a grid pushed
      // below the root layer is invisible to the glass panels.
      className="bg-grid-mask pointer-events-none fixed inset-0 z-0 bg-[length:88px_88px] bg-[image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] transition-opacity duration-300"
      style={{ opacity: visible && !behindHero ? 1 : 0 }}
      aria-hidden="true"
    />
  );
}
