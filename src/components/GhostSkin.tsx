import { motion, useTransform, type MotionValue } from 'motion/react';

/**
 * The look a travelling ghost wears at one end of its flight, copied from the
 * element it is standing in for.
 */
export interface Skin {
  background: string;
  borderColor: string;
  borderWidth: string;
  backdropFilter: string;
  boxShadow: string;
}

/**
 * How much of the original's surface a ghost shows.
 *
 * A ghost overlaps the very element it is imitating for much of its flight —
 * the source is still on screen as it departs, the destination already there as
 * it lands. At full strength it hides them, which reads as a solid panel
 * sliding across the page rather than an outline travelling between two places.
 */
const SKIN_ALPHA = 0.22;

/**
 * Fades a colour toward transparent, so the ghost stays see-through.
 *
 * Tailwind's opacity utilities compute to `oklab(… / alpha)` rather than
 * `rgba()`, so both notations are handled — an unrecognised one is wrapped in
 * `color-mix` instead, which any modern engine can fade without the value
 * having to be parsed here.
 */
function soften(color: string, alpha = SKIN_ALPHA): string {
  if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return color;

  const rgb = color.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[,/]/).map((s) => Number.parseFloat(s.trim()));
    const [r, g, b, a = 1] = parts;
    if (![r, g, b].some(Number.isNaN)) {
      return `rgba(${r}, ${g}, ${b}, ${(a * alpha).toFixed(3)})`;
    }
  }

  return `color-mix(in srgb, ${color} ${(alpha * 100).toFixed(1)}%, transparent)`;
}

/**
 * Reads the look of a live element, softened for use on a ghost.
 *
 * Returns `null` for anything not on screen, so a caller can fall back to the
 * plain outline rather than rendering an empty skin.
 */
export function readSkin(
  el: Element | null | undefined,
  /**
   * An inner layer whose fill belongs to the same surface — an accent glow, say,
   * painted over the panel rather than by it. Its gradient is stacked above the
   * element's own, so the ghost carries the colour the eye actually reads.
   */
  overlay?: Element | null,
): Skin | null {
  if (!el) return null;
  const c = getComputedStyle(el);
  // A gradient fill lives in `background-image`; a flat one in `background-color`.
  // Gradients already carry their own alpha, so they are dimmed by the layer's
  // opacity rather than rewritten here.
  const hasGradient = c.backgroundImage && c.backgroundImage !== 'none';
  const own = hasGradient ? c.backgroundImage : soften(c.backgroundColor);

  const overlayFill = overlay ? getComputedStyle(overlay).backgroundImage : 'none';
  // CSS paints the first layer on top, so the overlay leads.
  const background =
    overlayFill && overlayFill !== 'none' && hasGradient ? `${overlayFill}, ${own}` : own;
  // An endpoint with no fill of its own (a bare, transparent box) would leave
  // the ghost invisible at that end of the flight, so its rim is brought up to
  // carry the shape on its own.
  const bare = !hasGradient && (background === 'transparent' || background === 'rgba(0, 0, 0, 0)');
  return {
    background,
    borderColor: soften(c.borderTopColor, bare ? 1 : 0.55),
    borderWidth: Number.parseFloat(c.borderTopWidth) > 0 ? c.borderTopWidth : '1px',
    // The source's blur is usually far too strong for a pane this size — it
    // would smear the whole page behind the ghost. A hint of it is enough to
    // read as glass.
    backdropFilter: c.backdropFilter !== 'none' ? 'blur(2px)' : 'none',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), inset 0 0 0 1px rgba(255,255,255,.05)',
  };
}

/**
 * The two skins a ghost wears, crossfading during the middle of its flight.
 *
 * The ghost leaves looking like its origin, changes over in open space where
 * neither endpoint is nearby, and arrives already looking like its destination
 * — so it never visibly sheds a costume on top of the thing it is matching.
 *
 * `t` is the flight's own 0–1 progress, not the page's scroll progress.
 */
export function GhostSkin({
  t,
  from,
  to,
  borderRadius,
}: {
  t: MotionValue<number>;
  from: Skin | null;
  to: Skin | null;
  borderRadius: MotionValue<number>;
}) {
  const fromOpacity = useTransform(t, [0, 0.34, 0.6], [1, 1, 0], { clamp: true });
  const toOpacity = useTransform(t, [0.34, 0.6, 1], [0, 1, 1], { clamp: true });

  // Without a reading for either end there is nothing to imitate; the caller's
  // own outline is left to show through on its own.
  if (!from && !to) return null;

  return (
    <>
      {from && (
        <motion.div
          className="absolute inset-0"
          style={{
            borderRadius,
            opacity: fromOpacity,
            background: from.background,
            borderStyle: 'solid',
            borderWidth: from.borderWidth,
            borderColor: from.borderColor,
            backdropFilter: from.backdropFilter,
            WebkitBackdropFilter: from.backdropFilter,
            boxShadow: from.boxShadow,
          }}
        />
      )}
      {to && (
        <motion.div
          className="absolute inset-0"
          style={{
            borderRadius,
            opacity: toOpacity,
            background: to.background,
            borderStyle: 'solid',
            borderWidth: to.borderWidth,
            borderColor: to.borderColor,
            backdropFilter: to.backdropFilter,
            WebkitBackdropFilter: to.backdropFilter,
            boxShadow: to.boxShadow,
          }}
        />
      )}
    </>
  );
}
