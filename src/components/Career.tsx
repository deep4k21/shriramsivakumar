import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { ROLES } from '../data/content';
import { useExitStyle } from '../hooks/useExitStyle';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { CARD_GLASS } from '../styles/card';
import { CardGlow } from './CardGlow';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

export function Career() {
  const [companyIdx, setCompanyIdx] = useState(0);
  const role = ROLES[companyIdx];

  // Now that career pins, it has a scroll window of its own — the exit rides
  // that rather than the runway, so the copy holds while the section is in full
  // view and only clears as it unpins, matching every other section.
  //
  // Reachable only under `prefers-reduced-motion` (or a scrollbar drag):
  // ordinarily `usePagedSnap` in App.tsx jumps straight from Career's settled
  // stop to playing the closing ghost, and this fade is never scrubbed. It
  // stays as the fallback for the one path that still free-scrolls through here.
  const { ref, progress } = useSectionScroll<HTMLElement>();
  const exit = useExitStyle(progress, { start: 0.72, end: 0.94 });
  // The academic card is the closing ghost's source, so its box clears a beat
  // later than its contents — once the outline has lifted off, the card sitting
  // there reads as a duplicate of what is now growing into the modal. Layout is
  // untouched, so the ghost can still measure it while invisible.
  const cardBoxExit = useExitStyle(progress, { start: 0.9, end: 1, shift: 0 });

  // Pinned like the other sections: a tall outer section gives the scroll
  // something to travel through while the inner `sticky top-0` child holds the
  // content still in full view.
  //
  // Shorter than the other pinned sections (110vh, not 300vh): this used to
  // carry a 70vh runway past it for the closing ghost to scrub through, which
  // is gone now that `usePagedSnap` plays that flight on its own clock instead
  // of scrubbing it. The height that's left is just enough room to pin and
  // hold the content steady, plus the exit-fade's own reduced-motion fallback
  // window above — any more than that was dead scroll space with nothing in
  // it, reachable only by a scrollbar drag since `usePagedSnap` already blocks
  // wheel and touch input from reaching past Career's own settled stop.
  return (
    <section ref={ref} id="career" className="relative h-[110vh] border-t border-white/6">
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-[clamp(20px,3.5vh,36px)] overflow-hidden px-gutter py-[clamp(20px,4vh,56px)] pl-gutter-nav">
      <motion.div className="font-body text-[11px] tracking-[0.18em] text-teal" style={exit}>
        CAREER JOURNEY
      </motion.div>

      {/*
        The academic card is the closing ghost's source, so the box itself holds
        its position and opacity — only what's inside it clears.
      */}
      <motion.div
        data-career-first-card
        className={`group relative flex flex-col gap-1.75 overflow-hidden ${CARD_GLASS} px-8 py-7`}
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

      {/*
        A browser tab strip: the outline runs up and around the selected
        company and back down into the panel, so the two read as one shape. The
        other three sit outside it, unbordered, as tabs waiting behind.

        The strip is not inside the bordered box — it sits above it, and the
        active tab drops onto the panel's top edge to cover that segment of
        border with its own fill. That break in the line is the whole effect.

        Nothing on this path may clip its overflow, or the tab's overhang is
        sliced off and the border reappears underneath it: not the panel
        (`overflow-hidden` moved to the content below) and not the strip, which
        is why it carries no `overflow-x-auto` despite being a row of tabs.
      */}
      <motion.div className="group relative flex flex-col" style={exit}>
        <div className="relative z-1 flex items-stretch gap-1.5">
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
                /*
                  The tab is pulled down over the panel's top border so its own
                  fill hides that segment, leaving the outline open between the
                  tab's two sides — that break is the whole browser-tab effect.

                  Two pixels rather than one: the tab and the panel do not land
                  on the same device pixel at every zoom and viewport, so a 1px
                  overlap against a 1px border let the line show through under
                  the selected tab. The second pixel is covered by the panel's
                  own fill below it, so it costs nothing visually.

                  Inactive tabs keep a transparent border rather than none, so
                  switching does not shift anything by a pixel.
                */
                className="relative -mb-0.5 flex h-11.5 flex-none cursor-pointer items-center justify-center rounded-t-[10px] border border-b-0 px-6"
                /*
                  Opaque, unlike the glass panel below it: this fill is what
                  hides the panel's top border under the tab, and a translucent
                  one would let the line show straight through.

                  The colour is the glass panel's own resolved surface, sampled
                  from it rather than guessed: the tab has to match what it sits
                  on exactly, or the border it is meant to cover shows as a seam
                  along its bottom edge.
                */
                animate={{
                  backgroundColor: on ? 'rgb(41,43,49)' : 'rgba(255,255,255,0)',
                  borderColor: on ? 'rgba(137,145,159,.7)' : 'rgba(137,145,159,0)',
                }}
                transition={{ duration: 0.18 }}
              >
                <motion.img
                  src={r.logo}
                  alt={r.name}
                  className="h-5.5 w-auto object-contain"
                  animate={{ opacity: on ? 1 : 0.55 }}
                  transition={{ duration: 0.18 }}
                />
              </motion.button>
            );
          })}
        </div>

        {/*
          The panel proper. Its top-left corner is squared off only when the
          first tab is selected — the tab is sitting on that corner then, and a
          radius there would leave the outline visibly kinked.
        */}
        <div
          /*
            A min-height so switching companies does not resize the panel.
            Freshworks is the only role with a progression row, which made it
            40px taller than the other three and the whole card jumped when it
            was selected — 393px is that tallest role, so the shorter ones now
            pad out to it instead.

            A floor rather than a fixed height: a role whose copy wraps to an
            extra line on a narrow viewport can still grow past it, which is
            the right failure — text stays readable rather than being clipped.
          */
          className={`relative flex min-h-[393px] flex-col overflow-hidden ${CARD_GLASS} ${
            companyIdx === 0 ? 'rounded-tl-none' : ''
          }`}
        >
          <CardGlow />

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
        </div>
      </motion.div>
      </div>
    </section>
  );
}
