import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AI_TOOLS, INTRO_QUOTE_WORDS, INTRO_TILES, TOOLKIT } from '../../data/content';
import { CARD_GLASS } from '../../styles/card';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/** How long each word of the cycling headline holds before the next. */
const WORD_HOLD_MS = 2600;

/**
 * Width of the slot the hand-drawn doodles sit in, in `em` against the
 * heading — the widest of the two, so the box never changes size.
 *
 * The same reasoning as desktop: the drawings are different widths, so a slot
 * sized to whichever is showing would grow and shrink the heading on every
 * swap. Fixing it to the larger keeps the line still.
 */
const DOODLE_SLOT_EM = Math.max(...INTRO_QUOTE_WORDS.map((w) => w.doodleEm));

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The about section, for a phone.
 *
 * Desktop pins this for 300vh and scrubs three things off the scroll: the
 * headline's last word flips between "see" and "design" on a split-flap, the
 * three tiles reveal in a staggered order, and the two toolkit cards follow.
 * All of it needs a scroll the page owns and a row wide enough for three
 * tiles side by side.
 *
 * Here it is a single column. The headline keeps its swapping word — that is
 * the sentence's whole point, not decoration — but runs it on a timer rather
 * than on scroll position, since there is no pinned progress to read. The
 * tiles and toolkit cards stack and reveal as they arrive.
 */
export function MobileAbout() {
  const reduced = useReducedMotion();
  const [wordIdx, setWordIdx] = useState(0);
  const word = INTRO_QUOTE_WORDS[wordIdx];

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(
      () => setWordIdx((i) => (i + 1) % INTRO_QUOTE_WORDS.length),
      WORD_HOLD_MS,
    );
    return () => clearInterval(timer);
  }, [reduced]);

  return (
    <section id="about" className="flex flex-col gap-8 px-5 py-16">
      <Reveal>
        <h2 className="m-0 font-heading text-[clamp(26px,7.5vw,36px)]/[1.2] font-semibold tracking-[-0.02em] text-white">
          The more I{' '}
          {/*
            The swapping word, with its own colour and the hand-drawn doodle
            that belongs to it — the same pairing the desktop split-flap turns
            between. Keyed on the word so the swap animates rather than the
            text silently replacing itself in place.
          */}
          <motion.span
            key={word.text}
            className={`font-accent font-bold ${word.colorClass}`}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            {word.text}
          </motion.span>
          {/*
            The doodle sits in a fixed-width slot, absolutely positioned
            inside it: the two drawings differ in height, so leaving them in
            flow would grow the heading and shove the tiles below it down each
            time the word cycles. Only this spacer's width takes part in
            layout, and that is held constant.
          */}
          {/*
            `ml` so the drawing stands off the word rather than butting
            against its last letter — the desktop heading gets that gap from
            the space before its own doodle slot, which this inline layout
            does not reproduce on its own.
          */}
          <span
            aria-hidden="true"
            className="relative ml-[0.28em] inline-block align-middle"
            style={{ width: `${DOODLE_SLOT_EM}em` }}
          >
            <motion.img
              key={word.doodle}
              src={word.doodle}
              alt=""
              className="pointer-events-none absolute top-1/2 left-0 max-w-none -translate-y-1/2 select-none"
              style={{ width: `${word.doodleEm}em` }}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            />
          </span>
        </h2>
      </Reveal>

      {/*
        The three tiles. One per row rather than the desktop's side-by-side
        set: their copy is a full sentence each, and at a phone's width three
        columns would leave every one of them a narrow ribbon.
      */}
      <div className="flex flex-col gap-3.5">
        {INTRO_TILES.map((tile, i) => (
          <Reveal key={tile.label} delay={0.05 * i}>
            <div className={`flex flex-col gap-2.5 ${CARD_GLASS} p-5`}>
              <div className="flex items-center gap-2.5 font-heading text-[15px] font-semibold text-white">
                <img src={tile.icon} alt="" aria-hidden="true" className="size-4.5 flex-none" />
                {tile.label}
              </div>
              {/*
                The copy's accent runs, kept as the data has them: the
                highlights fall in several scattered phrases rather than one
                contiguous span, which is why it is a list of runs and not a
                string with one bold part.
              */}
              <p className="m-0 font-body text-[14px]/[1.65] text-grey text-pretty">
                {tile.segments.map((seg, j) => (
                  <span key={j} className={seg.accent ? 'font-semibold text-teal' : undefined}>
                    {seg.text}
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* The two tool sets, stacked for the same reason as the tiles. */}
      <div className="flex flex-col gap-3.5">
        {[
          { title: 'My Toolkit', icon: '/images/about/mytoolkit.svg', tools: TOOLKIT },
          { title: 'AI Workflow', icon: '/images/about/aiworkflow.svg', tools: AI_TOOLS },
        ].map((group, i) => (
          <Reveal key={group.title} delay={0.05 * i}>
            <div className={`flex flex-col gap-4 ${CARD_GLASS} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 font-heading text-[15px] font-semibold text-white">
                  <img src={group.icon} alt="" aria-hidden="true" className="size-4.5 flex-none" />
                  {group.title}
                </div>
                <span className="font-heading text-[10px] font-medium tracking-[0.1em] whitespace-nowrap text-[#A5AEBB]">
                  {group.tools.length} TOOLS
                </span>
              </div>
              {/*
                The icons wrap rather than sitting in a fixed grid: the two
                sets are different lengths, and a column count that suits ten
                leaves the other with a ragged last row.
              */}
              <div className="flex flex-wrap gap-4">
                {group.tools.map((tool) => (
                  <img
                    key={tool.name}
                    src={tool.icon}
                    alt={tool.name}
                    title={tool.name}
                    loading="lazy"
                    className="size-8 object-contain"
                  />
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
