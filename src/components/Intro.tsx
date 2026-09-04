import { motion, useTransform } from 'motion/react';
import { useState } from 'react';
import { INTRO_SLIDES, INTRO_WORDS } from '../data/content';
import { useExitStyle } from '../hooks/useExitStyle';
import { usePortfolioFit } from '../hooks/usePortfolioFit';
import { useRevealStyle } from '../hooks/useRevealStyle';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { DownloadCircleIcon } from './Icons';
import { PhotoFrame } from './PhotoFrame';
import { ResumeFlight } from './ResumeFlight';

/*
 * The reveal is compressed into the first half of the window so the section has
 * a real settled stretch afterwards: fully revealed, not yet fading, with the
 * reader free to sit on it. Previously the copy finished at 0.86 and the exit
 * began at 0.88, leaving barely 2% of the window at rest — the content arrived
 * and immediately started leaving.
 */
const HEAD_END = 0.42;
const BODY_START = 0.44;
const BODY_END = 0.62;
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
  const [flightPath, setFlightPath] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
  } | null>(null);

  const bodyReveal = useRevealStyle(progress, { start: BODY_START, end: BODY_END });
  const panelReveal = useRevealStyle(progress, { start: 0, end: PANEL_END });
  // Appears alongside "From" (slot 0), a beat after the word itself so the
  // doodle reads as pointing at the heading rather than competing with the text.
  const doodleReveal = useRevealStyle(progress, {
    start: WORD_SPAN * 0.4,
    end: WORD_SPAN * 1.3,
    shift: 12,
  });
  // Clears the copy off screen before the ghost outline departs for about at
  // progress 1.0. Opens just after BODY_END so it isn't fighting the body's own
  // reveal.
  const exit = useExitStyle(progress, { start: 0.94, end: 1 });
  // The panel's own box goes too, a beat behind its contents: once the outline
  // has lifted off, leaving the card sitting there reads as a duplicate of the
  // thing that is now flying away. It stays in the DOM at full size — the ghost
  // measures this element live every frame to know where it is departing from —
  // so only its paint is dropped, not its layout.
  const panelBoxExit = useExitStyle(progress, { start: 0.95, end: 1, shift: 0 });
  const panelOpacity = useTransform(
    [panelReveal.opacity, panelBoxExit.opacity],
    ([reveal, out]: number[]) => reveal * out,
  );
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%']);
  const progressOpacity = useTransform(progress, [0.8, 1], [1, 0], { clamp: true });

  const prevSlide = () => setSlideIdx((i) => (i + INTRO_SLIDES.length - 1) % INTRO_SLIDES.length);
  const nextSlide = () => setSlideIdx((i) => (i + 1) % INTRO_SLIDES.length);

  return (
    <>
      <section ref={ref} id="intro" className="relative h-[300vh] border-t border-white/6">
      <div className="sticky top-0 box-border flex h-screen flex-col justify-center overflow-hidden px-gutter py-[clamp(24px,4vh,48px)] pl-gutter-nav">
        <div
          className="grid w-full items-center gap-[clamp(36px,4.5vw,76px)]"
          style={{
            // The right column caps the photo frame's size — the frame fills
            // the square panel, so this number is its width. Held in `vh` as
            // well as px so a short viewport shrinks it rather than pushing the
            // frame past the fold; 730 is the ceiling on a tall screen.
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(280px, min(730px, 72vh))',
            transform: `scale(${fit.toFixed(3)})`,
            transformOrigin: 'center left',
          }}
        >
          {/*
            Three groups — heading, body copy, CTA — spaced evenly by one shared
            gap. "From" belongs to the heading group rather than floating on its
            own, so the pairing reads as the Figma has it.
          */}
          <motion.div className="flex flex-col items-start gap-[clamp(26px,4.4vh,46px)]" style={exit}>
            <div className="flex flex-col items-start gap-[clamp(2px,0.4vh,6px)]">
              <RevealWord
                progress={progress}
                slot={0}
                className="font-heading text-[clamp(20px,2.2vw,36px)] font-bold text-grey"
              >
                From
              </RevealWord>

              <h1
                className="relative m-0 flex max-w-[17ch] flex-wrap text-[clamp(32px,4.4vw,70px)] leading-[1.14] tracking-[-0.03em]"
                style={{ columnGap: '0.26em', rowGap: '0.02em' }}
              >
                {/*
                  A hand-drawn plane and its arcing arrow, sitting over the
                  heading's own line: the plane starts above "Layovers" and the
                  arrow arcs down to land on "Layouts,". Sized and placed in `em`
                  so it tracks the heading's own type scale at any viewport
                  rather than drifting off the words. Purely decorative, so it
                  sits outside the reveal-word grid rather than taking a slot.
                */}
                <motion.img
                  src="/images/doodles/plane-arrow.svg"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute top-[-1.4em] left-[2em] w-[4.8em] max-w-full"
                  style={doodleReveal}
                />
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
            </div>

            {/*
              Measured in `ch`, so the line length holds as the type scales —
              the paragraph keeps a readable measure rather than stretching to
              the column's full 1120px.
            */}
            <motion.div className="flex max-w-[52ch] flex-col gap-2.5" style={bodyReveal}>
              <p className="m-0 font-body text-[clamp(13.5px,1.2vw,18.5px)]/[1.7] font-bold">
                <span className="text-orange">Designer by profession,</span>{' '}
                <span className="text-green">traveler by instinct.</span>
              </p>
              <p className="m-0 font-body text-[clamp(13.5px,1.2vw,18.5px)]/[1.7] text-grey text-pretty">
                Over <span className="font-bold text-white">9 years</span> designing SaaS products, UI/UX
                experiences, and scalable visual systems shaped by{' '}
                <span className="font-bold text-white">global perspective, curiosity,</span> and{' '}
                <span className="font-bold text-white">bold thinking.</span>
              </p>
            </motion.div>

            <motion.div style={bodyReveal}>
              <motion.a
                href="#"
                onClick={(e) => {
                  // `href="#"` would otherwise jump the page to the top the
                  // instant this fires, which shifts everything mid-measure
                  // and sends the plane from the wrong spot. There's no real
                  // resume file wired up yet, so this is a no-op destination
                  // for now regardless.
                  e.preventDefault();

                  // The plane launches from wherever the button actually is,
                  // so the animation still starts in the right place if the
                  // page has scrolled or the layout has reflowed.
                  const r = e.currentTarget.getBoundingClientRect();
                  setFlightPath({
                    // Starts on the button's own download icon rather than its
                    // edge, so the trail reads as leaving the thing clicked.
                    from: { x: r.right - 30, y: r.top + r.height / 2 },
                    /*
                      Runs right off the top edge, towards where browsers put
                      their downloads UI. The page cannot draw on that chrome —
                      it is outside the DOM — so the trail reaches the boundary
                      and stops there rather than claiming to land on it.
                    */
                    to: { x: window.innerWidth - 120, y: 0 },
                  });
                  // Clears the path once the flight has finished, so the same
                  // click can trigger it again rather than leaving it "used up".
                  window.setTimeout(() => setFlightPath(null), 2700);
                }}
                className="inline-flex items-center gap-3.5 rounded-xl border border-teal bg-[#005961]/10 py-3 pr-4 pl-5 font-heading text-[clamp(14px,1.15vw,19px)] font-bold text-teal"
                whileHover={{ y: -2, backgroundColor: 'rgba(0,184,201,0.1)' }}
                transition={{ duration: 0.2 }}
              >
                Download my Resume
                <DownloadCircleIcon size={26} className="flex-none text-teal" />
              </motion.a>
            </motion.div>
          </motion.div>

          {/*
            The photo frame itself, not a browser window holding one: the
            drawing carries its own border and tape, so the panel chrome that
            used to sit around it — the bar of dots, the bordered box, the
            footer rule — was a second frame around a frame.

            `data-card-travel-target` stays on the outer box. The hero's ghost
            flies into this element and the about ghost departs from it, both
            measuring it live, so the attribute has to ride whatever the panel
            becomes.
          */}
          <motion.div
            data-card-travel-target
            // Square, matching the Figma: the footprint tracks the left column
            // rather than the artwork dictating a wider, shorter box.
            className="relative flex aspect-square flex-col items-center justify-center gap-[clamp(10px,1.6vh,18px)]"
            style={{ ...panelReveal, opacity: panelOpacity }}
          >
            {/*
              One frame per slide, cross-fading. The drawing carries all of the
              furniture itself — label and counter on its top bar, arrows in its
              lower margin — so there is no separate row under the frame.

              Only the slide on screen gets the handlers: the others are still
              mounted for the cross-fade, and arrows on a hidden frame would sit
              under the cursor as dead targets.
            */}
            <motion.div className="relative min-h-0 w-full flex-1" style={exit}>
              {INTRO_SLIDES.map((slide, i) => (
                <motion.div
                  key={slide.caption}
                  className="absolute inset-0 flex min-h-0 items-center justify-center"
                  animate={{ opacity: i === slideIdx ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                  style={{ pointerEvents: i === slideIdx ? 'auto' : 'none' }}
                >
                  <PhotoFrame
                    caption={slide.caption}
                    image={slide.image}
                    video={slide.video}
                    index={i + 1}
                    total={INTRO_SLIDES.length}
                    onPrev={i === slideIdx ? prevSlide : undefined}
                    onNext={i === slideIdx ? nextSlide : undefined}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-5 left-gutter-nav flex items-center gap-3"
          style={{ opacity: progressOpacity }}
        >
          <div className="h-0.5 w-45 overflow-hidden bg-white/10">
            <motion.div className="h-full bg-teal" style={{ width: progressWidth }} />
          </div>
          <span className="font-heading text-[10.5px] font-medium tracking-[0.14em] text-[#A5AEBB]">
            KEEP SCROLLING
          </span>
        </motion.div>
      </div>
      </section>
      <ResumeFlight path={flightPath} />
    </>
  );
}
