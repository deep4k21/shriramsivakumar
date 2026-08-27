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
/**
 * One phrase in the trait pill, pre-split into the lines it occupies — for the
 * same reason as the stat labels, see `HeroStat.label`.
 *
 * `accentChars` counts how many characters from the start take the card's
 * accent colour; the remainder is the light ink. Counting rather than storing
 * the two fragments separately keeps the colour split and the line breaks from
 * drifting out of sync.
 */
interface HeroTrait {
  lines: string[];
  accentChars: number;
}

/** One figure in the stat block, with the icon that sits above it. */
interface HeroStat {
  icon: string;
  value: string;
  /**
   * The label, pre-split into the lines it should occupy.
   *
   * Broken here rather than left to wrap: typing into a box that wraps on its
   * own content reflows as it fills, so a word that fits on line one gets
   * pushed down by the next character and the text visibly jumps. With the
   * lines fixed, each one types within a box whose position never changes.
   */
  label: string[];
}

interface HeroCardContent {
  accent: string;
  /** Opening phrase (accented) and remainder, for each of the three quotes. */
  quote: [string, string];
  status: [string, string];
  /** The trait pill cycles through these, one at a time. */
  traits: HeroTrait[];
  /** The stat block cycles through these, one at a time. */
  stats: HeroStat[];
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
  traits: [
    { lines: ['"Curious"', 'by default'], accentChars: 9 },
    { lines: ['"Wireframe"', 'to workflow'], accentChars: 11 },
    { lines: ['"figma-native"', 'obviously'], accentChars: 14 },
  ],
  stats: [
    { icon: '/images/hero/projects-delivered.svg', value: '500+', label: ['Projects', 'delivered'] },
    { icon: '/images/hero/globe.svg', value: '9', label: ['Years', 'experience'] },
    // Placeholder figure — no count was given for this one.
    { icon: '/images/hero/briefcase.svg', value: '20+', label: ['Global client', 'base'] },
  ],
  role: 'Visual & UI/UX Designer',
};

const HERO_TRAVEL: HeroCardContent = {
  accent: '#47C89A',
  quote: ['“Mid-flight,', ' mid-thought”'],
  status: ['"Currently', ' abroad"'],
  // Companions to the given "Window seat" line are placeholders.
  traits: [
    { lines: ['"Window seat"', 'to worldview'], accentChars: 13 },
    { lines: ['"Passport"', 'always packed'], accentChars: 10 },
    { lines: ['"One-way"', 'by instinct'], accentChars: 9 },
  ],
  // The travel side cycles too, so the block behaves the same on both faces.
  // These two companions are placeholders — only the countries figure was given.
  stats: [
    { icon: '/images/hero/projects-delivered.svg', value: '14', label: ['Countries', 'visited'] },
    { icon: '/images/hero/globe.svg', value: '30+', label: ['Cities', 'explored'] },
    { icon: '/images/hero/briefcase.svg', value: '6', label: ['Continents', 'covered'] },
  ],
  role: 'Avid Traveller',
};

/**
 * Typewriter pacing for the stat block, in milliseconds per character.
 *
 * The figure gets a slower beat than its label. It is only two to four
 * characters long, so at the label's rate the whole number appeared in about a
 * tenth of a second — it read as popping in rather than being typed, while the
 * label that followed took the best part of a second.
 */
const STAT_VALUE_TYPE_MS = 130;
const STAT_VALUE_DELETE_MS = 80;
const STAT_TYPE_MS = 45;
const STAT_DELETE_MS = 22;
/** How long a fully typed stat holds before it starts deleting. */
const STAT_HOLD_MS = 2600;

/**
 * Types a string out, holds it, deletes it, then moves to the next entry.
 *
 * Returns the index of the current entry and how many characters of it are
 * showing (`null` under reduced motion, meaning show everything).
 *
 * `slowUntil` marks a leading stretch that types at the slower beat — the stat
 * block's figure uses it, since a two-character number at the label's rate
 * reads as popping in rather than being typed.
 */
function useTypewriterCycle(lengths: number[], slowUntil = 0) {
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState<number | null>(null);

  const count = lengths.length;
  const length = lengths[i] ?? 0;

  useEffect(() => {
    if (length <= 0) return;
    // Reduced motion gets the finished text, with no typing and no cycling.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(null);
      return;
    }

    let n = 0;
    let timer: ReturnType<typeof setTimeout>;
    setTyped(0);

    const slow = (at: number) => at <= slowUntil;
    const next = () => setI((v) => (v + 1) % count);
    const erase = () => {
      n -= 1;
      setTyped(n);
      timer = setTimeout(n <= 0 ? next : erase, slow(n) ? STAT_VALUE_DELETE_MS : STAT_DELETE_MS);
    };
    const hold = () => {
      timer = setTimeout(erase, STAT_HOLD_MS);
    };
    const type = () => {
      n += 1;
      setTyped(n);
      timer = setTimeout(n >= length ? hold : type, slow(n) ? STAT_VALUE_TYPE_MS : STAT_TYPE_MS);
    };

    timer = setTimeout(type, slowUntil > 0 ? STAT_VALUE_TYPE_MS : STAT_TYPE_MS);
    return () => clearTimeout(timer);
  }, [i, length, slowUntil, count]);

  return { i, typed };
}

