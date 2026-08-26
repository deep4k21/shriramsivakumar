import { useEffect, useState } from 'react';

/**
 * An element's width ÷ height, kept current as the viewport changes.
 *
 * The portfolio stage is wider than it is tall, so a share of its height and
 * the same share of its width are different numbers of pixels. Anything that
 * has to be square against the stage — the mosaic's centre hole, the collapsed
 * mark that lands in it — needs the ratio to convert between the two.
 *
 * Returns 0 until measured, so callers can fall back rather than divide by it.
 */
export function useStageAspect(selector: string) {
  const [aspect, setAspect] = useState(0);

  useEffect(() => {
    const el = document.querySelector(selector);
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.height > 0) setAspect(r.width / r.height);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [selector]);

  return aspect;
}
