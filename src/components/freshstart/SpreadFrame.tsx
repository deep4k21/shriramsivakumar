import { useEffect, useRef, useState } from 'react';

/** The design width every spread is drawn at. */
const DESIGN_W = 1168;

/**
 * The floor the scale is held at.
 *
 * Below this the type inside a spread stops being readable, so the frame
 * stops shrinking and scrolls horizontally instead — panning a legible
 * artboard beats fitting an illegible one. This is the handoff's open
 * question for the owner (§7): the alternative is tap-to-zoom on phones.
 */
const MIN_SCALE = 0.6;

interface SpreadFrameProps {
  children: React.ReactNode;
}

/**
 * Scales a fixed-format spread to the width available to it.
 *
 * Spreads are artboards, not responsive layouts: each is composed at
 * 1168 × 657 and every position inside it is set at that size. Reflowing
 * them would be redrawing them, so the whole board is transformed instead
 * and the frame's height follows the scaled height so the page lays out
 * around it correctly.
 */
export function SpreadFrame({ children }: SpreadFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const spreadRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const frame = frameRef.current;
    const spread = spreadRef.current;
    if (!frame || !spread) return;

    const fit = () => {
      // Measured from the parent, not the frame: once the frame scrolls its
      // own `clientWidth` excludes the scrollbar, which would feed a slightly
      // smaller width back into the next measurement.
      const available = frame.parentElement?.clientWidth ?? frame.clientWidth;
      const next = Math.min(1, available / DESIGN_W);
      const held = Math.max(next, MIN_SCALE);
      setScale(held);
      setHeight(spread.offsetHeight * held);
    };

    // `offsetHeight` is read here rather than using the design height, so a
    // spread that runs taller than 657 still gets a frame that fits it.
    const ro = new ResizeObserver(fit);
    // The parent is what the scale is measured from, so it is what has to be
    // watched; the frame's own box follows from the result.
    if (frame.parentElement) ro.observe(frame.parentElement);
    ro.observe(frame);
    fit();
    return () => ro.disconnect();
  }, []);

  const scrolls = scale <= MIN_SCALE;

  return (
    <div
      ref={frameRef}
      /*
        `w-full` with `min-w-0` is load-bearing. The spread inside is a fixed
        1168px, so without an explicit width the frame sizes to its content
        instead of its parent: `clientWidth` then reports 1168 whatever the
        viewport is, the scale computes to 1, and nothing ever shrinks.
      */
      className={`relative w-full min-w-0 rounded-[16px] ${scrolls ? 'overflow-x-auto' : 'overflow-hidden'}`}
      style={{ height }}
    >
      {/*
        A wrapper sized to the *scaled* result, holding a child that is still
        laid out at full design width.

        `transform` paints smaller but does not change the box the element
        occupies, so without this the 1168px spread would keep overflowing the
        frame and leave every one of them horizontally scrollable even when it
        visually fits.
      */}
      <div style={{ width: DESIGN_W * scale, height }}>
        <div
          ref={spreadRef}
          className="w-[1168px] origin-top-left"
          style={{ transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
