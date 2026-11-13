/**
 * The Freshstart mark — a labelled placeholder.
 *
 * The real artwork ships as `freshstart-mark.svg` and does not exist yet, so
 * this draws the drop silhouette the mark is built on and says so. It is
 * deliberately not a drawing of the finished mark: a stand-in good enough to
 * mistake for the real thing is how an unapproved logo reaches production.
 *
 * When the SVG arrives, replace the body of this component and realign the
 * construction overlay in spread 06 and the x-unit guides in spread 07 — both
 * are measured against the real outline.
 */

type FsMarkTone = 'color' | 'reverse' | 'white';

interface FsMarkProps {
  size: number;
  tone?: FsMarkTone;
  /**
   * Prints the awaited filename inside the shape. Used where the mark is
   * shown large enough to carry it and the spread is about the artwork
   * itself, rather than using the mark incidentally.
   */
  showFilename?: boolean;
}

const TONE_BACKGROUND: Record<FsMarkTone, string> = {
  /** The brand gradient, for light grounds. */
  color: 'var(--fs-gradient)',
  /** Flat Launch Cyan, for Midnight and photographic grounds. */
  reverse: 'var(--fs-launch-cyan)',
  /** Solid white, for the blue end of the gradient and dark photography. */
  white: 'var(--fs-white)',
};

export function FsMark({ size, tone = 'color', showFilename }: FsMarkProps) {
  return (
    <div
      role="img"
      aria-label="Freshstart mark (placeholder for freshstart-mark.svg)"
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        flex: 'none',
        // The drop: a circle closed by a tighter radius at the launch corner,
        // as spread 06 documents.
        borderRadius: '50% 18% 50% 50%',
        background: TONE_BACKGROUND[tone],
        color: 'rgba(255,255,255,0.92)',
      }}
    >
      {showFilename && (
        <span
          className="whitespace-nowrap"
          style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.02em' }}
        >
          freshstart-mark.svg
        </span>
      )}
    </div>
  );
}
