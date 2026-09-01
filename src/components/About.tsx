import { motion, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import { AI_TOOLS, INTRO_QUOTE_WORDS, INTRO_TILES, TOOLKIT, type QuoteWord } from '../data/content';
import { usePortfolioFit } from '../hooks/usePortfolioFit';
import { useRevealStyle } from '../hooks/useRevealStyle';
import { useExitStyle } from '../hooks/useExitStyle';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { CARD_GLASS } from '../styles/card';
import { CardGlow } from './CardGlow';
import { BriefcaseIcon, ChipIcon, CompassIcon, SparkleIcon, WrenchIcon } from './Icons';

const QUOTE_END = 0.3;
/**
 * The tiles reveal in sequence rather than as one block.
 *
 * The middle tile ("After Hours") is where the travelling ghost lands, so it
 * arrives early — the flight finishes at intro progress 1.6, which is this
 * section's 0.1. The two flanking tiles follow on their own, no longer trailing
 * a ghost of their own; their timing is kept as the beat that reads well after
 * the middle one has settled.
 */
const TILE_MID_START = 0.02;
const TILE_MID_END = 0.14;
const TILE_SIDE_START = 0.24;
const TILE_SIDE_END = 0.42;
const TOOLKIT_START = 0.42;
const TOOLKIT_END = 0.6;


const TILE_ICON = {
  sparkle: SparkleIcon,
  compass: CompassIcon,
  briefcase: BriefcaseIcon,
};

function useQuoteCycle<T>(words: T[], intervalMs = 2600) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  return words[index];
}

const FLAP_HALF_S = 0.22;

/**
 * Width of the fixed slot the doodles sit in, in `em` against the heading.
 *
 * Held at the widest of the two so the reserved space never changes as the word
 * cycles — the drawings differ in both width and height, and letting the slot
 * track each one would shift the closing quote from side to side.
 */
const DOODLE_SLOT_EM = Math.max(...INTRO_QUOTE_WORDS.map((w) => w.doodleEm));

/** Airport-departure-board flip: the word rotates away, swaps, then rotates back. */
function SplitFlapWord({ word, trailing }: { word: QuoteWord; trailing?: string }) {
  const [shown, setShown] = useState(word);
  const [phase, setPhase] = useState<'idle' | 'out'>('idle');

  useEffect(() => {
    if (word.text === shown.text) return;
    setPhase('out');
  }, [word, shown]);

  return (
    <span className="inline-flex items-center gap-[0.32em]" style={{ perspective: 600 }}>
      <motion.span
        className={`inline-block font-heading font-bold ${shown.colorClass}`}
        style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
        animate={{ rotateX: phase === 'out' ? -90 : 0 }}
        transition={{
          duration: FLAP_HALF_S,
          ease: phase === 'out' ? [0.5, 0, 0.75, 0] : [0.25, 1, 0.5, 1],
        }}
        onAnimationComplete={() => {
          if (phase !== 'out') return;
          // Swap the face — text and colour together — while it's edge-on,
          // then let it fall back into view.
          setShown(word);
          setPhase('idle');
        }}
      >
        {shown.text}
      </motion.span>
      {trailing ? <span className="-ml-[0.28em] text-white">{trailing}</span> : null}
      {/*
        The doodle belongs to the word, so it swaps with it — but it sits
        outside the flipping span rather than inside, or it would rotate edge-on
        with the letters. It cross-fades on the same `shown` swap instead, which
        keeps the two in step without the doodle tumbling.

        It is also taken out of flow: the two drawings are different heights, so
        in flow the taller one grows the heading and shoves everything below it
        down as the word cycles. An absolutely positioned box, vertically
        centred on the text, keeps the heading's height fixed — only the width
        of this spacer participates in layout, and that is held constant.
      */}
      <span
        aria-hidden="true"
        className="relative inline-block flex-none self-stretch"
        style={{ width: `${DOODLE_SLOT_EM}em` }}
      >
        <motion.img
          key={shown.doodle}
          src={shown.doodle}
          alt=""
          className="pointer-events-none absolute top-1/2 left-0 max-w-none -translate-y-1/2 select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'out' ? 0 : 1 }}
          transition={{ duration: FLAP_HALF_S, ease: [0.25, 1, 0.5, 1] }}
          style={{ width: `${shown.doodleEm}em` }}
        />
      </span>
    </span>
  );
}

