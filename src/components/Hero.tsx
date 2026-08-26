import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useExitStyle } from '../hooks/useExitStyle';
import { useHeroProgress } from '../hooks/useHeroProgress';
import { CELL_H, flipDelayFor, useHomeGrid } from '../hooks/useHomeGrid';

interface HeroProps {
  flipOnHover: boolean;
}

/**
 * The two faces differ only in accent colour and copy. Each quote is split so
 * the accent lands on the opening phrase and the remainder stays light, the
 * way the design has it.
 */
interface HeroCardContent {
  accent: string;
  /** Opening phrase (accented) and remainder, for each of the three quotes. */
  quote: [string, string];
  status: [string, string];
  trait: [string, string];
  /** The stat block: a figure and its label. */
  statValue: string;
  statLabel: string;
  /** The pill under the name. */
  role: string;
}

/** How long a half-turn takes. Shared by the card, the tiles and the image swap. */
const FLIP_MS = 850;
const FLIP_EASE = [0.7, 0, 0.2, 1] as const;

const HERO_DESIGN: HeroCardContent = {
  accent: '#FF9A5C',
  quote: ['“Mid-iteration', ' on a new layout”'],
  status: ['"Available', ' for work"'],
  trait: ['"Curious"', ' by default'],
  statValue: '500+',
  statLabel: 'Projects delivered',
  role: 'Visual & UI/UX Designer',
};

const HERO_TRAVEL: HeroCardContent = {
  accent: '#47C89A',
  quote: ['“Mid-flight,', ' mid-thought”'],
  status: ['"Currently', ' abroad"'],
  trait: ['"Window seat', ' to worldview"'],
  statValue: '14',
  statLabel: 'Countries visited',
  role: 'Avid Traveller',
};

/**
 * The hero card, laid out to Figma node 2372:985.
 *
 * Every box sits at its exact Figma coordinate, converted to a percentage of
 * the 768.5 × 700 composition. Type and radii are `cqw` against that same box,
 * so the whole thing scales as one piece rather than drifting apart.
 *
 * The badges overhang the card, so this element is wider than the card itself
 * and carries no background — the panel is drawn as an inner layer.
 *
 * Both sides of the flip render this, so the two faces cannot drift out of
 * sync as the layout changes — only `content` differs.
 */
