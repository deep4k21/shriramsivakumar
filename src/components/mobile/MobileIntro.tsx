import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { INTRO_SLIDES, INTRO_WORDS, RESUME_FILENAME, RESUME_HREF } from '../../data/content';
import { DownloadCircleIcon } from '../Icons';
import { PhotoFrame } from '../PhotoFrame';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/**
 * A block that fades and rises as it arrives on screen.
 *
 * Desktop scrubs these reveals off a pinned section's scroll progress, which
 * needs a section taller than the viewport that holds itself in place while
 * its contents animate. A phone scrolls normally, so the equivalent cue is
 * simply that the block has entered the viewport.
 *
 * `once`, so scrolling back up does not replay it — a reveal that re-fires
 * every time the reader passes reads as the page being unstable.
 */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The introduction, for a phone.
 *
 * Desktop stages this over 300vh of pinned scroll: the headline's words
 * reveal one at a time as the reader scrolls, a hand-drawn plane arcs across
 * them, and a photo frame cycles beside the copy. The choreography is the
 * section — but it is choreography that needs a scroll the page controls and
 * width for the two columns to sit side by side.
 *
 * Here the same content runs as one vertical column that reveals on entry.
 * The headline keeps its own line breaks and colour, the copy is unchanged,
 * and the photo set becomes a swipeable strip rather than an auto-cycling
 * frame — on a phone the pictures are worth browsing at the reader's pace
 * rather than watching.
 */
export function MobileIntro() {
  const [slide, setSlide] = useState(0);
  // Where the current swipe began, or null when no pointer is down.
  const swipeStart = useRef<number | null>(null);
  const current = INTRO_SLIDES[slide];

  return (
    <section id="intro" className="flex flex-col gap-9 px-5 py-16">
      <Reveal>
        <div className="flex flex-col gap-1">
          <div className="font-heading text-[clamp(16px,4.6vw,20px)] font-bold text-grey">From</div>
          {/*
            The headline's own words and colours, from the same `INTRO_WORDS`
            desktop reveals one at a time. Rendered as a single block here:
            the per-word reveal is driven by scroll progress through a pinned
            section, and without that it would be five separate timers
            animating a five-word line — busier than the line is long.

            The teal phrase breaks per word as the design has it, but the
            closing "I'm Shriram" stays on one line: it is one clause, and
            splitting it put "I'm" alone on a line above a single word, which
            read as two fragments rather than the sentence ending.
          */}
          <h1 className="m-0 flex flex-col items-start font-heading text-[clamp(30px,9vw,44px)]/[1.14] font-bold tracking-[-0.03em]">
            {INTRO_WORDS.filter((w) => w.variant === 'teal').map((w) => (
              <span key={w.text} className="text-teal">
                {w.text}
              </span>
            ))}
            {/*
              "I'm Shriram" on its hand-drawn scale, as desktop sets it —
              the drawing behind the words rather than the plain white line
              the mobile version had.

              Built the same way: the scale is a background on a positioned
              box, with the name centred on the drawing's own optical middle
              (61.2% down, 43.9% across — the punch hole cuts the usable
              width short of centre). Because the name is positioned it gives
              the line no height, so an invisible copy of the same string
              underneath restores it and stops the copy below riding up.
            */}
            {/*
              Left-aligned with the teal words above it, not centred: the
              heading is a single left-ranged block, and centring only this
              line set it adrift from the phrase it finishes.

              `self-start` rather than inheriting the column's alignment,
              because the drawing is wider than the words it sits behind — a
              stretched item would centre the box and take the name with it.
            */}
            <span className="relative mt-[0.55em] block self-start">
              <span
                /*
                  Anchored at the left edge and running rightward, as desktop
                  has it — not centred on the sizer. The drawing is wider than
                  the name it holds, so centring it pushed the whole scale
                  right of the heading's left margin and broke the line the
                  teal words establish.
                */
                className="pointer-events-none absolute top-1/2 left-0 aspect-705/196 w-[118%] -translate-y-1/2 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/Intro/NameScale.svg')" }}
              >
                <span className="font-accent absolute top-[61.2%] left-[43.9%] block w-max -translate-x-1/2 -translate-y-1/2 leading-none font-bold whitespace-nowrap text-white">
                  I&rsquo;m Shriram
                </span>
              </span>
              <span
                aria-hidden="true"
                className="font-accent invisible block leading-none font-bold whitespace-nowrap"
              >
                I&rsquo;m Shriram
              </span>
            </span>
          </h1>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="flex flex-col gap-2.5">
          <p className="m-0 font-body text-[15px]/[1.7] font-bold">
            <span className="text-orange">Designer by profession,</span>{' '}
            <span className="text-green">traveler by instinct.</span>
          </p>
          <p className="m-0 font-body text-[15px]/[1.7] text-grey text-pretty">
            <span className="font-bold text-white">Nine years</span> designing SaaS products,
            interfaces, and the brand systems that hold them together. I&rsquo;ve worked with teams
            in{' '}
            <span className="font-bold text-white">India, Europe, the Middle East, Japan and ANZ</span>
            , which is where most of what I know actually came from.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        {/*
          The same resume button, minus its paper-plane flight: that animation
          measures a launch point against the desktop layout and flies across
          it, and there is no such distance here for it to travel.
        */}
        <a
          href={RESUME_HREF}
          download={RESUME_FILENAME}
          className="inline-flex items-center gap-3 rounded-xl border border-teal bg-[#005961]/10 py-3 pr-4 pl-5 font-heading text-[15px] font-bold text-teal no-underline"
        >
          Download my Resume
          <DownloadCircleIcon size={24} className="flex-none text-teal" />
        </a>
      </Reveal>

      <Reveal delay={0.18}>
        {/*
          The desktop photo frame itself — the taped-up print with its drawn
          border, caption bar and slide picker — rather than a plain rounded
          image. It already takes everything this needs as props, including
          the picker's `onSelect`, so the mobile version only has to drive it.

          Swiped rather than auto-cycling: on a phone the natural way through
          a set of pictures is a swipe, and a timer would otherwise move the
          photo out from under a reader mid-look.

          The swipe reads raw pointer events rather than motion's `drag`.
          `drag` with `dragConstraints` pinned to zero never reports an
          offset — the element is not allowed to move, so `onDragEnd` had
          nothing to measure and the gesture silently did nothing. Reading the
          pointer keeps the frame still, which is what the pinned constraint
          was for, while still measuring the swipe. `touch-pan-y` leaves
          vertical scrolling to the browser, so dragging up the page through
          the frame still scrolls.
        */}
        <div
          className="mx-auto w-[min(100%,320px)] touch-pan-y"
          /*
            The frame is built from images, and a horizontal press-and-move
            over one starts the browser's own image drag. That fires
            `dragstart` and then cancels the pointer sequence, so `pointerup`
            never arrives and the swipe was measured as nothing — traced as
            `pointerdown → dragstart → pointercancel`. Suppressing the native
            drag lets the sequence complete.
          */
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            swipeStart.current = e.clientX;
          }}
          onPointerUp={(e) => {
            const from = swipeStart.current;
            swipeStart.current = null;
            if (from === null) return;
            const dx = e.clientX - from;
            if (Math.abs(dx) < 50) return;
            const dir = dx < 0 ? 1 : -1;
            setSlide((i) => (i + dir + INTRO_SLIDES.length) % INTRO_SLIDES.length);
          }}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
        >
          <PhotoFrame
            caption={current.caption}
            index={slide}
            total={INTRO_SLIDES.length}
            image={current.image}
            video={current.video}
            onSelect={setSlide}
          />
        </div>
      </Reveal>
    </section>
  );
}