/**
 * One intro tile, revealing on its own window so it can be timed to the ghost
 * outline that lands on it.
 */
function IntroTile({
  tile,
  progress,
  start,
  end,
}: {
  tile: (typeof INTRO_TILES)[number];
  progress: ReturnType<typeof useSectionScroll>['progress'];
  start: number;
  end: number;
}) {
  const Icon = TILE_ICON[tile.icon];
  const reveal = useRevealStyle(progress, { start, end });
  // The tiles are the ghosts' source for the hop into portfolio (about progress
  // 1.02), so they clear just before it — otherwise the tile sits there as a
  // duplicate of the outline now flying away. Layout is untouched, so the ghost
  // can still measure this element live while it's invisible.
  const boxExit = useExitStyle(progress, { start: 0.95, end: 1, shift: 0 });
  const opacity = useTransform(
    [reveal.opacity, boxExit.opacity],
    ([revealIn, out]: number[]) => revealIn * out,
  );

  return (
    <motion.div
      data-about-tile
      className={`group relative flex flex-col gap-2 overflow-hidden ${CARD_GLASS} px-6.5 pt-6 pb-11`}
      style={{ ...reveal, opacity }}
    >
      <CardGlow />
      <div className="flex items-center gap-2.25 font-heading text-lg font-semibold text-white">
        <Icon size={16} />
        {tile.label}
      </div>
      <div className="font-body text-sm/[1.55] text-grey">
        {tile.boldPosition === 'start' ? (
          <>
            <span className="font-bold text-teal">{tile.bold}</span> {tile.body}
          </>
        ) : (
          <>
            {tile.body} <span className="font-bold text-teal">{tile.bold}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

function ToolIcon({ name, icon }: { name: string; icon: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setPos(null)}
    >
      <motion.img
        src={icon}
        alt={name}
        // No pointer cursor: hovering only reveals the name tooltip, there is
        // nothing here to click.
        className="size-13 rounded-lg object-contain"
        whileHover={{ y: -3, scale: 1.06 }}
        transition={{ duration: 0.18 }}
      />
      {pos && (
        <span
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-white/10 bg-surface px-2.5 py-1.25 font-body text-[11px] text-white shadow-[0_8px_20px_rgba(0,0,0,.4)]"
          style={{ left: pos.x + 16, top: pos.y }}
        >
          {name}
        </span>
      )}
    </div>
  );
}

export function About() {
  const { ref, progress } = useSectionScroll<HTMLElement>();
  const fit = usePortfolioFit('#about > div');
  const quoteWord = useQuoteCycle(INTRO_QUOTE_WORDS);

  const quoteReveal = useRevealStyle(progress, {
    start: 0,
    end: QUOTE_END,
    shift: 26,
    blur: 7,
    from: 0.06,
  });
  const toolkitReveal = useRevealStyle(progress, { start: TOOLKIT_START, end: TOOLKIT_END });
  // Clears as the section unpins and the ghost outlines move on. The tiles
  // themselves are ghost targets, so they keep their own reveal and stay put.
  //
  // These elements already animate opacity on the way in, so the exit is folded
  // into a single transform per element rather than layering a second `opacity`
  // motion value over the first — only one can win on a given style prop.
  const exit = useExitStyle(progress, { start: 0.94, end: 1 });
  const quoteExitOpacity = useTransform(
    [quoteReveal.opacity, exit.opacity],
    ([reveal, out]: number[]) => reveal * out,
  );
  const toolkitExitOpacity = useTransform(
    [toolkitReveal.opacity, exit.opacity],
    ([reveal, out]: number[]) => reveal * out,
  );

  return (
    <section ref={ref} id="about" className="relative h-[300vh] border-t border-white/6">
      <div className="sticky top-0 box-border flex h-screen flex-col justify-center overflow-hidden px-gutter py-[clamp(24px,4vh,48px)] pl-gutter-nav">
        <div
          className="flex w-full flex-col gap-[clamp(22px,3vh,40px)]"
          style={{ transform: `scale(${fit.toFixed(3)})`, transformOrigin: 'center left' }}
        >
          <motion.h2
            className="m-0 font-heading text-[clamp(30px,4vw,52px)] font-bold tracking-[-0.02em] text-white"
            style={{ ...quoteReveal, opacity: quoteExitOpacity }}
          >
            {/*
              The closing quote is passed in so it stays glued to the word,
              with the doodle sitting after the whole quoted phrase rather than
              between the word and its own punctuation.
            */}
            &ldquo;The more I <SplitFlapWord word={quoteWord} trailing="&rdquo;" />
          </motion.h2>

          {/*
            The extra margin sits on this row rather than widening the column's
            shared gap, which also spaces the heading — the break wanted is
            between the tiles and the toolkit cards specifically, now that the
            cards no longer carry a tall min-height of their own.
          */}
          <div
            className="mb-[clamp(10px,2vh,26px)] grid gap-[clamp(14px,1.6vw,22px)]"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
          >
            {INTRO_TILES.map((tile, i) => {
              const mid = i === 1;
              return (
                <IntroTile
                  key={tile.label}
                  tile={tile}
                  progress={progress}
                  start={mid ? TILE_MID_START : TILE_SIDE_START}
                  end={mid ? TILE_MID_END : TILE_SIDE_END}
                />
              );
            })}
          </div>

          <motion.div
            className="grid gap-[clamp(14px,1.6vw,22px)]"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              ...toolkitReveal,
              opacity: toolkitExitOpacity,
            }}
          >
            {/*
              Sized to its content rather than to a min-height: the icons take
              two rows at most, so a 300–420px floor left the bottom half of
              both cards empty. Without it each card ends just below its last
              row of icons, and a card whose icons wrap further simply grows.
            */}
            <div
              className={`group relative flex flex-col justify-start gap-4 overflow-hidden ${CARD_GLASS} px-7 pt-6.5 pb-11`}
            >
              <CardGlow />
              <div className="flex items-baseline justify-between gap-3.5">
                <div className="flex items-center gap-2.25 font-heading text-lg font-semibold text-white">
                  <WrenchIcon size={16} />
                  My Toolkit
                </div>
                <span className="whitespace-nowrap font-heading text-[10px] font-medium tracking-[0.1em] text-[#5a5a5a]">
                  {TOOLKIT.length} TOOLS
                </span>
              </div>
              <div className="flex flex-wrap gap-3.5">
                {TOOLKIT.map((tool) => (
                  <ToolIcon key={tool.name} name={tool.name} icon={tool.icon} />
                ))}
              </div>
            </div>
            <div
              className={`group relative flex flex-col justify-start gap-4 overflow-hidden ${CARD_GLASS} px-7 pt-6.5 pb-11`}
            >
              <CardGlow />
              <div className="flex items-baseline justify-between gap-3.5">
                <div className="flex items-center gap-2.25 font-heading text-lg font-semibold text-white">
                  <ChipIcon size={16} />
                  AI Workflow
                </div>
                <span className="whitespace-nowrap font-heading text-[10px] font-medium tracking-[0.1em] text-[#5a5a5a]">
                  {AI_TOOLS.length} TOOLS
                </span>
              </div>
              <div className="flex flex-wrap gap-3.5">
                {AI_TOOLS.map((tool) => (
                  <ToolIcon key={tool.name} name={tool.name} icon={tool.icon} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
