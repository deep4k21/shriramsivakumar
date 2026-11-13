import { FsMark } from './FsMark';

export type FsLockupLayout = 'horizontal' | 'stacked' | 'mark' | 'wordmark';
export type FsLockupTone = 'color' | 'reverse' | 'white';

interface FsLockupProps {
  layout?: FsLockupLayout;
  tone?: FsLockupTone;
  /** The mark's edge length. The wordmark is sized from it. */
  markSize?: number;
  /** Shows the "placeholder · freshstart-lockup.svg" note beneath. */
  showPlaceholderNote?: boolean;
}

/** Wordmark colour per tone. */
const WORDMARK_COLOR: Record<FsLockupTone, string> = {
  color: 'var(--fs-midnight)',
  reverse: 'var(--fs-white)',
  white: 'var(--fs-white)',
};

/**
 * The mark is set in Launch Cyan when reversed so it stays visible on
 * Midnight, and solid white only where the ground is the blue end of the
 * gradient or a dark photograph.
 */
const MARK_TONE: Record<FsLockupTone, FsLockupTone> = {
  color: 'color',
  reverse: 'reverse',
  white: 'white',
};

/**
 * The four approved lockups, across the three tones.
 *
 * The wordmark is **artwork, never live text** — in production it comes from
 * `freshstart-lockup.svg`. It is set in Quicksand here purely as a
 * placeholder, which is why the ratio below is hand-tuned rather than
 * derived: it only has to hold until the SVG replaces it. Delete the text
 * branch, `.fs-wordmark-placeholder` and the Quicksand link together at that
 * point.
 */
export function FsLockup({
  layout = 'horizontal',
  tone = 'color',
  markSize = 56,
  showPlaceholderNote = false,
}: FsLockupProps) {
  const stacked = layout === 'stacked';

  // Quicksand's cap height against the mark's box, matched by eye to the
  // reference. The optical padding keeps the baseline off the mark's edge.
  const wordmarkSize = markSize * 0.9;

  const wordmark = (
    <span
      className="fs-wordmark-placeholder whitespace-nowrap"
      style={{
        fontSize: wordmarkSize,
        lineHeight: 1,
        letterSpacing: '-0.01em',
        color: WORDMARK_COLOR[tone],
        paddingBottom: wordmarkSize * 0.084,
      }}
    >
      freshstart
    </span>
  );

  return (
    <div className="inline-flex flex-col items-center gap-[1.5em]">
      <div
        role="img"
        aria-label="Freshstart logo (placeholder for freshstart-lockup.svg)"
        className={`inline-flex items-center ${stacked ? 'flex-col' : 'flex-row'}`}
        style={{ gap: stacked ? markSize * 0.17 : markSize * 0.22 }}
      >
        {layout !== 'wordmark' && <FsMark size={markSize} tone={MARK_TONE[tone]} />}
        {layout !== 'mark' && wordmark}
      </div>
      {showPlaceholderNote && (
        <span
          className="whitespace-nowrap"
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: tone === 'color' ? 'var(--fs-ink-muted)' : 'rgba(255,255,255,0.72)',
          }}
        >
          placeholder · freshstart-lockup.svg
        </span>
      )}
    </div>
  );
}
