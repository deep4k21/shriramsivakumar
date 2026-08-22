import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AI_TOOLS, INTRO_QUOTE_WORDS, INTRO_TILES, TOOLKIT, type QuoteWord } from '../data/content';
import { usePortfolioFit } from '../hooks/usePortfolioFit';
import { useRevealStyle } from '../hooks/useRevealStyle';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { BriefcaseIcon, ChipIcon, CompassIcon, SparkleIcon, WrenchIcon } from './Icons';

const QUOTE_END = 0.3;
const TILES_START = 0.32;
const TILES_END = 0.56;
const TOOLKIT_START = 0.6;
const TOOLKIT_END = 0.84;

const CARD = 'rounded-[10px] border border-[#89919F] bg-[#15161A] backdrop-blur-md';

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

/** Airport-departure-board flip: the word rotates away, swaps, then rotates back. */
function SplitFlapWord({ word }: { word: QuoteWord }) {
  const [shown, setShown] = useState(word);
  const [phase, setPhase] = useState<'idle' | 'out'>('idle');

  useEffect(() => {
    if (word.text === shown.text) return;
    setPhase('out');
  }, [word, shown]);

  return (
    <span className="inline-block" style={{ perspective: 600 }}>
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
    </span>
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
        className="size-10 cursor-pointer rounded-lg object-contain"
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
  const tilesReveal = useRevealStyle(progress, { start: TILES_START, end: TILES_END });
  const toolkitReveal = useRevealStyle(progress, { start: TOOLKIT_START, end: TOOLKIT_END });

  return (
    <section ref={ref} id="about" className="relative h-[300vh] border-t border-white/6">
      <div className="sticky top-0 box-border flex h-screen flex-col justify-center overflow-hidden px-gutter py-[clamp(24px,4vh,48px)] pl-gutter-nav">
        <div
          className="flex w-full flex-col gap-[clamp(22px,3vh,40px)]"
          style={{ transform: `scale(${fit.toFixed(3)})`, transformOrigin: 'center left' }}
        >
          <motion.h2
            className="m-0 font-heading text-[clamp(30px,4vw,52px)] font-bold tracking-[-0.02em] text-white"
            style={quoteReveal}
          >
            &ldquo;The more I{' '}
            <SplitFlapWord word={quoteWord} />
            &rdquo;
          </motion.h2>

          <motion.div
            className="grid gap-[clamp(14px,1.6vw,22px)]"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', ...tilesReveal }}
          >
            {INTRO_TILES.map((tile) => {
              const Icon = TILE_ICON[tile.icon];
              return (
                <div key={tile.label} className={`flex flex-col gap-2 ${CARD} px-6.5 py-6`}>
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
                </div>
              );
            })}
          </motion.div>

          <motion.div
            className="grid gap-[clamp(14px,1.6vw,22px)]"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', ...toolkitReveal }}
          >
            <div className={`flex flex-col gap-4 ${CARD} px-7 py-6.5`}>
              <div className="flex items-baseline justify-between gap-3.5">
                <div className="flex items-center gap-2.25 font-heading text-lg font-semibold text-white">
                  <WrenchIcon size={16} />
                  My Toolkit
                </div>
                <span className="whitespace-nowrap font-heading text-[10px] font-medium tracking-[0.1em] text-[#5a5a5a]">
                  {TOOLKIT.length} TOOLS
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {TOOLKIT.map((tool) => (
                  <ToolIcon key={tool.name} name={tool.name} icon={tool.icon} />
                ))}
              </div>
            </div>
            <div className={`flex flex-col gap-4 ${CARD} px-7 py-6.5`}>
              <div className="flex items-baseline justify-between gap-3.5">
                <div className="flex items-center gap-2.25 font-heading text-lg font-semibold text-white">
                  <ChipIcon size={16} />
                  AI Workflow
                </div>
                <span className="whitespace-nowrap font-heading text-[10px] font-medium tracking-[0.1em] text-[#5a5a5a]">
                  {AI_TOOLS.length} TOOLS
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
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
