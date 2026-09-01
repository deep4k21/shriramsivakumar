/*
  The frame's own geometry, read off `photo frame.svg` and expressed against
  its 438.5 × 442.4 viewBox. Overlaying by percentage rather than by eye keeps
  the photo and the caption locked to the drawing at any size — the artwork
  scales with the panel, and so do they.

    photo opening   x 54.36  y 66.64   332.79 × 292.01
    outer frame     x 35.67  y 28.34   370.16 × 413.56
*/
const PHOTO = { left: '12.40%', top: '15.06%', width: '75.89%', height: '66.01%' };
/*
  The drawing's two horizontal bands, measured off the rendered artwork by
  brightness rather than guessed: the paper is lighter than the photo opening
  between them, so the edges show up as clean steps in a per-row scan.

    top bar        6.25% -> 15.09%   (carries the three window dots)
    lower margin  81.08% -> 100%

  The label and counter ride the top bar, either side of the dots; the arrows
  sit in the lower margin, where a polaroid's white strip would be. Both are
  centred on their band, so they stay put as the frame scales.
*/
const TOP_BAR = { top: '6.25%', height: '8.84%' };
const LOWER_MARGIN = { top: '81.08%', height: '18.92%' };
/*
  Measured the same way as the bands, by scanning the bar's middle rows: the
  three window dots sit at 15.91%–21.14%, and the tape that overhangs the
  top-right corner starts at 85.23%. The label therefore begins clear of the
  dots and the counter ends before the tape — the tape is drawn over the text,
  so anything reaching under it is legible only in patches.

  The right inset allows for the frame's tilt as well: rotating the card lifts
  the bar's right end toward the tape, so the counter needs more clearance than
  the untilted measurement alone suggests.
*/
const BAR_INSET = { left: '24%', right: '19%' };

/**
 * The frame's tilt, in degrees — a taped-up print hanging slightly off square.
 *
 * Exported because the hero→intro ghost lands on this frame: it turns through
 * the same angle on its way in, so the outline arrives already matching the
 * frame it becomes rather than snapping straight to tilted at the handoff.
 */
export const FRAME_TILT_DEG = 2.6;

const ARROW_BUTTON =
  'grid size-9 flex-none cursor-pointer place-items-center rounded-md border border-white ' +
  'bg-transparent text-white transition-colors hover:bg-white/15';

/**
 * The arrow mark, drawn rather than set as a `‹` glyph.
 *
 * The text characters carry asymmetric side bearings and sit above the
 * baseline, so centring their box leaves the visible mark off-centre — measured
 * at roughly half a pixel, in a different direction for each character, which
 * reads as the two buttons being misaligned with each other. A path centred in
 * a square viewBox has no such bearing, so it sits where it is put.
 */
function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[15px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === 'left' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

/**
 * A photo in the hand-drawn frame, captioned the way a polaroid is.
 *
 * The drawing is used as supplied rather than rebuilt: it carries its own
 * paper, tape and shadow, and none of that is worth reproducing in markup.
 * The photo and caption are absolutely positioned over it.
 */
export function PhotoFrame({
  caption,
  index,
  total,
  image,
  onPrev,
  onNext,
}: {
  caption: string;
  index: number;
  total: number;
  /** The photograph. Falls back to the frame's own empty opening when absent. */
  image?: string;
  /** Step to the previous slide. Arrows are hidden when omitted. */
  onPrev?: () => void;
  /** Step to the next slide. */
  onNext?: () => void;
}) {
  return (
    /*
      A slight tilt, as a taped-up print would hang. The whole frame turns
      together — drawing, photo, label and arrows — because they are all
      positioned against this box, so the overlays stay locked to the artwork.

      `origin-top` turns it about the taped edge rather than its middle: the
      tape is what holds it, so that is what it should pivot on.
    */
    <div
      className="relative aspect-[438.5/442.4] h-full max-h-full w-auto max-w-full"
      style={{ transform: `rotate(${FRAME_TILT_DEG}deg)`, transformOrigin: 'top center' }}
    >
      {/*
        The photo sits under the drawing, so the frame's paper edge and the
        tape at the corners overlap it the way they would in life.
      */}
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute object-cover select-none"
          style={PHOTO}
        />
      )}

      <img
        src="/images/doodles/photo frame.svg"
        alt=""
        aria-hidden="true"
        className="relative block size-full select-none"
      />

      {/*
        Label left, counter right, along the frame's top bar beside the window
        dots. Light type: the drawing is dark card, not the white paper a
        polaroid usually has — dark ink on it disappears entirely.
      */}
      <div
        className="absolute flex items-center justify-between gap-3"
        style={{
          left: BAR_INSET.left,
          right: BAR_INSET.right,
          top: TOP_BAR.top,
          height: TOP_BAR.height,
        }}
      >
        <span className="font-heading text-[clamp(9px,1.05vw,13px)] font-semibold tracking-[0.16em] text-teal uppercase">
          {caption}
        </span>
        <span className="font-heading text-[clamp(7px,0.75vw,9.5px)] font-medium tracking-[0.14em] text-[#89919F]">
          {index} / {total}
        </span>
      </div>

      {/* The arrows ride the frame's own lower margin rather than floating below it. */}
      {onPrev && onNext && (
        <div
          className="absolute inset-x-0 flex items-center justify-center gap-2.5"
          style={{ top: LOWER_MARGIN.top, height: LOWER_MARGIN.height }}
        >
          <button type="button" onClick={onPrev} aria-label="Previous slide" className={ARROW_BUTTON}>
            <Chevron dir="left" />
          </button>
          <button type="button" onClick={onNext} aria-label="Next slide" className={ARROW_BUTTON}>
            <Chevron dir="right" />
          </button>
        </div>
      )}
    </div>
  );
}
