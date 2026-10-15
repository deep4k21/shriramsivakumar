import { motion, useMotionValue, useReducedMotion, animate } from 'motion/react';
import { useState } from 'react';
import { HERO_DESIGN, HERO_TRAVEL, HeroCardFace } from '../Hero';
import { MobileGrid } from './MobileGrid';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/** Matches the desktop flip's duration and curve, so the two read as one object. */
const FLIP_MS = 850;
const FLIP_EASE = [0.7, 0, 0.2, 1] as const;

/**
 * How much wider than its column the card composition is laid out, before
 * being scaled back down by the same factor.
 *
 * The card body occupies 58.56% of the composition's width and the four
 * badges overhang the rest, so the whole thing is roughly 1.7× the body. At
 * a phone's width that forces a choice between a body too narrow to read and
 * badges clipped off both edges — laying out wide and scaling down avoids
 * both. 1.3 is where the outermost badge lands just inside the viewport at
 * 360px, the narrowest width this is built for.
 */
const SPREAD = 1.3;

/**
 * The hero, for a phone — the desktop card itself, not a redrawing of it.
 *
 * `HeroCardFace` is laid out entirely in container units (`cqw`) and
 * percentages inside its own `container-type: size`, which means it already
 * scales to whatever box it is given. So the mobile version gives it a
 * phone-shaped box and otherwise leaves the composition alone: the portrait
 * disc, the four overhanging badges, the typing stat block and trait pill all
 * arrive exactly as designed, at phone scale.
 *
 * What changes is only what the device cannot do:
 *
 *   - the desktop card sits in a hover-reactive checkerboard of tiles, which
 *     needs both hover and far more width than a phone has, so the grid is
 *     dropped and the card stands on the page;
 *   - the flip is driven by a tap rather than a hover or a click-plus-hover,
 *     and `hovered` is held false throughout — the badge-lift it drives is a
 *     pointer affordance with no touch equivalent.
 *
 * The card's own aspect is the one real adaptation. Desktop stretches it to
 * `64.8vh` to land on the checkerboard's three-row gap, deliberately taller
 * than the Figma composition. There is no grid to land on here, so it takes
 * the design's own 768.5 × 700 proportion instead, which is what keeps the
 * badges from drifting away from the disc at a narrow width.
 */
export function MobileHero() {
  const [flipped, setFlipped] = useState(false);
  const reduced = useReducedMotion();
  const rotateY = useMotionValue(0);

  const flip = () => {
    const next = !flipped;
    setFlipped(next);
    const to = next ? 180 : 0;
    if (reduced) {
      rotateY.set(to);
      return;
    }
    animate(rotateY, to, { duration: FLIP_MS / 1000, ease: FLIP_EASE });
  };

  return (
    // `overflow-x-clip`: the composition is deliberately wider than its card
    // body — four badges overhang it — so at phone width the outermost reach
    // past the viewport. Clipping contains that without a horizontal
    // scrollbar, which is what the stray 3px of `scrollWidth` was.
    <section className="relative flex min-h-dvh flex-col justify-center gap-6 overflow-x-clip px-4 py-12">
      {/*
        The image field, behind the card.

        Desktop arranges these around the hero with a hole in the middle for
        it; here the card simply sits over the grid, which is the same
        relationship without needing a composition built around a gap. Dimmed
        and non-interactive so it stays a backdrop — at full strength a field
        of photographs directly behind a translucent card makes the card's
        own copy hard to read.
      */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.13]">
        <MobileGrid columns={2} rows={6} />
      </div>
      {/*
        A wash over the field, so the card's own copy has something quiet to
        sit against. Dimming the grid alone was not enough: the tiles are
        photographs with their own bright and dark passages, and the badge
        text landing on a light one lost its contrast wherever that happened.
        A flat scrim levels the whole field instead of relying on every
        picture being dark enough on its own.
      */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-bg/70" />

      {/*
        Holds the height the scaled card actually occupies.

        `scale` is a paint-time transform: the box inside stays laid out at
        its full pre-scale height, so without this the section reserved
        `SPREAD`× more vertical space than the card visibly uses and left a
        gap beneath it. This wrapper's aspect is the composition's own, with
        the width multiplied by `SPREAD` — which is the scaled card's real
        footprint. Deliberately not `overflow-hidden`: the inner box is
        taller than this one before the scale applies, and clipping cut the
        name and role pill off the bottom of the card.
      */}
      <div className="relative z-10" style={{ aspectRatio: `${768.5 * SPREAD} / 700` }}>
      <motion.div
        /*
          Laid out wider than the screen, then scaled down to fit it.

          The composition is about 1.7× the width of its own card body: the
          body is 58.56% of this box and the four badges overhang into the
          rest. So any box narrow enough to keep the badges on screen leaves
          the body too small to read — at 390px it came out a 229px panel,
          with the outer badges still cut off at both edges.

          Laying the box out at `SPREAD`× the column and scaling by its
          inverse resolves both at once: the body gets the width it needs,
          and the scale brings the badges back inside the viewport. Every
          part is positioned as a percentage of this box, so they shrink
          together and the design's proportions are untouched.

          The height is reserved separately below, since `scale` is a paint
          transform and leaves the laid-out box its full unscaled height.
        */
        className="relative origin-top cursor-pointer"
        style={{ width: `${SPREAD * 100}%`, marginLeft: `${((1 - SPREAD) / 2) * 100}%`, aspectRatio: '768.5 / 700', scale: 1 / SPREAD }}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label="Flip between design and travel side"
        onClick={flip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            flip();
          }
        }}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: EASE_OUT }}
      >
        {/*
          The rotating element carries its own perspective, for the same
          reason the desktop card does: `perspective` on an ancestor only
          reaches direct 3D children, and the wrappers between are flat.
        */}
        <motion.div
          className="relative size-full"
          style={{ transformStyle: 'preserve-3d', rotateY, transformPerspective: 1400 }}
        >
          {/*
            `hovered` stays false on both faces: it drives the badge lift and
            the card's shadow, which are pointer affordances. A touch screen
            has no hover state to enter or leave, so wiring it to the tap
            would make the badges jump on the same gesture that flips the
            card.
          */}
          <HeroCardFace content={HERO_DESIGN} hovered={false} />
          <HeroCardFace content={HERO_TRAVEL} back hovered={false} />
        </motion.div>
      </motion.div>
      </div>

      {/*
        The flip is a hover-or-click affordance on desktop, where the card
        visibly lifts under the pointer. Neither cue exists on touch, so the
        instruction is written out — otherwise the second face is simply
        undiscoverable.
      */}
      <motion.div
        className="relative z-10 text-center font-body text-[12px] tracking-[0.1em] text-grey uppercase"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.24, ease: EASE_OUT }}
      >
        Tap the card to flip
      </motion.div>
    </section>
  );
}
