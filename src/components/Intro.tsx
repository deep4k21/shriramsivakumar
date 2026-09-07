import { motion, useTransform } from 'motion/react';
import { useState } from 'react';
import { INTRO_SLIDES, INTRO_WORDS, RESUME_FILENAME, RESUME_HREF } from '../data/content';
import { useExitStyle } from '../hooks/useExitStyle';
import { usePortfolioFit } from '../hooks/usePortfolioFit';
import { useRevealStyle } from '../hooks/useRevealStyle';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { DownloadCircleIcon } from './Icons';
import { PhotoFrame } from './PhotoFrame';
import { FLIGHT_ARRIVAL_MS, FLIGHT_TOTAL_MS, ResumeFlight } from './ResumeFlight';

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
  style: extraStyle,
  children,
}: {
  progress: ReturnType<typeof useSectionScroll>['progress'];
  slot: number;
  className?: string;
  /** Merged under the reveal's own animated values, for static properties. */
  style?: React.CSSProperties;
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
    <motion.span className={className} style={{ ...extraStyle, ...style }}>
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
                className="relative m-0 flex flex-col items-start text-[clamp(30px,3.6vw,58px)] leading-[1.14] tracking-[-0.03em]"
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
                {/*
                  Only the teal half runs as flowing words — the name has
                  moved into the ruler below, so it is filtered out here
                  rather than removed from `INTRO_WORDS`, which still drives
                  the shared reveal timing for every slot.
                */}
                <span className="flex flex-nowrap whitespace-nowrap" style={{ columnGap: '0.26em' }}>
                {INTRO_WORDS.map((word, i) =>
                  word.variant === 'teal' ? (
                    <RevealWord
                      key={word.text}
                      progress={progress}
                      slot={i + 1}
                      // "Layovers to Layouts," is Sora Regular — the contrast
                      // against the drawn name below is face, not weight.
                      className="font-heading font-normal text-teal"
                    >
                      {word.text}
                    </RevealWord>
                  ) : null,
                )}
                </span>

              {/*
                The name, written inside a drawn ruler.

                The ruler is a background image rather than an inline `<svg>`
                or an `<img>` with the text layered over it: the file is ~3MB
                of hand-drawn path data, so inlining it would put all of that
                in the document, and a positioned overlay would need the text
                re-measured against the artwork at every breakpoint.

                The box is sized by the name rather than the other way round,
                so the ruler wraps the text instead of the text floating in a
                fixed frame.

                The artwork keeps its own 705:196 proportions — it is a drawn
                object, and stretching it to whatever box the text makes both
                distorts the ticks and slides the punch hole inward, which is
                what put the last letter through the hole in an earlier pass.
                So the name sets the width, the height follows the ratio, and
                the text is positioned against fractions measured off the
                artwork itself: the body runs from 52 to 188 of its 196 units,
                and the punch hole sits at x 619-658 of 705.
              */}
              <RevealWord
                progress={progress}
                slot={INTRO_WORDS.length}
                className="relative mt-[0.56em] inline-block text-[clamp(34px,5.208vw,100px)]"
              >
                {/*
                  The name sets the size: at 121% of the text's width, the
                  span between the ruler's left border and its punch hole is
                  wide enough to hold the name with the hole still clear.
                  `aspect-ratio` then fixes the height from the artwork's own
                  705:196, so it scales without distortion.

                  Anchored at `left-0` so the ruler's left edge lines up with
                  the teal line above it; the name is nudged right instead, to
                  clear the drawn border rather than sitting on it.
                */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-0 -z-1 aspect-705/196 w-[121%] -translate-y-1/2 bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: "url('/images/Intro/NameScale.svg')" }}
                />
                {/*
                  Nudged down against the frame's centre line: the artwork's
                  open body is not vertically centred in its own box — the
                  tick band pushes it down — so its middle sits at about 61%
                  of the height rather than 50%.
                */}
                <span className="font-accent relative block translate-x-[0.16em] translate-y-[0.06em] leading-none font-bold whitespace-nowrap text-white">
                  I&rsquo;m Shriram
                </span>
              </RevealWord>
              </h1>
            </div>

            {/*
              Measured in `ch`, so the line length holds as the type scales —
              the paragraph keeps a readable measure rather than stretching to
              the column's full 1120px.
            */}
            {/*
              A little extra air above the body copy, on top of the column's
              shared gap: the ruler's drawn border ends much closer to its
              text than a type block's own line box would, so the default gap
              reads tighter here than it does between the other groups.
            */}
            <motion.div className="mt-[clamp(6px,1.1vh,14px)] flex max-w-[52ch] flex-col gap-2.5" style={bodyReveal}>
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
                href={RESUME_HREF}
                download={RESUME_FILENAME}
                onClick={(e) => {
                  /*
                    The browser's own navigation is cancelled and the download
                    re-issued below when the plane lands, so the file arrives
                    as the animation delivers it rather than a beat before it
                    has left. Letting the default through instead would open
                    the downloads shelf immediately and the flight would then
                    be narrating something already finished.

                    Cancelling also protects the measurement: the anchor still
                    carries a real `href`, and following it mid-click shifts
                    the layout the plane's launch point is read from.
                  */
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
                  /*
                    The save fires as the trail reaches the top edge — the
                    plane is carrying the file, so it lands when the plane
                    does. Driven from a hidden anchor rather than by letting
                    the click through, since the click is long over by then.

                    Immediate for a reader who has asked the OS for less
                    motion: `MotionConfig reducedMotion="user"` suppresses the
                    flight's animation, so the delay would be a wait with
                    nothing on screen to account for it.
                  */
                  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  window.setTimeout(() => {
                    const a = document.createElement('a');
                    a.href = RESUME_HREF;
                    a.download = RESUME_FILENAME;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }, still ? 0 : FLIGHT_ARRIVAL_MS);

                  // Clears the path once the flight has finished, so the same
                  // click can trigger it again rather than leaving it "used up".
                  window.setTimeout(() => setFlightPath(null), FLIGHT_TOTAL_MS);
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
                    onSelect={i === slideIdx ? setSlideIdx : undefined}
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
