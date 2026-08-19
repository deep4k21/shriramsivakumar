import { useEffect, useRef } from 'react';

const BOTTOM_THRESHOLD_PX = 24;

/**
 * Fires `onPast` once when the visitor scrolls to the end of the page having
 * passed the #career section (it's the last section, so the page can't
 * scroll further than "career's bottom pinned to the viewport bottom" —
 * we detect that instead of career fully leaving the viewport).
 * Re-arms once they scroll back above career, so scrolling down again later
 * fires again — but doesn't refire on every tick while at the bottom, so
 * closing the modal doesn't immediately reopen it.
 */
export function useScrollPastCareer(onPast: () => void) {
  const armedRef = useRef(true);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let raf: number | null = null;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const el = document.getElementById('career');
        if (!el) return;

        const careerTop = el.getBoundingClientRect().top;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        const atBottom = maxScrollY - window.scrollY <= BOTTOM_THRESHOLD_PX;
        const pastCareer = careerTop < window.innerHeight * 0.3;

        if (atBottom && pastCareer && armedRef.current) {
          armedRef.current = false;
          onPast();
        } else if (!pastCareer) {
          armedRef.current = true;
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [onPast]);
}
