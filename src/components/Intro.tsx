import { useEffect, useState } from 'react';
import { INTRO_QUOTE_WORDS, INTRO_SLIDES, INTRO_TILES, INTRO_WORDS } from '../data/content';
import { usePortfolioFit } from '../hooks/usePortfolioFit';
import { CompassIcon, SparkleIcon } from './Icons';

interface IntroProps {
  progress: number;
}

const HEAD_END = 0.62;

function useQuoteCycle(words: string[], intervalMs = 2600, outMs = 420) {
  const [index, setIndex] = useState(0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => {
      setOut(true);
      const t = setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setOut(false);
      }, outMs);
      return () => clearTimeout(t);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs, outMs]);

  return { word: words[index], out };
}

export function Intro({ progress }: IntroProps) {
  const fit = usePortfolioFit('#intro > div');
  const { word: quoteWord, out: quoteOut } = useQuoteCycle(INTRO_QUOTE_WORDS);
  const [slideIdx, setSlideIdx] = useState(0);

  const bodyT = Math.min(1, Math.max(0, (progress - 0.66) / 0.2));
  const bodyOpacity = bodyT;
  const bodyShift = (1 - bodyT) * 24;
  const progressWidth = progress * 100;
  const progressOpacity = 1 - Math.min(1, Math.max(0, (progress - 0.8) / 0.2));

  const prevSlide = () => setSlideIdx((i) => (i + INTRO_SLIDES.length - 1) % INTRO_SLIDES.length);
  const nextSlide = () => setSlideIdx((i) => (i + 1) % INTRO_SLIDES.length);

  return (
    <section id="intro" className="relative h-[300vh] border-t border-white/6">
      <div className="sticky top-0 box-border flex h-screen flex-col justify-center overflow-hidden px-gutter py-[clamp(24px,4vh,48px)] pl-gutter-nav">
        <div
          className="flex w-full flex-col gap-[clamp(26px,3.6vh,48px)]"
          style={{ transform: `scale(${fit.toFixed(3)})`, transformOrigin: 'center left' }}
        >
          <h1
            className="m-0 flex max-w-[19ch] flex-wrap text-[clamp(40px,5.6vw,88px)] leading-[1.04] tracking-[-0.03em]"
            style={{ columnGap: '0.26em', rowGap: '0.02em' }}
          >
            {INTRO_WORDS.map((word, i) => {
              const start = (i / INTRO_WORDS.length) * HEAD_END;
              const span = HEAD_END / INTRO_WORDS.length;
              const t = Math.min(1, Math.max(0, (progress - start) / span));
              const opacity = 0.06 + 0.94 * t;
              const shift = (1 - t) * 26;
              const blur = (1 - t) * 7;
              const variantClass =
                word.variant === 'teal' ? 'font-body font-normal text-teal' : 'font-heading font-bold text-white';
              return (
                <span
                  key={word.text}
                  className={`${variantClass} transition-[opacity,transform,filter] duration-[550ms] ease-[cubic-bezier(.2,.7,.2,1)]`}
                  style={{
                    opacity,
                    transform: `translateY(${shift.toFixed(1)}px)`,
                    filter: `blur(${blur.toFixed(1)}px)`,
                  }}
                >
                  {word.text}
                </span>
              );
            })}
          </h1>

          <div
            className="grid items-center gap-[clamp(36px,4.5vw,76px)] transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
            style={{
              gridTemplateColumns: 'minmax(320px, 1fr) minmax(280px, 408px)',
              opacity: bodyOpacity,
              transform: `translateY(${bodyShift.toFixed(1)}px)`,
            }}
          >
            <div className="flex flex-col items-start gap-[clamp(22px,3vh,34px)]">
              <p className="m-0 font-body text-base/[1.75] text-grey text-pretty">
                <span className="font-bold text-white">Designer by profession, traveler by instinct.</span> Over{' '}
                <span className="font-bold text-orange">9 years</span> designing SaaS products, UI/UX experiences,
                and <span className="font-bold text-green">scalable visual systems</span> shaped by global
                perspective, curiosity, and bold thinking.
              </p>

              <div className="self-stretch rounded-xl border-l-[3px] border-teal bg-[linear-gradient(95deg,rgba(0,184,201,.13),rgba(0,184,201,.02)_70%,transparent)] px-6.5 py-5.5">
                <span className="font-heading text-xl/[1.4] text-white italic">
                  &ldquo;The more I{' '}
                  <span
                    className="inline-block min-w-[3.6em] font-heading font-semibold text-teal not-italic transition-[opacity,transform] duration-450 ease-[cubic-bezier(.2,.7,.2,1)]"
                    style={{ opacity: quoteOut ? 0 : 1, transform: quoteOut ? 'translateY(-8px)' : 'translateY(0px)' }}
                  >
                    {quoteWord}
                  </span>
                  &rdquo;
                </span>
              </div>

              <div className="grid w-full gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {INTRO_TILES.map((tile) => (
                  <div key={tile.label} className="flex flex-col gap-1.25 rounded-xl border border-white/6 bg-surface px-4.5 py-4">
                    <div className="flex items-center gap-2.25 font-heading text-[10.5px] font-medium tracking-[0.16em] text-teal">
                      {tile.icon === 'sparkle' ? <SparkleIcon /> : <CompassIcon />}
                      {tile.label}
                    </div>
                    <div className="font-body text-sm/[1.55] text-grey">
                      {tile.boldPosition === 'start' ? (
                        <>
                          <span className="font-bold text-orange">{tile.bold}</span> {tile.body}
                        </>
                      ) : (
                        <>
                          {tile.body} <span className="font-bold text-green">{tile.bold}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-3.5 rounded-full border border-orange/45 bg-orange/8 py-3.75 pr-5 pl-6 font-body text-[14.5px] font-medium text-orange transition-[background,border-color,transform] duration-200 hover:border-orange hover:bg-orange/15 hover:-translate-y-0.5 hover:text-orange"
              >
                Download my resume
                <span className="grid size-7 flex-none place-items-center rounded-full bg-orange font-body text-sm font-semibold text-bg">
                  ↓
                </span>
              </a>
            </div>

            <div className="relative overflow-hidden rounded-[18px] border border-white/9 bg-[linear-gradient(168deg,#1B1E24,#141619)] shadow-[0_30px_70px_rgba(0,0,0,.55)]">
              <div className="absolute inset-x-0 top-0 z-2 h-0.5 bg-[linear-gradient(90deg,#00B8C9,rgba(0,184,201,0)_60%)]" />
              <div className="flex items-center gap-1.75 border-b border-white/7 bg-surface/90 px-4 py-3.25">
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
              <div className="relative w-full bg-[#0d0f12]" style={{ aspectRatio: '5 / 4' }}>
                {INTRO_SLIDES.map((slide, i) => (
                  <div
                    key={slide}
                    className="absolute inset-0 grid place-items-center transition-opacity duration-450 ease-[cubic-bezier(.2,.7,.2,1)]"
                    style={{ opacity: i === slideIdx ? 1 : 0, pointerEvents: i === slideIdx ? 'auto' : 'none' }}
                  >
                    <span className="font-body text-[11px] tracking-[0.1em] text-[#5a5a5a]">{slide}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.75 border-t border-white/7 bg-bg/60 px-4 py-3.5">
                {INTRO_SLIDES.map((slide, i) => {
                  const on = i === slideIdx;
                  return (
                    <button
                      key={slide}
                      type="button"
                      title={slide}
                      onClick={() => setSlideIdx(i)}
                      className="h-7 w-8.5 flex-none cursor-pointer rounded-md font-body text-[10.5px] font-medium transition-transform duration-180 hover:-translate-y-0.5"
                      style={{
                        background: on ? 'rgba(0,184,201,.12)' : '#101215',
                        border: `1.5px solid ${on ? '#00B8C9' : 'rgba(255,255,255,.1)'}`,
                        color: on ? '#00B8C9' : '#5a5a5a',
                      }}
                    >
                      {i + 1}
                    </button>
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
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-5 left-gutter-nav flex items-center gap-3 transition-opacity duration-400"
          style={{ opacity: progressOpacity }}
        >
          <div className="h-0.5 w-45 overflow-hidden bg-white/10">
            <div
              className="h-full bg-teal transition-[width] duration-200 ease-linear"
              style={{ width: `${progressWidth.toFixed(1)}%` }}
            />
          </div>
          <span className="font-heading text-[10.5px] font-medium tracking-[0.14em] text-[#4a4a4a]">
            KEEP SCROLLING
          </span>
        </div>
      </div>
    </section>
  );
}
