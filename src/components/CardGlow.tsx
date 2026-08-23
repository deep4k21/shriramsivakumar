import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * A light that travels around a card's border on hover.
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
 * keeps its speed uniform whatever the card's aspect ratio.
 */
export function CardGlow({
  /** Matches the parent's radius so the light follows its corners. */
  radius = 10,
  /** Stroke thickness, matching the card's 1px border. */
  width = 1,
  /** Pixels the lit segment covers, so its length reads the same on any card. */
  segment = 140,
  /** Pixels per second, so the speed is the same on any card. */
  speed = 320,
  color = '#00B8C9',
}: {
  radius?: number;
  width?: number;
  segment?: number;
  speed?: number;
  color?: string;
}) {
  const ref = useRef<SVGRectElement>(null);
  const [length, setLength] = useState(0);

  // The dash pattern is expressed in path length, so the rect has to be
  // measured before the animation can be described. Re-measure whenever the
  // card resizes — the perimeter changes with it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setLength(el.getTotalLength());
    measure();

    const observer = new ResizeObserver(measure);
    if (el.ownerSVGElement?.parentElement) observer.observe(el.ownerSVGElement.parentElement);
    return () => observer.disconnect();
  }, []);

  const half = width / 2;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      // `non-scaling-stroke` below keeps the line crisp; this keeps the
      // geometry in real pixels so `segment` and `speed` mean what they say.
      preserveAspectRatio="none"
    >
      <motion.rect
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
        animate={length ? { strokeDashoffset: [0, -length] } : undefined}
        transition={{ duration: length / speed, ease: 'linear', repeat: Infinity }}
      />
    </svg>
  );
}