/**
 * Deals a character budget out across pre-split lines, so each line fills in
 * turn. The join between lines costs a character, matching the single string
 * the timer counts against.
 */
function fillLines(lines: string[], budget: number): string[] {
  let remaining = budget;
  return lines.map((line, idx) => {
    if (idx > 0 && remaining > 0) remaining -= 1;
    const take = Math.min(remaining, line.length);
    remaining -= take;
    return line.slice(0, take);
  });
}

/**
 * The trait pill, typing each phrase out and deleting it again.
 *
 * Its lines are fixed rows for the same reason as the stat labels: a wrapping
 * box reflows as it fills, so the second line would type on line one until a
 * character pushed it down.
 *
 * The accent covers a leading run of characters that can span a line break, so
 * each line is split at whatever part of that run falls inside it rather than
 * colouring whole lines.
 */
function HeroTraitCycle({ traits, accent }: { traits: HeroTrait[]; accent: string }) {
  const lengths = traits.map((t) => t.lines.join(' ').length);
  const { i, typed } = useTypewriterCycle(lengths);

  const trait = traits[i] ?? traits[0];
  if (!trait) return null;

  const lines = fillLines(trait.lines, typed ?? lengths[i] ?? 0);

  // Where each line starts within the whole phrase, so the accent run can be
  // located inside it. The +1 accounts for the space the join adds.
  let cursor = 0;
  const offsets = trait.lines.map((line) => {
    const at = cursor;
    cursor += line.length + 1;
    return at;
  });

  return (
    <span className="flex flex-col font-body text-[2.86cqw]/[1.3] font-semibold text-[#d9effc]">
      {lines.map((line, idx) => {
        const start = offsets[idx];
        // How much of this line falls inside the accented run.
        const accentLen = Math.max(0, Math.min(line.length, trait.accentChars - start));
        return (
          <span key={trait.lines[idx]} className="block h-[3.72cqw] whitespace-nowrap">
            <span style={{ color: accent }}>{line.slice(0, accentLen)}</span>
            {line.slice(accentLen)}
          </span>
        );
      })}
    </span>
  );
}

/**
 * The figure inside the stat block, typing each stat out and deleting it again.
 *
 * The value and label are paced as one string, so they type in sequence — the
 * figure first, then its label — and delete in reverse, the way a single line
 * of text would.
 *
 * Both card faces render this, so each runs its own timer. The hidden face
 * types too, which costs nothing and means a flip never lands on a half-typed
 * stat that then jumps.
 */
function HeroStatCycle({ stats, accent }: { stats: HeroStat[]; accent: string }) {
  const lengths = stats.map((s) => s.value.length + s.label.join(' ').length);
  // The figure types at the slower beat; its length sets where that ends.
  const { i, typed } = useTypewriterCycle(lengths, stats[0]?.value.length ?? 0);

  const stat = stats[i] ?? stats[0];
  const full = lengths[i] ?? 0;

  if (!stat) return null;

  // The value fills up first; the label takes whatever characters are left.
  const shown = typed ?? full;
  const value = stat.value.slice(0, Math.min(shown, stat.value.length));
  const lines = fillLines(stat.label, Math.max(0, shown - stat.value.length));

  return (
    <div className="pointer-events-none absolute inset-0">
      {/*
        The icon fades rather than types — there is no character-by-character
        equivalent for an image, and snapping it in on the first keystroke read
        as a glitch beside the steady typing.
      */}
      <motion.img
        key={stat.icon}
        src={stat.icon}
        alt=""
        aria-hidden="true"
        className="absolute top-[40.72%] left-[18.95%] h-[5.02%] w-[4.06%] object-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: shown > 0 ? 1 : 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
      <span
        className="absolute top-[48.58%] left-[18.95%] font-body text-[4.16cqw]/[1] font-semibold whitespace-nowrap"
        style={{ color: accent }}
      >
        {value}
      </span>
      {/*
        Widened from Figma's 13% to 17.5%. The block is 24.16% wide starting at
        15.43%, so its inner edge is at 39.59% — a 13% label left 45px of the
        panel unused on the right and forced "Global client base" onto a third
        line, which ran past the block's bottom edge. At 17.5% every label fits
        in two lines with the panel's right padding intact.

        Each line is its own row rather than one wrapping paragraph: a wrapping
        box reflows as it fills, so "Projects delive" sat on line one until the
        next character bumped "delivered" down — the text jumped as it typed.
        Fixed rows put every line at a position that does not depend on how much
        of it has been typed yet. Each row keeps its height while empty, so the
        block does not grow line by line either.
      */}
      <span className="absolute top-[56.83%] left-[19.05%] flex w-[17.5%] flex-col font-body text-[2.86cqw]/[1.3] font-semibold text-[#d9effc]">
        {lines.map((line, idx) => (
          <span key={stat.label[idx]} className="block h-[3.72cqw] whitespace-nowrap">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}

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
      <HeroStatCycle stats={content.stats} accent={accent} />

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
        <HeroTraitCycle traits={content.traits} accent={accent} />
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
