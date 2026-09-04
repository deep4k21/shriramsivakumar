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

/*
  Sized to clear the frame's own lower-margin height at any panel size —
  `LOWER_MARGIN.height` is 18.92% of the frame, so the box has to stay well
  under that or it collides with the drawing above and below it.
*/
const SLIDE_BUTTON =
  'grid size-[clamp(26px,5.6cqw,42px)] flex-none cursor-pointer place-items-center rounded-[6px] border ' +
  'font-heading text-[clamp(13px,2.3cqw,18px)] font-semibold transition-colors';

/*
  No border or fill of its own — just the chevron, so the arrows read as a
  gesture rather than another boxed control competing with the numbers next
  to them. The hit target is still the full square; only the paint is gone.
*/
const ARROW_BUTTON = 'grid size-[clamp(26px,5.6cqw,42px)] flex-none cursor-pointer place-items-center text-white/70 transition-colors hover:text-white';

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
      className="size-[72%]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
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
  video,
  onSelect,
  tilt = FRAME_TILT_DEG,
}: {
  /**
   * Shown with the counter on the frame's top bar. Omitted entirely — no
   * label, no counter, no slide picker — for a single still image standing
   * alone rather than one slide in a set (Career's certificate frames).
   */
  caption?: string;
  index: number;
  total: number;
  /** The photograph. Falls back to the frame's own empty opening when absent. */
  image?: string;
  /**
   * A looping clip shown in the opening instead of `image`. `image` still
   * renders underneath as the clip's poster, exactly as a plain photo slide
   * would, so there is never a gap between the frame appearing and the video
   * starting.
   */
  video?: string;
  /**
   * Jump straight to slide `i` (0-based). The numbered picker is hidden
   * entirely when omitted, the same as the arrows it replaced.
   */
  onSelect?: (i: number) => void;
  /**
   * The hang angle in degrees, sign and all — negative tilts left, positive
   * tilts right. Defaults to the Intro carousel's fixed angle, since that is
   * also what `CardTravelGhost` matches on the hero→intro handoff; a wall of
   * several frames (Career's certificates) overrides it per frame instead, so
   * they don't all lean the same way.
   */
  tilt?: number;
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
      // `container-type:size` makes this the reference box for the `cqw`
      // units the slide-picker boxes below are sized in, so they scale with
      // the frame itself rather than the viewport.
      className="relative aspect-[438.5/442.4] h-full max-h-full w-auto max-w-full @container-size"
      style={{ transform: `rotate(${tilt}deg)`, transformOrigin: 'top center' }}
    >
      {/*
        The photo sits under the drawing, so the frame's paper edge and the
        tape at the corners overlap it the way they would in life.
      */}
      {video ? (
        // Looped, muted and controls-free — a moving photo, not a video
        // anyone is meant to scrub. `image` doubles as the poster, so the
        // opening shows the same frame a plain photo slide would until
        // playback starts.
        <video
          key={video}
          src={video}
          poster={image}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          aria-hidden="true"
          className="absolute object-cover select-none"
          style={PHOTO}
        />
      ) : (
        image && (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute object-cover select-none"
            style={PHOTO}
          />
        )
      )}

      <img
        src="/images/doodles/photo frame.svg"
        alt=""
        aria-hidden="true"
        className="relative block size-full select-none"
      />

      {/*
        Label left, counter right, along the frame's top bar. Light type: the
        drawing is dark card, not the white paper a polaroid usually has —
        dark ink on it disappears entirely.

        Omitted with `caption` — a lone still (Career's certificates) has no
        set to count through, so the bar would show only a stray "1 / 1".
      */}
      {caption && (
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
      )}

      {/*
        Prev arrow, one numbered box per slide, next arrow — all one row,
        centred in the frame's lower margin, the white strip a polaroid
        would carry.

        Left/right inset matches `BAR_INSET`, the same clearance the counter
        keeps from the tape overhanging the top-right corner — the frame's
        tilt lifts that corner exactly the same way, so a smaller inset here
        let the row run past the drawing's own edge.
      */}
      {onSelect && (
        <div
          className="absolute flex items-center justify-center gap-[1.6cqw]"
          style={{ left: BAR_INSET.left, right: BAR_INSET.right, top: LOWER_MARGIN.top, height: LOWER_MARGIN.height }}
        >
          <button
            type="button"
            onClick={() => onSelect((index - 2 + total) % total)}
            aria-label="Previous slide"
            className={ARROW_BUTTON}
          >
            <Chevron dir="left" />
          </button>

          {Array.from({ length: total }, (_, i) => {
            const on = i === index - 1;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={on || undefined}
                className={`${SLIDE_BUTTON} ${
                  on ? 'border-white bg-white text-bg' : 'border-white/50 text-white/70 hover:border-white'
                }`}
              >
                {i + 1}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => onSelect(index % total)}
            aria-label="Next slide"
            className={ARROW_BUTTON}
          >
            <Chevron dir="right" />
          </button>
        </div>
      )}
    </div>
  );
}