function HeroCardFace({ content, back = false }: { content: HeroCardContent; back?: boolean }) {
  const { accent } = content;
  return (
    <div
      className="absolute inset-0 isolate [container-type:size] [backface-visibility:hidden]"
      style={{
        zIndex: back ? 1 : 2,
        transform: `rotateY(${back ? 180 : 0}deg) translateZ(1px)`,
      }}
    >
      {/*
        Card body — 450 × 700 at x 735.

        Glass rather than a solid fill: a translucent gradient over a blurred
        backdrop, with inset highlights picking out the top edge and rim the way
        the connect modal's panel does. The checkerboard behind it stays legible
        through the surface.

        `backdrop-filter` creates a stacking context, which flattens an ancestor
        3D context — so it lives here on the body rather than on the rotating
        face, whose `preserve-3d` keeps the flip's backface culling working.
      */}
      <div
        // The travelling ghost measures this, not the face — the face spans the
        // whole composition including the badges and portrait that overhang the
        // card, so an outline drawn around it enclosed far more than the panel.
        // Only the front face is tagged: the back is rotated 180°, so its rect
        // would hand the ghost a mirrored start.
        data-hero-card-body={back ? undefined : ''}
        className="absolute top-0 left-[24.70%] h-full w-[58.56%] overflow-hidden rounded-[3.90cqw] bg-[linear-gradient(160deg,rgba(38,40,46,.62),rgba(19,19,21,.55)_45%,rgba(28,30,35,.60))] shadow-[0_28px_64px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.12),inset_0_0_0_1px_rgba(255,255,255,.055)] backdrop-blur-2xl backdrop-saturate-150"
      >
        <div
          // Tagged so the travelling ghost can pick the accent glow up and
          // carry it: the ghost reads the card body, and this sits on a child
          // layer, so without it the ghost departs in the neutral glass only.
          data-hero-card-glow=""
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 80% at 50% 100%, ${accent}30, ${accent}00 70%)`,
          }}
        />
      </div>

      {/* Disc — 275 × 275. The portrait overlaps it top and bottom. */}
      <div className="absolute top-[27.79%] left-[36.03%] h-[39.28%] w-[35.78%] rounded-full bg-[#171616]" />
      {/*
        Above the badges, so the shoulders overlap them rather than being cut
        off where a badge crosses the portrait.
      */}
      <img
        src="/images/hero/hero-background.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[14.86%] left-[35.84%] z-10 h-[52.14%] w-[36.28%] object-contain select-none"
      />

      {/*
        The quote pill — 387.7 × 103.6.

        The icon and copy are laid out inside the pill rather than positioned
        against the face, so both sit on its vertical centre by construction.
        Placed absolutely they were a third of a percent high, which read as a
        slight lift off the centreline.
      */}
      <div className="absolute top-[11.52%] left-0 flex h-[14.80%] w-[50.45%] items-center gap-[1.32cqw] rounded-[2.60cqw] bg-[#15161A] pl-[3.10cqw] shadow-[0_14px_34px_rgba(0,0,0,.5)]">
        {/*
          Inlined rather than loaded as an `<img>`, for the same reason as the
          status tick: the ring is the accent colour, and an external SVG cannot
          be recoloured from CSS. Only the ring takes the accent — the three
          dots stay the light ink on both sides.
        */}
        <svg
          viewBox="0 0 27 27"
          fill="none"
          aria-hidden="true"
          className="w-[3.51cqw] flex-none"
        >
          <path
            d="M7.75 15.25C8.7165 15.25 9.5 14.4665 9.5 13.5C9.5 12.5335 8.7165 11.75 7.75 11.75C6.7835 11.75 6 12.5335 6 13.5C6 14.4665 6.7835 15.25 7.75 15.25Z"
            fill="#D9EFFC"
          />
          <path
            d="M13.6191 15.25C14.5856 15.25 15.3691 14.4665 15.3691 13.5C15.3691 12.5335 14.5856 11.75 13.6191 11.75C12.6526 11.75 11.8691 12.5335 11.8691 13.5C11.8691 14.4665 12.6526 15.25 13.6191 15.25Z"
            fill="#D9EFFC"
          />
          <path
            d="M19.4902 15.25C20.4567 15.25 21.2402 14.4665 21.2402 13.5C21.2402 12.5335 20.4567 11.75 19.4902 11.75C18.5237 11.75 17.7402 12.5335 17.7402 13.5C17.7402 14.4665 18.5237 15.25 19.4902 15.25Z"
            fill="#D9EFFC"
          />
          <path
            d="M26 13.5C26 6.59644 20.4036 1 13.5 1C6.59644 1 1 6.59644 1 13.5C1 20.4036 6.59644 26 13.5 26C20.4036 26 26 20.4036 26 13.5ZM27 13.5C27 20.9558 20.9558 27 13.5 27C6.04416 27 0 20.9558 0 13.5C0 6.04416 6.04416 0 13.5 0C20.9558 0 27 6.04416 27 13.5Z"
            fill={accent}
          />
        </svg>
        <span className="font-body text-[2.86cqw]/[1] font-semibold whitespace-nowrap text-[#d9effc]">
          <span style={{ color: accent }}>{content.quote[0]}</span>
          {content.quote[1]}
        </span>
      </div>

      {/*
        The status pill — 307.9 × 60.1.

        Copy and tick are laid out inside the pill rather than positioned
        against the face, so the group sits on the pill's centre by
        construction. Placed absolutely, each was pinned to its own hand-tuned
        percentage, and since the two sides' strings differ in length
        ("Available for work" against "Currently abroad") the text and tick
        drifted independently of the pill and of each other.
      */}
      <div className="absolute top-[23.35%] left-[59.93%] flex h-[8.58%] w-[40.07%] items-center justify-center gap-[1.6cqw] rounded-full bg-[#15161A] shadow-[0_14px_34px_rgba(0,0,0,.5)]">
        <span className="font-body text-[2.86cqw]/[1] font-semibold whitespace-nowrap text-[#d9effc]">
          <span style={{ color: accent }}>{content.status[0]}</span>
          {content.status[1]}
        </span>
        {/*
          Inlined rather than loaded as an `<img>`: the asset has its disc
          colour baked in, and an external SVG cannot be recoloured from CSS,
          so the accent has to be set on the path itself.
        */}
        <svg viewBox="0 0 26 26" fill="none" aria-hidden="true" className="w-[3.38cqw] flex-none">
          <path
            d="M13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26Z"
            fill={accent}
          />
          <path
            d="M7.91992 12.9994L11.3099 16.3894L18.09 9.60938"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* The stat block — 185.7 × 217.4 */}
      <div className="absolute top-[36.78%] left-[15.43%] h-[31.05%] w-[24.16%] rounded-[2.60cqw] bg-[#15161A] shadow-[0_14px_34px_rgba(0,0,0,.5)]" />
      <img
        src="/images/hero/projects-delivered.svg"
        alt=""
        aria-hidden="true"
        className="absolute top-[40.72%] left-[18.95%] h-[5.02%] w-[4.06%]"
      />
      <span
        className="absolute top-[48.58%] left-[18.95%] font-body text-[4.16cqw]/[1] font-semibold whitespace-nowrap"
        style={{ color: accent }}
      >
        {content.statValue}
      </span>
      <span className="absolute top-[56.83%] left-[19.05%] w-[13%] font-body text-[2.86cqw]/[1.3] font-semibold text-[#d9effc]">
        {content.statLabel}
      </span>

      {/*
        The trait pill — 218.6 × 104.3.

        The copy sits inside the pill rather than in a separate absolutely
        positioned span: the travel string is longer than the design one and
        wrapped to a third line, which spilled past the pill's bottom edge.
        Laying it out within the box keeps any length contained and centred.

        Shifted right of Figma's 64.62% to 70.32%: the portrait renders above
        the badges and its shoulder reached 72.12%, covering the first 27px of
        this pill's text. This clears it while still ending inside the face.
      */}
      <div className="absolute top-[50.94%] left-[70.32%] box-border flex h-[14.90%] w-[28.45%] items-center rounded-[2.60cqw] bg-[#15161A] px-[2.2cqw] shadow-[0_14px_34px_rgba(0,0,0,.5)]">
        <span className="font-body text-[2.86cqw]/[1.3] font-semibold text-[#d9effc]">
          <span style={{ color: accent }}>{content.trait[0]}</span>
          {content.trait[1]}
        </span>
      </div>

      {/*
        Name — 345.7 wide, and the role pill — 282.2 × 53.4.

        The name is centred on the card rather than pinned to Figma's left edge:
        the design's box is 345.7px for this string, but Sora renders it wider
        than the Figma face did, so a fixed box wrapped it onto the pill.
        Centring keeps the intended position while letting the line stay whole.
      */}
      <span className="absolute top-[75.35%] left-[24.70%] w-[58.56%] text-center font-heading text-[4.6cqw]/[1] font-bold whitespace-nowrap tracking-[-0.02em] text-[#d9effc]">
        Shriram Sivakumar
      </span>
      {/*
        The role text sits inside the pill rather than in its own positioned
        span, so it centres for any string — "Avid Traveller" is much shorter
        than the design's role and sat off to one side otherwise.
      */}
      <div className="absolute top-[83.74%] left-[35.62%] flex h-[7.63%] w-[36.72%] items-center justify-center rounded-[1.30cqw] bg-[#131218]">
        <span className="font-body text-[2.86cqw]/[1] font-semibold text-teal">{content.role}</span>
      </div>
    </div>
  );
}

export function Hero({ flipOnHover }: HeroProps) {
  const [flipped, setFlipped] = useState(false);
  /** Drives the hover lift — kept separate from `flipOnHover`, which is a mode. */
  const [hovered, setHovered] = useState(false);
  /** Signed half-turn count: +1 to show travel, −1 back, so the two sweeps mirror. */
  const [turns, setTurns] = useState(0);
  // Eight of the twelve checkerboard cells are filled at a time. The spare
  // cells are what make the rotation visible: each swap can move an image to a
  // position that was empty, so tiles appear and disappear around the grid
  // rather than only changing picture in place.
  //
  // Each tile carries both pictures at once — its design image on the front
  // face and its travel image on the back — so the flip reveals the other one
  // geometrically. Swapping `src` on a timer instead would need every column to
  // change at its own midpoint: the columns turn at staggered times, so any
  // single moment catches some of them face-on, picture visibly changing.
  const gridSlots = useHomeGrid(8, 2600);

  // The hero → intro ghost leaves the flip card as the hero scrolls away, so
  // the hero's own content clears behind it. The card's outer box keeps its
  // layout — the ghost measures it live to know where it is departing from —
  // and only its painted faces go.
  const heroProgress = useHeroProgress();
  const exit = useExitStyle(heroProgress, { start: 0.12, end: 0.42, shift: 0 });

  // The two directions mirror each other: showing the travel side sweeps one
  // way, returning to the design side sweeps back the other. Stepping the
  // half-turn count down on the way back rather than always up is what makes
  // the return the opposite motion instead of more of the same rotation.
  // `flipped` still tracks *which* face is up for everything else.
  const showTravel = (dir: boolean) => {
    // Already showing that face (hover re-entry, a repeat click) — nothing to
    // turn, and stepping anyway would spin a full extra revolution.
    if (dir === flipped) return;
    setFlipped(dir);
    setTurns((t) => (dir ? t + 1 : t - 1));
  };

  const handleClick = () => showTravel(!flipped);
  const handleEnter = () => {
    setHovered(true);
    if (flipOnHover) showTravel(true);
  };
  const handleLeave = () => {
    setHovered(false);
    if (flipOnHover) showTravel(false);
  };

  return (
    <section
      id="home"
      className="relative flex h-screen w-full items-center justify-center overflow-hidden box-border px-0 py-[clamp(16px,3vh,40px)]"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 max-[900px]:hidden"
        aria-hidden="true"
        style={exit}
      >
        <AnimatePresence>
          {gridSlots.map((slot) => {
            return (
              <motion.div
                key={slot.key}
                // Sharp-cornered cells on the checkerboard: no radius, no
                // border or shadow, so they read as a flat pattern behind the
                // card rather than as a second layer of floating cards.
                className="absolute overflow-hidden"
                style={{
                  top: slot.anchor.top,
                  left: slot.anchor.left,
                  right: slot.anchor.right,
                  width: slot.anchor.width,
                  height: CELL_H,
                }}
                // The cells hold their place in the pattern, so swapping is a
                // slow cross-fade in place rather than a scatter — movement
                // would break the grid the images are meant to form.
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
              >
                {/*
                  The tile turns with the card, so the whole scene flips to the
                  other side rather than the card alone. It carries its own
                  `transformPerspective` for the same reason the card does — the
                  ancestors here are flat and would collapse the depth.

                  Each column starts a beat after the one before, so the turn
                  sweeps across the grid rather than every tile going at once —
                  left to right on the way out, right to left coming back, so
                  the sweep reverses along with the card's own direction.
                */}
                <motion.div
                  className="size-full"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: turns * 180, transformPerspective: 1400 }}
                  transition={{
                    duration: FLIP_MS / 1000,
                    ease: FLIP_EASE,
                    delay: flipDelayFor(slot.anchor.col, !flipped),
                  }}
                >
                  <img
                    src={slot.src}
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-20 backface-hidden"
                  />
                  <img
                    src={slot.backSrc}
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-20 backface-hidden"
                    style={{ transform: 'rotateY(180deg)' }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <div className="relative z-1 flex h-full max-h-full flex-col items-center justify-center gap-[clamp(8px,1.5vh,16px)]">
        {/*
          The composition is 768.5 × 700 including the badges that overhang the
          450px card. Its badges reach further left than right, so the card's
          own centre sits at 53.98% of the face — centring the face would leave
          the card, which is what reads as "the card", about 30px right of the
          page. The translate re-centres on the card instead.
        */}
        <div
          className="relative box-content w-[clamp(288px,41.6vw,608px)] max-w-[calc(100vw-40px)] px-[clamp(16px,3vw,60px)] py-[clamp(10px,2.5vh,26px)]"
          // Expressed against the face's own width rather than as a percentage
          // of this wrapper, which also carries horizontal padding and would
          // shift by the wrong amount.
          style={{ transform: 'translateX(calc(clamp(288px, 41.6vw, 608px) * -0.0398))' }}
        >
          <div
            // No `perspective` here: it would only reach direct 3D children,
            // and the wrappers below are flat. The rotating element carries its
            // own via `transformPerspective` instead.
            className="cursor-pointer"
            // 768.5 × 700 — the full extent of the composition in Figma,
            // including the badges that overhang the 450px card.
            style={{ width: '100%', aspectRatio: '768.5 / 700', maxHeight: '80vh' }}
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label="Flip between design and travel side"
            onClick={handleClick}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
          >
            {/*
              The exit fade lives on this wrapper rather than on the rotating
              element below it. An `opacity` under 1 creates a stacking context,
              which flattens the 3D rendering context and stops
              `backface-visibility` working — so while the card was flipped and
              fading out, the front face showed through the back, mirrored.
              Keeping the two on separate elements leaves the 3D context intact.
            */}
            <motion.div className="relative size-full" style={{ opacity: exit.opacity }}>
            {/*
              The hover lift. It gets its own layer between the exit fade and
              the rotating face: putting the lift on the rotating element would
              compose with its `rotateY` and fight the flip, and a transform
              here is safe where `opacity` and `backdrop-filter` were not — it
              does not create a stacking context, so the 3D context survives.
            */}
            <motion.div
              className="relative size-full"
              // Scale alone, with no `y` shift: a vertical translate reads as
              // the card sliding up rather than growing, and at this size it
              // swamped the scale entirely. Growing from the centre pushes every
              // edge out evenly instead.
              animate={{ scale: hovered ? 1.045 : 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26, mass: 0.7 }}
            >
            <motion.div
              className="relative size-full"
              style={{ transformStyle: 'preserve-3d' }}
              // Driven by the accumulating half-turn count, not by `flipped`.
              // Toggling between 0 and 180 made the return trip retrace the
              // outbound arc backwards; always advancing means the design side
              // turns away one way and the travel side turns away the other.
              //
              // The perspective belongs here, in the transform itself, not as a
              // `perspective` property on an ancestor: that only reaches an
              // element's *direct* 3D children, and the exit-fade and hover-lift
              // wrappers in between are both `transform-style: flat`, so they
              // collapsed the depth before it arrived. Without it the card was
              // rotating orthographically — scaling to zero width and back,
              // which reads as a rectangle folding shut rather than an object
              // turning over.
              animate={{ rotateY: turns * 180, transformPerspective: 1400 }}
              transition={{ duration: FLIP_MS / 1000, ease: FLIP_EASE }}
            >
              {/* Front — design side. */}
              <HeroCardFace content={HERO_DESIGN} />

              {/*
                Back — travel side. The same card, so the two faces cannot
                drift apart as the layout changes; only the copy and accent do.
              */}
              <HeroCardFace content={HERO_TRAVEL} back />
            </motion.div>
            </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
      <motion.span
        className="absolute bottom-[clamp(20px,4vh,44px)] left-1/2 z-1 -translate-x-1/2 font-heading text-[10.5px] font-medium tracking-[0.1em] text-grey"
        style={exit}
      >
        {flipOnHover ? 'HOVER TO FLIP' : 'CLICK THE CARD TO FLIP'}
      </motion.span>
    </section>
  );
}
