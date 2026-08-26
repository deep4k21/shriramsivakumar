import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { ROLES } from '../data/content';
import { useExitStyle } from '../hooks/useExitStyle';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { CARD } from '../styles/card';
import { CardGlow } from './CardGlow';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

export function Career() {
  const [companyIdx, setCompanyIdx] = useState(0);
  const role = ROLES[companyIdx];

  // Now that career pins, it has a scroll window of its own — the exit rides
  // that rather than the runway, so the copy holds while the section is in full
  // view and only clears as it unpins, matching every other section.
  const { ref, progress } = useSectionScroll<HTMLElement>();
  const exit = useExitStyle(progress, { start: 0.72, end: 0.94 });
  // The academic card is the closing ghost's source, so its box clears a beat
  // later than its contents — once the outline has lifted off, the card sitting
  // there reads as a duplicate of what is now growing into the modal. Layout is
  // untouched, so the ghost can still measure it while invisible.
  const cardBoxExit = useExitStyle(progress, { start: 0.9, end: 1, shift: 0 });

  // Pinned like the other sections: a tall outer section gives the scroll
  // something to travel through while the inner `sticky top-0` child holds the
  // content still in full view. The content itself is one viewport tall and
  // centred in it, so it stays balanced on any screen height.
  return (
    <section ref={ref} id="career" className="relative h-[200vh] border-t border-white/6">
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-[clamp(20px,3.5vh,36px)] overflow-hidden px-gutter py-[clamp(20px,4vh,56px)] pl-gutter-nav">
      <motion.div className="font-body text-[11px] tracking-[0.18em] text-teal" style={exit}>
        03 · CAREER JOURNEY
      </motion.div>

      {/*
        The academic card is the closing ghost's source, so the box itself holds
        its position and opacity — only what's inside it clears.
      */}
      <motion.div
        data-career-first-card
        className={`group relative flex flex-col gap-1.75 overflow-hidden ${CARD} px-8 py-7`}
        style={cardBoxExit}
      >
        <CardGlow />
        <motion.div className="flex flex-col gap-1.75" style={exit}>
          <div className="font-body text-[11px] tracking-[0.16em] text-teal">ACADEMIC</div>
          <div className="font-heading text-[22px] font-semibold tracking-[-0.01em] text-white">
            B.Sc., Visual Communication
          </div>
          <div className="font-body text-[15px] text-grey">
            SRM Institute of Science and Technology, Chennai
          </div>
        </motion.div>
      </motion.div>

      <motion.div className={`group relative flex flex-col overflow-hidden ${CARD}`} style={exit}>
        <CardGlow />
        <div className="flex items-stretch gap-1.5 overflow-x-auto overflow-y-hidden px-1.5 pt-1.5">
          {ROLES.map((r, i) => {
            const on = companyIdx === i;
            return (
              <motion.button
                key={r.name}
                type="button"
                onClick={() => setCompanyIdx(i)}
                title={r.name}
                aria-label={r.name}
                aria-pressed={on}
                className="flex h-11.5 flex-none cursor-pointer items-center justify-center rounded-t-lg px-6"
                animate={{
                  backgroundColor: on ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,0)',
                  boxShadow: on ? 'inset 0 -1px 0 0 rgba(137,145,159,0)' : 'inset 0 -1px 0 0 #89919F',
                }}
                transition={{ duration: 0.18 }}
              >
                <motion.img
                  src={r.logo}
                  alt={r.name}
                  className="h-5.5 w-auto object-contain"
                  animate={{ opacity: on ? 1 : 0.6 }}
                  transition={{ duration: 0.18 }}
                />
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={role.name}
            className="flex flex-col gap-5.5 px-9 py-8.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease: EASE_OUT }}
          >
            <div className="flex flex-wrap items-baseline gap-3.5">
              <div className="font-heading text-[25px] font-semibold tracking-[-0.015em] text-orange">
                {role.title}
              </div>
              <div className="font-body text-[13.5px] text-grey">{role.period}</div>
            </div>
            {role.progression && (
              <div className="flex flex-wrap items-center gap-2.5 font-heading text-[12.5px] font-medium text-green">
                {role.progression.join(' → ')}
              </div>
            )}
            <div className="flex flex-col gap-3.25">
              {role.bullets.map((runs, i) => (
                <motion.div
                  key={i}
                  className="grid grid-cols-[14px_1fr] items-start gap-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.045, ease: EASE_OUT }}
                >
                  <span className="font-body text-[15px]/[1.7] text-teal">·</span>
                  <span className="font-body text-[15.5px]/[1.7] text-grey text-pretty">
                    {runs.map((run, j) =>
                      run.strong ? (
                        <span key={j} className="font-bold text-white">
                          {run.text}
                        </span>
                      ) : (
                        <span key={j}>{run.text}</span>
                      ),
                    )}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
      </div>
    </section>
  );
}
