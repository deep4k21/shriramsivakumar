import { AnimatePresence, motion } from 'motion/react';

interface FlightPath {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

/*
  The trail, drawn as one continuous path rather than loaded from
  `download arrow.svg`.

  The artwork is some 8,700 separate dashes, not a line, so there was nothing to
  stroke along: revealing it meant sweeping a mask across the image, and a
  straight mask edge cannot follow a curve that doubles back. Measured, the wipe
  crossed the loop's right and left sides almost together — the loop arrived in
  two places at once instead of tracing round it. No amount of retiming fixed
  that, because the boundary is a straight line and the path curls.

  Drawn as a path instead, `strokeDashoffset` walks the line's own length, so it
  draws in the order it is travelled. The dash pattern reproduces the original's
  look; the shape follows it closely.

  Authored in a 1000 x 800 space, tail at (0, 768) and head at (990, 0) — the
  two points the flight has to connect.

  The loop's crossing is deliberately open. An earlier version had the two
  branches converging so tightly that their dashes merged into a stubby
  junction, which read as a stray mark sticking out of the line — visible with
  the mask removed entirely, so it was the geometry and not the reveal.
*/
const TRAIL_D =
  'M 0,768 C 150,806 330,782 436,676 C 548,562 546,432 452,398 ' +
  'C 358,364 292,462 366,548 C 452,648 642,664 784,540 ' +
  'C 900,432 958,232 990,0';

/** The authoring box, and where the path's two ends sit inside it. */
const BOX = { w: 1000, h: 800 };
const TAIL = { x: 0, y: 768 };
const HEAD = { x: 990, y: 0 };

/**
 * Length of `TRAIL_D` in the authoring space, measured with `getTotalLength()`.
 *
 * A constant, not measured at runtime: `strokeDasharray` is in user units, so
 * this is the length in the viewBox regardless of how the wrapper scales the
 * box on screen. Measuring the rendered element instead returned a value that
 * moved with the flight's size and left the draw stopping part-way.
 */
const TRAIL_LEN = 2097.8;

/** Seconds for the trail to draw itself from the button to the landing point. */
const DRAW_S = 1.15;
/** Seconds it rests fully drawn before it starts clearing. */
const SETTLE_S = 0.45;
/** Seconds for the trail to clear, tail first, the way it was drawn. */
const ERASE_S = 0.95;
/** Total life on screen. */
const HOLD_S = DRAW_S + SETTLE_S + ERASE_S;

/**
 * A dashed trail that travels from the resume button toward the browser's
 * downloads area on click.
 *
 * A page can't actually draw over real browser chrome — the toolbar, the
 * downloads tray — that's outside the DOM and sandboxed for security. This
 * approximates the idea instead: the trail launches from the button and runs to
 * the top edge, which is where that UI usually lives, then clears rather than
 * claiming to land on it exactly.
 */
export function ResumeFlight({ path }: { path: FlightPath | null }) {
  if (!path) return <AnimatePresence />;

  /*
    Place the path by a similarity transform — uniform scale plus rotation — so
    the loop keeps its shape.

    Solving for a box that pins both ends independently would scale x and y by
    different amounts and squash the loop into an ellipse. Scaling both axes
    together and rotating lands the two ends just as exactly, because a
    similarity transform has precisely the two degrees of freedom needed to map
    one segment onto another.
  */
  const inkX = HEAD.x - TAIL.x;
  const inkY = HEAD.y - TAIL.y;
  const flightX = path.to.x - path.from.x;
  const flightY = path.to.y - path.from.y;

  const scale = Math.hypot(flightX, flightY) / Math.hypot(inkX, inkY);
  const angleDeg = ((Math.atan2(flightY, flightX) - Math.atan2(inkY, inkX)) * 180) / Math.PI;

  const width = BOX.w * scale;
  const height = BOX.h * scale;
  const left = path.from.x - (TAIL.x / BOX.w) * width;
  const top = path.from.y - (TAIL.y / BOX.h) * height;

  return (
    <AnimatePresence>
      <motion.div
        key="resume-flight"
        className="pointer-events-none fixed z-[100]"
        // Turned about the tail — the point pinned to the button — so aiming
        // the trail cannot slide its start off the thing it leaves.
        style={{
          left,
          top,
          width,
          height,
          rotate: `${angleDeg}deg`,
          transformOrigin: `${(TAIL.x / BOX.w) * 100}% ${(TAIL.y / BOX.h) * 100}%`,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <svg
          viewBox={`0 0 ${BOX.w} ${BOX.h}`}
          className="block size-full overflow-visible"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {/*
            Two dash patterns are in play here and they must stay separate: the
            visible dashes come from `strokeDasharray` on the drawn path, while
            the reveal is a mask stroked with a single dash as long as the whole
            line. Putting both on one element would make the reveal chop the
            dashes rather than uncover them.

            The mask's stroke is only a little wider than the trail's. A wide
            one straddles both branches where the loop crosses itself and
            uncovers a dash on the branch the line has not reached yet — a mark
            floating ahead of the drawing. Measured, 40 units showed it plainly
            and 4 removed it; this sits just above the trail's own width, which
            is enough to cover the line without reaching the other side of the
            crossing.
          */}
          <defs>
            <mask id="resume-trail-reveal">
              <motion.path
                d={TRAIL_D}
                stroke="#fff"
                strokeWidth={6 / scale}
                strokeLinecap="butt"
                fill="none"
                strokeDasharray={TRAIL_LEN}
                initial={{ strokeDashoffset: TRAIL_LEN }}
                // Draws to zero, holds, then keeps going negative — which walks
                // the same single dash off the far end, clearing the line from
                // the button onward exactly the way it appeared.
                animate={{ strokeDashoffset: [TRAIL_LEN, 0, 0, -TRAIL_LEN] }}
                transition={{
                  duration: HOLD_S,
                  times: [0, DRAW_S / HOLD_S, (DRAW_S + SETTLE_S) / HOLD_S, 1],
                  ease: 'linear',
                }}
              />
            </mask>
          </defs>

          {/*
            The dash pattern is divided by the scale so it comes out the same
            size on screen at any viewport. Left in user units it grows with the
            flight: on a 1920-wide window the box scales up about 1.45x, which
            rendered the dashes at 22px with a 5px stroke — far heavier than the
            hand-drawn line they stand in for.
          */}
          <path
            d={TRAIL_D}
            stroke="#ffa771"
            // Softened rather than full strength: the trail is a passing cue,
            // so it should read against the dark ground without competing with
            // the heading and the card beside it.
            strokeOpacity={0.62}
            strokeWidth={1.9 / scale}
            strokeLinecap="round"
            // Dashes rather than dots: a mark several times its own width with
            // a gap of similar size, so the line reads as stitched.
            strokeDasharray={`${9 / scale} ${8 / scale}`}
            mask="url(#resume-trail-reveal)"
          />
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}
