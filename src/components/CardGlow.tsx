import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * A light that travels once around a card's border on hover.
 *
 * Drop this inside any element carrying the shared `CARD` style — it fills the
 * parent and traces the real edge, corner radius included.
 *
 * How it works: a rounded `<rect>` inset by half the stroke width follows
 * exactly the same path as the CSS border. A dash pattern paints one short lit
 * segment with the rest of the perimeter left as a gap, and animating
 * `strokeDashoffset` by the full path length walks that segment once around.
 *
 * This is measured in *path length*, not angle, which is the point: a conic
 * gradient sweeps at a constant angular rate, so on a wide card the light races
 * along the long edges and stalls at the corners. Travelling the perimeter
 * keeps the pace even around the whole edge whatever the aspect ratio.
 *
 * The lap takes a fixed `duration` rather than running at a fixed speed: as a
 * one-shot hover cue it should feel the same on every card, and a constant
 * speed would make a large panel's lap take twice as long as a small tile's.
 */
export function CardGlow({
  /** Matches the parent's radius so the light follows its corners. */
  radius = 10,
  /** Stroke thickness, matching the card's 1px border. */
  width = 1,
  /** Share of the perimeter the lit segment covers. */
  segmentRatio = 0.12,
  /** Seconds for the single lap, held constant whatever the card's size. */
  duration = 2.2,
  color = '#00B8C9',
}: {
  radius?: number;
  width?: number;
  segmentRatio?: number;
  duration?: number;
  color?: string;
}) {
  const ref = useRef<SVGRectElement>(null);
  const [length, setLength] = useState(0);
  // Tracked in state rather than left to `group-hover` in CSS: the lap runs
  // once per hover, so the animation needs a start event to replay from, not
  // just a style that is on or off.
  const [hovered, setHovered] = useState(false);

  // The dash pattern is expressed in path length, so the rect has to be
  // measured before the animation can be described. Re-measure whenever the
  // card resizes — the perimeter changes with it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setLength(el.getTotalLength());
    measure();

    const observer = new ResizeObserver(measure);
    const card = el.ownerSVGElement?.parentElement;
    if (card) observer.observe(card);
    return () => observer.disconnect();
  }, []);

  // Hover is read from the card itself so the light still responds to the whole
  // card, the way `group-hover` did — the SVG is `pointer-events-none`.
  useEffect(() => {
    const card = ref.current?.ownerSVGElement?.parentElement;
    if (!card) return;

    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    return () => {
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointerleave', leave);
    };
  }, []);

  const half = width / 2;
  // The segment is a share of the perimeter rather than a fixed pixel length,
  // so it stays in proportion on a small tile and a large panel alike.
  const segment = length * segmentRatio;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
      preserveAspectRatio="none"
    >
      <motion.rect
        // Remounting on each hover restarts the lap from the top, so a second
        // hover replays it rather than resuming wherever the last one stopped.
        key={hovered ? 'run' : 'idle'}
        ref={ref}
        x={half}
        y={half}
        width={`calc(100% - ${width}px)`}
        height={`calc(100% - ${width}px)`}
        rx={radius}
        ry={radius}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        // A soft bloom so the segment reads as light on the edge rather than a
        // plain coloured dash.
        style={{ filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 9px ${color})` }}
        // One lit segment, then a gap the length of the rest of the perimeter.
        strokeDasharray={length ? `${segment} ${Math.max(length - segment, 0)}` : undefined}
        initial={{ strokeDashoffset: 0, opacity: 0 }}
        animate={
          hovered && length
            ? {
                strokeDashoffset: -length,
                // Fades out over the last stretch so the segment does not
                // simply vanish when it completes the lap.
                opacity: [0, 1, 1, 0],
              }
            : { strokeDashoffset: 0, opacity: 0 }
        }
        transition={
          hovered && length
            ? {
                strokeDashoffset: { duration, ease: 'linear' },
                opacity: { duration, times: [0, 0.08, 0.82, 1], ease: 'linear' },
              }
            : { duration: 0.2 }
        }
      />
    </svg>
  );
}
