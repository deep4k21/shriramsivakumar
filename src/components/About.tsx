import { useState } from 'react';
import { ABOUT_CHUNKS, AI_TOOLS, TOOLKIT } from '../data/content';
import { BriefcaseIcon, ChipIcon, CompassBearingIcon, LaptopIcon, RibbonIcon, WrenchIcon } from './Icons';

interface AboutProps {
  aboutIn: boolean;
}

const aboutWords = ABOUT_CHUNKS.flatMap((chunk) => chunk.text.split(' ').map((word) => ({ word, variant: chunk.variant })));

const WORD_VARIANT_CLASS: Record<string, string> = {
  body: 'font-heading font-light text-grey',
  strong: 'font-heading font-bold text-white',
  orange: 'font-heading font-semibold text-orange',
  green: 'font-heading font-semibold text-green',
};

const GRADIENT_CARD =
  'relative overflow-hidden rounded-[18px] border border-white/9 bg-[linear-gradient(168deg,#1B1E24,#141619)] shadow-[0_30px_70px_rgba(0,0,0,.55)]';

function AccentBar({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-0.5"
      style={{ background: `linear-gradient(90deg, ${color}, transparent 60%)` }}
    />
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
      <img src={icon} alt={name} className="size-10 cursor-pointer rounded-lg object-contain" />
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

export function About({ aboutIn }: AboutProps) {
  return (
    <section id="about" className="flex flex-col gap-[clamp(36px,5vh,64px)] px-gutter pt-[clamp(40px,7vh,80px)] pb-[clamp(80px,11vh,130px)] pl-gutter-nav">
      <div className="flex max-w-330 flex-col gap-[clamp(26px,3.6vh,48px)]">
        <div className="flex items-center gap-2.25 font-heading text-[11px] font-medium tracking-[0.18em] text-teal">
          <RibbonIcon />
          CONTEXT · WHERE THE WORK COMES FROM
        </div>
        <p className="m-0 max-w-270 text-[clamp(26px,3.1vw,44px)] leading-[1.32] tracking-[-0.02em] text-pretty">
          {aboutWords.map((w, i) => (
            <span
              key={`${w.word}-${i}`}
              className={`${WORD_VARIANT_CLASS[w.variant]} transition-opacity duration-500 ease-in-out`}
              style={{ opacity: aboutIn ? 1 : 0.08, transitionDelay: `${(i * 0.035).toFixed(3)}s` }}
            >
              {w.word}{' '}
            </span>
          ))}
        </p>
      </div>

      <div
        className="grid max-w-330 gap-[clamp(16px,1.8vw,24px)]"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
      >
        <div className={`${GRADIENT_CARD} flex flex-col gap-2.25 px-8 py-7.5`}>
          <AccentBar color="#00B8C9" />
          <div className="flex items-center gap-2.25 font-heading text-[11px] font-medium tracking-[0.16em] text-teal">
            <LaptopIcon />
            WHAT I’M DOING NOW
          </div>
          <div className="font-heading text-xl font-semibold tracking-[-0.01em] text-orange">
            Leading UI/UX inside enterprise marketing teams
          </div>
          <p className="m-0 font-body text-[14.5px]/[1.7] text-grey">
            Dashboards, mobile apps and design systems for clients across{' '}
            <span className="font-body font-bold text-orange">India and the Middle East</span>.
          </p>
        </div>
        <div className={`${GRADIENT_CARD} flex flex-col gap-2.25 px-8 py-7.5`}>
          <AccentBar color="#47C89A" />
          <div className="flex items-center gap-2.25 font-heading text-[11px] font-medium tracking-[0.16em] text-teal">
            <CompassBearingIcon />
            CURRENTLY EXPLORING
          </div>
          <div className="font-heading text-xl font-semibold tracking-[-0.01em] text-green">
            Speculative rebrands and motion systems
          </div>
          <p className="m-0 font-body text-[14.5px]/[1.7] text-grey">
            Asking what <span className="font-body font-bold text-green">iconic brands</span> would look like if they
            were built today.
          </p>
        </div>
        <div className={`${GRADIENT_CARD} flex flex-col gap-2.25 px-8 py-7.5`}>
          <AccentBar color="#FF9A5C" />
          <div className="flex items-center gap-2.25 font-heading text-[11px] font-medium tracking-[0.16em] text-teal">
            <BriefcaseIcon />
            OPEN TO
          </div>
          <div className="font-heading text-xl font-semibold tracking-[-0.01em] text-orange">
            Senior product &amp; visual design roles
          </div>
          <p className="m-0 font-body text-[14.5px]/[1.7] text-grey">
            Startups and enterprises building something that needs{' '}
            <span className="font-body font-bold text-orange">a system, not a skin</span>.
          </p>
        </div>
      </div>

      <div className="grid max-w-330 gap-[clamp(16px,1.8vw,24px)]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        <div className={`${GRADIENT_CARD} flex flex-col gap-5 px-7.5 py-7`}>
          <AccentBar color="#00B8C9" />
          <div className="flex items-baseline justify-between gap-3.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.25 font-heading text-[17px] font-semibold text-teal">
                <WrenchIcon />
                My toolkit
              </div>
              <div className="font-body text-[13.5px] text-grey">The tools I use to design, prototype and ship.</div>
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
        <div className={`${GRADIENT_CARD} flex flex-col gap-5 px-7.5 py-7`}>
          <AccentBar color="#FF9A5C" />
          <div className="flex items-baseline justify-between gap-3.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.25 font-heading text-[17px] font-semibold text-teal">
                <ChipIcon />
                AI workflow
              </div>
              <div className="font-body text-[13.5px] text-grey">Where AI speeds up ideation and execution.</div>
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
      </div>
    </section>
  );
}
