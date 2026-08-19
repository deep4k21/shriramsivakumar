import { useState } from 'react';
import { HERO_STATS } from '../data/content';
import { useStatCycle } from '../hooks/useStatCycle';
import { useHomeGrid } from '../hooks/useHomeGrid';

interface HeroProps {
  flipOnHover: boolean;
}

// Toggle to try the floating image tiles straight (no tilt) vs the original
// slight-angle look. Flip back to `true` to restore the angled tiles.
const GRID_TILE_ROTATION_ENABLED = false;

export function Hero({ flipOnHover }: HeroProps) {
  const [flipped, setFlipped] = useState(false);
  const statIdx = useStatCycle(HERO_STATS.length);
  const stat = HERO_STATS[statIdx];
  const gridSlots = useHomeGrid(flipped ? 'travel' : 'design');

  const accent = flipped ? '#47C89A' : '#FF9A5C';

  const handleClick = () => setFlipped((v) => !v);
  const handleEnter = () => {
    if (flipOnHover) setFlipped(true);
  };
  const handleLeave = () => {
    if (flipOnHover) setFlipped(false);
  };

  return (
    <section
      id="home"
      className="relative flex h-screen w-full items-center justify-center overflow-hidden box-border px-0 py-[clamp(16px,3vh,40px)]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 max-[900px]:hidden" aria-hidden="true">
        {gridSlots.map((slot, i) => {
          const scatterX = slot.anchor.left != null ? -120 : 120;
          const scatterY = Number.parseFloat(slot.anchor.top) < 50 ? -80 : 80;
          const rotate = GRID_TILE_ROTATION_ENABLED ? slot.anchor.rotate : 0;
          return (
            <div
              key={i}
              className={
                slot.scattered
                  ? 'absolute overflow-hidden rounded-xl border border-white/8 bg-[#15171b] shadow-[0_18px_40px_rgba(0,0,0,.5)] transition-[opacity,transform] duration-480 ease-[cubic-bezier(.4,0,.7,1)]'
                  : 'absolute overflow-hidden rounded-xl border border-white/8 bg-[#15171b] shadow-[0_18px_40px_rgba(0,0,0,.5)] transition-opacity duration-400 ease-[cubic-bezier(.2,.7,.2,1)]'
              }
              style={{
                top: slot.anchor.top,
                left: slot.anchor.left,
                right: slot.anchor.right,
                width: slot.anchor.width,
                aspectRatio: '16 / 10',
                transform: slot.scattered
                  ? `translate(${scatterX}px, ${scatterY}px) rotate(${rotate * 2.4}deg) scale(0.7)`
                  : `translate(0, 0) rotate(${rotate}deg) scale(1)`,
                opacity: slot.visible ? 1 : 0,
              }}
            >
              <img src={slot.src} alt="" className="size-full object-cover opacity-70" />
            </div>
          );
        })}
      </div>

      <div className="relative z-1 flex h-full max-h-full flex-col items-center justify-center gap-[clamp(8px,1.5vh,16px)]">
        <div className="relative box-content w-[400px] max-w-[calc(100vw-40px)] px-[60px] py-[clamp(10px,2.5vh,26px)]">
          <div
            className="cursor-pointer [perspective:1500px]"
            style={{ width: '100%', height: 'clamp(340px, 58vh, 530px)' }}
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
            <div
              className="relative size-full [transform-style:preserve-3d] transition-transform duration-[850ms] ease-[cubic-bezier(.7,0,.2,1)]"
              style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* Front — design side */}
              <div
                className="absolute inset-0 isolate z-2 box-border flex min-h-0 flex-col items-center justify-center gap-[clamp(14px,3vh,26px)] overflow-hidden rounded-3xl border border-white/10 bg-white/4 px-7.5 py-[clamp(20px,5vh,40px)] shadow-[0_28px_64px_rgba(0,0,0,.6)] backdrop-blur-2xl backdrop-saturate-150 [backface-visibility:hidden]"
                style={{ transform: 'rotateY(0deg) translateZ(1px)' }}
              >
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(0deg,rgba(255,154,92,.32),rgba(255,154,92,0)_75%)]" />
                <div className="relative flex flex-col items-center gap-[clamp(8px,1.5vh,16px)]">
                  <div className="font-heading text-[clamp(22px,4vh,34px)] font-bold tracking-[-0.02em] text-white">
                    Shriram Sivakumar
                  </div>
                  <div className="rounded-[9px] border border-white/12 bg-black/30 px-5 py-2.5 font-body text-sm font-medium text-teal">
                    Visual &amp; UI/UX Designer
                  </div>
                </div>
              </div>

              {/* Back — travel side */}
              <div
                className="absolute inset-0 z-1 box-border flex min-h-0 flex-col justify-between overflow-hidden rounded-[20px] border border-green/16 bg-[#14201B] p-6.5 shadow-[0_28px_64px_rgba(0,0,0,.6)] [backface-visibility:hidden]"
                style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[length:32px_32px] bg-[image:linear-gradient(rgba(71,200,154,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(71,200,154,.03)_1px,transparent_1px)]" />
                <div className="relative flex items-start justify-between">
                  <span className="font-heading text-[10px] font-medium tracking-[0.16em] text-green">TRAVEL</span>
                  <span className="font-body text-[10px] tracking-[0.12em] text-teal">← BACK</span>
                </div>
                <div
                  className="relative grid w-full place-items-center rounded-xl border border-green/14 bg-[repeating-linear-gradient(115deg,#16211C,#16211C_8px,#1B2822_8px,#1B2822_16px)]"
                  style={{ height: 'clamp(80px, 18vh, 150px)' }}
                >
                  <span className="font-heading text-[9.5px] font-medium tracking-[0.1em] text-green">
                    DROP TRAVEL PHOTO
                  </span>
                </div>
                <div className="relative flex flex-col gap-3.5">
                  <div className="font-heading text-[21px]/[1.35] font-semibold tracking-[-0.01em] text-green">
                    Every trip is a research session.
                  </div>
                  <p className="m-0 font-body text-[13.5px]/[1.65] text-grey">
                    Signage in Osaka, wayfinding in Dubai, colour in Chennai. What I notice on the road ends up in
                    the interface.
                  </p>
                  <div className="flex flex-wrap gap-[7px]">
                    <span className="rounded-[7px] border border-green/18 bg-green/8 px-[11px] py-1.5 font-heading text-[11px] font-medium text-green">
                      14 countries
                    </span>
                    <span className="rounded-[7px] border border-green/18 bg-green/8 px-[11px] py-1.5 font-heading text-[11px] font-medium text-green">
                      Window seat
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient info boxes */}
          <div
            className="animate-boxin pointer-events-none absolute top-11 -left-14 z-6 flex items-center gap-2.5 rounded-xl border border-white/8 bg-surface px-4.5 py-3.5 shadow-[0_14px_34px_rgba(0,0,0,.5)] max-[640px]:hidden"
            style={{ animationDelay: '.15s' }}
          >
            <span className="grid size-[18px] flex-none place-items-center rounded-full border-[1.5px] border-grey font-body text-[10px]/[1] text-grey">
              ···
            </span>
            <span className="whitespace-nowrap font-body text-[13.5px] text-white">
              &ldquo;
              <span className="font-heading font-semibold" style={{ color: accent }}>
                {flipped ? 'Mid-flight' : 'Mid-iteration'}
              </span>
              {flipped ? ', mid-thought' : ' on a new layout'}&rdquo;
            </span>
          </div>

          <div
            className="animate-boxin pointer-events-none absolute top-[112px] -right-[70px] z-6 flex items-center gap-2.5 rounded-full border border-white/8 bg-surface px-4.5 py-2.75 shadow-[0_14px_34px_rgba(0,0,0,.5)] max-[640px]:hidden"
            style={{ animationDelay: '.3s' }}
          >
            <span className="whitespace-nowrap font-body text-[13.5px] text-white">
              &ldquo;
              <span className="font-heading font-semibold" style={{ color: accent }}>
                {flipped ? 'Currently' : 'Available'}
              </span>
              {flipped ? ' abroad' : ' for work'}&rdquo;
            </span>
            <span
              className="grid size-[18px] flex-none place-items-center rounded-full font-sans text-[11px]/[1] font-bold text-[#0d1211]"
              style={{ background: accent }}
            >
              ✓
            </span>
          </div>

          <div
            className="animate-boxin pointer-events-none absolute top-[264px] -left-16 z-6 w-44 rounded-xl border border-white/8 bg-surface px-[19px] py-4.25 shadow-[0_14px_34px_rgba(0,0,0,.5)] max-[640px]:hidden"
            style={{ animationDelay: '.45s' }}
          >
            <div className="relative mb-2.5 h-6.5 w-5.5 rounded-[3px] border-[1.5px] border-[#cfcfcf]">
              <span className="absolute -top-1 left-1.5 h-1.5 w-2.5 rounded-t-[2px] border-[1.5px] border-b-0 border-[#cfcfcf] bg-surface" />
            </div>
            <div
              className="font-heading text-[clamp(16px,4vw,26px)]/[1.15] font-bold tracking-[-0.02em] whitespace-nowrap transition-opacity duration-400"
              style={{ color: accent }}
            >
              {stat.value}
            </div>
            <div className="mt-1 font-body text-[13px]/[1.4] text-white">{stat.label}</div>
          </div>

          <div
            className="animate-boxin pointer-events-none absolute top-[280px] -right-[58px] z-6 w-[140px] rounded-xl border border-white/8 bg-surface px-4.5 py-3.75 shadow-[0_14px_34px_rgba(0,0,0,.5)] max-[640px]:hidden"
            style={{ animationDelay: '.6s' }}
          >
            <span className="font-body text-[13.5px]/[1.4] text-white">
              &ldquo;
              <span className="font-heading font-semibold" style={{ color: accent }}>
                {flipped ? 'Window seat' : 'Wireframe'}
              </span>
              {flipped ? ' to worldview' : ' to workflow'}&rdquo;
            </span>
          </div>
        </div>
      </div>
      <span className="absolute bottom-[clamp(20px,4vh,44px)] left-1/2 z-1 -translate-x-1/2 font-heading text-[10.5px] font-medium tracking-[0.1em] text-grey">
        {flipOnHover ? 'HOVER TO FLIP' : 'CLICK THE CARD TO FLIP'}
      </span>
    </section>
  );
}
