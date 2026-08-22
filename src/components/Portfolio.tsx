import { cubicBezier, motion, useTransform, type MotionValue } from 'motion/react';
import { CATEGORIES } from '../data/content';
import { usePortfolioFit } from '../hooks/usePortfolioFit';
import { useRevealStyle } from '../hooks/useRevealStyle';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { GridIcon } from './Icons';

interface PortfolioProps {
  onOpenCategory: (categoryIndex: number) => void;
}

/** Matches the previous `1 - (1 - t)^3` ease-out on the card entrance. */
const CARD_EASE = cubicBezier(0.33, 1, 0.68, 1);
const CARD_SPAN = 0.26;

function CategoryCard({
  progress,
  index,
  onOpen,
}: {
  progress: MotionValue<number>;
  index: number;
  onOpen: () => void;
}) {
  const cat = CATEGORIES[index];
  const start = 0.16 + index * 0.13;
  const range: [number, number] = [start, start + CARD_SPAN];

  // Cards fly in from the outer corners: left column from the left, right from
  // the right; top row from above, bottom row from below.
  const fromX = (index % 2 === 0 ? 1 : -1) * 190;
  const fromY = (index < 2 ? 1 : -1) * 120;

  const opacity = useTransform(progress, range, [0, 1], { clamp: true });
  const x = useTransform(progress, range, [fromX, 0], { clamp: true, ease: CARD_EASE });
  const y = useTransform(progress, range, [fromY, 0], { clamp: true, ease: CARD_EASE });
  const scale = useTransform(progress, range, [0.84, 1], { clamp: true, ease: CARD_EASE });
  const borderColor = useTransform(
    progress,
    [range[1] - 0.01, range[1]],
    ['rgba(255,255,255,.04)', 'rgba(255,255,255,.08)'],
    { clamp: true },
  );

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="relative flex cursor-pointer flex-col gap-[clamp(14px,2vh,22px)] overflow-hidden rounded-[18px] border bg-[linear-gradient(168deg,#1B1E24,#141619)] px-[clamp(28px,2.6vw,40px)] py-[clamp(28px,3.4vh,44px)] text-left"
      style={{ opacity, x, y, scale, borderColor }}
      whileHover={{ borderColor: 'rgba(255,154,92,0.5)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,#FF9A5C,transparent_60%)]" />
      <div className="font-heading text-[10.5px] font-medium tracking-[0.14em] text-[#5a5a5a]">
        {String(index + 1).padStart(2, '0')} / {String(CATEGORIES.length).padStart(2, '0')}
      </div>
      <div className="font-heading text-[clamp(21px,2vw,29px)]/[1.2] font-semibold tracking-[-0.02em] text-orange">
        {cat.title}
      </div>
      <p className="m-0 max-w-[38ch] font-body text-[clamp(14px,1.05vw,15.5px)]/[1.7] text-grey text-pretty">
        {cat.lead} <span className="font-bold text-white">{cat.leadBold}</span>
      </p>
      <div className="flex-1" />
      <div className="flex items-center gap-2.25 font-body text-[13px] text-teal">
        Open <span className="font-bold">{cat.short}</span> <span className="text-[15px]">→</span>
      </div>
    </motion.div>
  );
}

export function Portfolio({ onOpenCategory }: PortfolioProps) {
  const { ref, progress } = useSectionScroll<HTMLElement>();
  const fit = usePortfolioFit('#portfolio > div');

  const headReveal = useRevealStyle(progress, { start: 0, end: 0.12, shift: 22 });

  return (
    <section ref={ref} id="portfolio" className="relative h-[340vh] border-t border-white/6">
      <div className="sticky top-0 box-border flex h-screen flex-col justify-center overflow-hidden px-gutter py-[clamp(28px,4vh,56px)] pl-gutter-nav">
        <div
          className="flex w-full flex-col gap-[clamp(28px,4.4vh,56px)]"
          style={{ transform: `scale(${fit.toFixed(3)})`, transformOrigin: 'center center' }}
        >
          <motion.div className="flex max-w-280 flex-col gap-3.5" style={headReveal}>
            <div className="flex items-center gap-2.25 font-heading text-[11px] font-medium tracking-[0.18em] text-teal">
              <GridIcon />
              02 · PORTFOLIO
            </div>
            <div className="max-w-[20ch] font-heading text-[clamp(24px,2.9vw,40px)]/[1.3] font-semibold tracking-[-0.015em] text-teal">
              Every project started with <span className="font-bold">curiosity</span>. Every solution was shaped by{' '}
              <span className="font-bold">design</span>.
            </div>
          </motion.div>

          <div className="grid w-full grid-cols-2 gap-[clamp(20px,2.4vw,32px)]" style={{ perspective: '1400px' }}>
            {CATEGORIES.map((cat, i) => (
              <CategoryCard key={cat.id} progress={progress} index={i} onOpen={() => onOpenCategory(i)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
