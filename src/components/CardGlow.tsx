import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Two lights that trace a card's border on hover, starting on opposite corners
 * and each drawing half the outline before fading out on the corner the other
 * came from. Runs once per hover, not on a loop.
 *
 * Drop this inside any element carrying the shared `CARD` style — it fills the
 * parent and traces the real edge, corner radius included.
 *
 * How it works: a rounded `<rect>` inset by half the stroke width follows
 * exactly the same path as the CSS border. A dash pattern paints one short lit
 * segment with the rest of the perimeter left as a gap, and animating
 * `strokeDashoffset` walks that segment along it. Two such rects run half a
 * perimeter apart, so each covers one half of the outline.
 *
 * This is measured in *path length*, not angle, which is the point: a conic
 * gradient sweeps at a constant angular rate, so on a wide card the light races
 * along the long edges and stalls at the corners. Travelling the perimeter
 * keeps the pace even around the whole edge whatever the aspect ratio.
 *
 * The run takes a fixed `duration` rather than a fixed speed: as a one-shot
 * hover cue it should feel the same on every card, and a constant speed would
 * make a large panel take twice as long as a small tile.
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

  // Each segment travels half the perimeter, and they start half a perimeter
  // apart — so together they cover the whole outline in one pass.
  const halfPerimeter = length / 2;

  /*
   * A rounded rect's path begins at (x + rx, y) — a point along the *top edge*,
   * with the top-left corner arc coming last in path order. Starting the run
   * there makes the lights part from a spot on the top rather than from the
   * corner, so both are shifted back by the length of that arc.
   *
   * A quarter of a circle of radius `rx`, which is where the corner actually
   * sits relative to the path's own origin.
   */
  const cornerArc = (Math.PI * radius) / 2;

  const shared = {
    x: half,
    y: half,
    width: `calc(100% - ${width}px)`,
    height: `calc(100% - ${width}px)`,
    rx: radius,
    ry: radius,
    fill: 'none',
    stroke: color,
    strokeWidth: width,
    strokeLinecap: 'round' as const,
    // A soft bloom so the segment reads as light on the edge rather than a
    // plain coloured dash.
    style: { filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 9px ${color})` },
    // One lit segment, then a gap the length of the rest of the perimeter.
    strokeDasharray: length ? `${segment} ${Math.max(length - segment, 0)}` : undefined,
  };

  // Fades out over the last stretch, so the pair dissolves as it converges
  // rather than parking lit on the far corner.
  const timing = {
    strokeDashoffset: { duration, ease: 'linear' as const },
    opacity: { duration, times: [0, 0.08, 0.78, 1], ease: 'linear' as const },
  };

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
      preserveAspectRatio="none"
    >
      {/*
        Two segments start on opposite corners — top-left and bottom-right — and
        each travels half the perimeter to where the other began, so the two
        halves of the outline are drawn at once and each light fades out on the
        corner it was heading for.

        Both run the same way round the path; they are simply offset from each
        other by half the perimeter. Remounting on each hover restarts them, so
        a second hover replays the run rather than resuming where it stopped.
      */}
      <motion.rect
        key={hovered ? 'from-tl' : 'from-tl-idle'}
        ref={ref}
        {...shared}
        initial={{ strokeDashoffset: cornerArc, opacity: 0 }}
        animate={
          hovered && length
            ? { strokeDashoffset: cornerArc - halfPerimeter, opacity: [0, 1, 1, 0] }
            : { strokeDashoffset: cornerArc, opacity: 0 }
        }
        transition={hovered && length ? timing : { duration: 0.2 }}
      />
      <motion.rect
        key={hovered ? 'from-br' : 'from-br-idle'}
        {...shared}
        // Half a perimeter behind the first, which puts it on the opposite
        // corner; it ends where the first one started.
        initial={{ strokeDashoffset: cornerArc + halfPerimeter, opacity: 0 }}
        animate={
          hovered && length
            ? { strokeDashoffset: cornerArc, opacity: [0, 1, 1, 0] }
            : { strokeDashoffset: cornerArc + halfPerimeter, opacity: 0 }
        }
        transition={hovered && length ? timing : { duration: 0.2 }}
      />
    </svg>
  );
}
