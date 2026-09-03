import { useEffect, useRef, useState } from 'react';
import type { RowMotion } from '../data/content';

/**
 * A looping motion piece filling a process row's slot.
 *
 * Plays muted, loops, and shows no controls: it is a drawing that moves, not a
 * video anyone is meant to scrub. Nothing here opens a new tab or offers a
 * download, matching the rest of the site.
 *
 * Under `prefers-reduced-motion` it does not play at all — the poster frame is
 * shown instead, which is the same artwork standing still rather than a blank
 * slot. That is the honest substitution for a piece whose subject is movement.
 *
 * The clip only starts once it has scrolled into the modal's view, so opening a
 * project does not begin decoding video the reader has not reached.
 */
export function MotionClip({
  clip,
  height,
  fitHeight,
}: {
  clip: RowMotion;
  height?: string;
  /**
   * The clip's own aspect ratio (width ÷ height). When set, the frame sizes
   * to this ratio at the column's full width instead of stretching to
   * `height` regardless of the clip's own proportions — a landscape clip at a
   * tall fixed height otherwise sits inside a frame with empty space above
   * and below it.
   */
  fitHeight?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Play only while on screen. A row far down the modal would otherwise decode
  // frames the whole time the project is open.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const frame =
    'grid w-full place-items-center overflow-hidden rounded-xl border border-white/7 bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)]';
  const style = fitHeight
    ? { aspectRatio: String(fitHeight) }
    : height
      ? { height, minHeight: height }
      : { minHeight: '160px' };

  // No clip yet (or none at all) — the poster alone, never a `src=""`, which the
  // browser treats as a request for the page itself.
  if (reduced || !clip.src) {
    return (
      <div className={frame} style={style}>
        {clip.poster ? (
          <img src={clip.poster} alt={clip.title} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="font-body text-[10px] tracking-[0.14em] text-grey">{clip.title}</span>
        )}
      </div>
    );
  }

  // A GIF is not a video format — it decodes and loops on its own as a plain
  // `<img>`, so it never reaches the `<video>` element below (which cannot
  // play it), the intersection-gated pause, or the reduced-motion swap: a
  // GIF has no still frame to pause on and no separate poster to fall back
  // to, so it plays continuously the way it would anywhere else on the web.
  if (clip.src.toLowerCase().endsWith('.gif')) {
    return (
      <div className={frame} style={style}>
        <img src={clip.src} alt={clip.title} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }

  return (
    <div className={frame} style={style}>
      <video
        ref={ref}
        src={clip.src}
        poster={clip.poster}
        aria-label={clip.title}
        muted
        loop
        playsInline
        preload="metadata"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}
