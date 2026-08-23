import { motion, useTransform } from 'motion/react';
import { useState } from 'react';
import { INTRO_SLIDES, INTRO_WORDS } from '../data/content';
import { usePortfolioFit } from '../hooks/usePortfolioFit';
import { useRevealStyle } from '../hooks/useRevealStyle';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { DownloadCircleIcon } from './Icons';

const HEAD_END = 0.62;
const BODY_START = 0.66;
const BODY_END = 0.86;
/** The slide panel settles in as the section opens, before the copy reveals. */
const PANEL_END = 0.14;

/** Word reveals share the head window, one slot each, with "From" taking slot 0. */
const WORD_SPAN = HEAD_END / (INTRO_WORDS.length + 1);

function RevealWord({
  progress,
  slot,
  className,
  children,
}: {
  progress: ReturnType<typeof useSectionScroll>['progress'];
  slot: number;
  className?: string;
  children: React.ReactNode;
}) {
  const style = useRevealStyle(progress, {
    start: slot * WORD_SPAN,
    end: (slot + 1) * WORD_SPAN,
    shift: 26,
    blur: 7,
    from: 0.06,
  });

  return (
    <motion.span className={className} style={style}>
      {children}
    </motion.span>
  );
}

export function Intro() {
  const { ref, progress } = useSectionScroll<HTMLElement>();
  const fit = usePortfolioFit('#intro > div');
  const [slideIdx, setSlideIdx] = useState(0);

  const bodyReveal = useRevealStyle(progress, { start: BODY_START, end: BODY_END });
  const panelReveal = useRevealStyle(progress, { start: 0, end: PANEL_END });
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%']);
  const progressOpacity = useTransform(progress, [0.8, 1], [1, 0], { clamp: true });

  const prevSlide = () => setSlideIdx((i) => (i + INTRO_SLIDES.length - 1) % INTRO_SLIDES.length);
  const nextSlide = () => setSlideIdx((i) => (i + 1) % INTRO_SLIDES.length);

  return (
    <section ref={ref} id="intro" className="relative h-[300vh] border-t border-white/6">
      <div className="sticky top-0 box-border flex h-screen flex-col justify-center overflow-hidden px-gutter py-[clamp(24px,4vh,48px)] pl-gutter-nav">
        <div
          className="grid w-full items-start gap-[clamp(36px,4.5vw,76px)]"
          style={{
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(280px, 408px)',
            transform: `scale(${fit.toFixed(3)})`,
            transformOrigin: 'center left',
          }}
        >
          <div className="flex flex-col items-start gap-[clamp(18px,2.6vh,28px)]">
            <RevealWord progress={progress} slot={0} className="font-body text-lg text-grey">
              From
            </RevealWord>

            <h1
              className="m-0 flex max-w-[15ch] flex-wrap text-[clamp(36px,4.6vw,72px)] leading-[1.08] tracking-[-0.03em]"
              style={{ columnGap: '0.26em', rowGap: '0.02em' }}
            >
              {INTRO_WORDS.map((word, i) => (
                <RevealWord
                  key={word.text}
                  progress={progress}
                  slot={i + 1}
                  className={
                    word.variant === 'teal'
                      ? 'font-body font-normal text-teal'
                      : 'font-heading font-bold text-white'
                  }
                >
                  {word.text}
                </RevealWord>
              ))}
            </h1>

            <motion.div
              className="flex flex-col items-start gap-[clamp(36px,6vh,56px)]"
              style={{ marginTop: 'clamp(24px,5vh,64px)', ...bodyReveal }}
            >
              <div className="flex flex-col gap-1">
                <p className="m-0 font-body text-base/[1.75] font-bold">
                  <span className="text-orange">Designer by profession,</span>{' '}
                  <span className="text-green">traveler by instinct.</span>
                </p>
                <p className="m-0 font-body text-base/[1.75] text-grey text-pretty">
                  Over <span className="font-bold text-white">9 years</span> designing SaaS products, UI/UX
                  experiences, and scalable visual systems shaped by{' '}
                  <span className="font-bold text-white">global perspective, curiosity,</span> and{' '}
                  <span className="font-bold text-white">bold thinking.</span>
                </p>
              </div>

              <motion.a
                href="#"
                className="inline-flex items-center gap-4 rounded-2xl border border-teal bg-[#005961]/10 py-4 pr-5 pl-6 font-heading text-lg font-bold text-teal"
                whileHover={{ y: -2, backgroundColor: 'rgba(0,184,201,0.1)' }}
                transition={{ duration: 0.2 }}
              >
                Download my Resume
                <DownloadCircleIcon size={33} className="flex-none text-teal" />
              </motion.a>
            </motion.div>
          </div>

          <motion.div
            data-card-travel-target
            className="relative overflow-hidden rounded-[18px] border border-white/9 bg-surface"
            style={panelReveal}
          >
            <div className="flex items-center gap-1.75 border-b border-white/7 px-4 py-3.25">
              <span className="size-2.25 rounded-full bg-orange" />
              <span className="size-2.25 rounded-full bg-green" />
              <span className="size-2.25 rounded-full bg-teal" />
              <span className="ml-2.5 font-heading text-[10.5px] font-medium tracking-[0.14em] text-teal">
                {INTRO_SLIDES[slideIdx].toUpperCase()}
              </span>
              <div className="flex-1" />
              <span className="font-heading text-[10px] font-medium tracking-[0.1em] text-[#5a5a5a]">
                {slideIdx + 1} / {INTRO_SLIDES.length}
              </span>
            </div>
            <div className="relative w-full bg-[#0d0f12]" style={{ aspectRatio: '3 / 2' }}>
              {INTRO_SLIDES.map((slide, i) => (
                <motion.div
                  key={slide}
                  className="absolute inset-0 grid place-items-center"
                  animate={{ opacity: i === slideIdx ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                  style={{ pointerEvents: i === slideIdx ? 'auto' : 'none' }}
                >
                  <span className="font-body text-[11px] tracking-[0.1em] text-[#5a5a5a]">{slide}</span>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.75 border-t border-white/7 px-4 py-3.5">
              {INTRO_SLIDES.map((slide, i) => {
                const on = i === slideIdx;
                return (
                  <motion.button
                    key={slide}
                    type="button"
                    title={slide}
                    onClick={() => setSlideIdx(i)}
                    className="h-7 w-8.5 flex-none cursor-pointer rounded-md font-body text-[10.5px] font-medium"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.18 }}
                    animate={{
                      backgroundColor: on ? 'rgba(0,184,201,.12)' : 'rgba(0,0,0,0)',
                      borderColor: on ? '#00B8C9' : 'rgba(255,255,255,.1)',
                      color: on ? '#00B8C9' : '#5a5a5a',
                    }}
                    style={{ borderWidth: 1.5, borderStyle: 'solid' }}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}
              <div className="flex-1" />
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="grid size-7.5 flex-none cursor-pointer place-items-center rounded-md border border-white/12 bg-transparent font-body text-[13px] text-grey hover:text-white"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="grid size-7.5 flex-none cursor-pointer place-items-center rounded-md border border-white/12 bg-transparent font-body text-[13px] text-grey hover:text-white"
              >
                ›
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-5 left-gutter-nav flex items-center gap-3"
          style={{ opacity: progressOpacity }}
        >
          <div className="h-0.5 w-45 overflow-hidden bg-white/10">
            <motion.div className="h-full bg-teal" style={{ width: progressWidth }} />
          </div>
          <span className="font-heading text-[10.5px] font-medium tracking-[0.14em] text-[#4a4a4a]">
            KEEP SCROLLING
          </span>
        </motion.div>
      </div>
    </section>
  );
}
