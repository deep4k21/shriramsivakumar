import { CATEGORIES } from '../data/content';
import { usePortfolioFit } from '../hooks/usePortfolioFit';
import { GridIcon } from './Icons';

interface PortfolioProps {
  portP: number;
  onOpenCategory: (categoryIndex: number) => void;
}

export function Portfolio({ portP, onOpenCategory }: PortfolioProps) {
  const fit = usePortfolioFit('#portfolio > div');

  const headOpacity = Math.min(1, Math.max(0, portP / 0.12));
  const headShift = (1 - headOpacity) * 22;

  return (
    <section id="portfolio" className="relative h-[340vh] border-t border-white/6">
      <div className="sticky top-0 box-border flex h-screen flex-col justify-center overflow-hidden px-gutter py-[clamp(28px,4vh,56px)] pl-gutter-nav">
        <div
          className="flex w-full flex-col gap-[clamp(28px,4.4vh,56px)]"
          style={{ transform: `scale(${fit.toFixed(3)})`, transformOrigin: 'center center' }}
        >
          <div
            className="flex max-w-280 flex-col gap-3.5 transition-[opacity,transform] duration-600 ease-[cubic-bezier(.2,.7,.2,1)]"
            style={{ opacity: headOpacity, transform: `translateY(${headShift.toFixed(1)}px)` }}
          >
            <div className="flex items-center gap-2.25 font-heading text-[11px] font-medium tracking-[0.18em] text-teal">
              <GridIcon />
              02 · PORTFOLIO
            </div>
            <div className="max-w-[20ch] font-heading text-[clamp(24px,2.9vw,40px)]/[1.3] font-semibold tracking-[-0.015em] text-teal">
              Every project started with <span className="font-bold">curiosity</span>. Every solution was shaped by{' '}
              <span className="font-bold">design</span>.
            </div>
          </div>

          <div
            className="grid w-full grid-cols-2 gap-[clamp(20px,2.4vw,32px)]"
            style={{ perspective: '1400px' }}
          >
            {CATEGORIES.map((cat, i) => {
              const start = 0.16 + i * 0.13;
              const t = Math.min(1, Math.max(0, (portP - start) / 0.26));
              const eased = 1 - Math.pow(1 - t, 3);
              const col = i % 2;
              const row = i < 2 ? 0 : 1;
              const dx = (col === 0 ? 1 : -1) * (1 - eased) * 190;
              const dy = (row === 0 ? 1 : -1) * (1 - eased) * 120;
              const scale = 0.84 + 0.16 * eased;
              const borderColor = t > 0.98 ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.04)';

              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenCategory(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenCategory(i);
                    }
                  }}
                  className="relative flex cursor-pointer flex-col gap-[clamp(14px,2vh,22px)] overflow-hidden rounded-[18px] border bg-[linear-gradient(168deg,#1B1E24,#141619)] px-[clamp(28px,2.6vw,40px)] py-[clamp(28px,3.4vh,44px)] text-left transition-[opacity,transform,border-color] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:border-orange/50"
                  style={{
                    borderColor,
                    opacity: t,
                    transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(3)})`,
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,#FF9A5C,transparent_60%)]" />
                  <div className="font-heading text-[10.5px] font-medium tracking-[0.14em] text-[#5a5a5a]">
                    {String(i + 1).padStart(2, '0')} / {String(CATEGORIES.length).padStart(2, '0')}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
