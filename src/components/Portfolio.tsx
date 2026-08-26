import {
  AnimatePresence,
  cubicBezier,
  motion,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { CATEGORIES } from '../data/content';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useExitStyle } from '../hooks/useExitStyle';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { useStageAspect } from '../hooks/useStageAspect';
import { CARD } from '../styles/card';
import { CardGlow } from './CardGlow';
import { CategoryExpanded } from './CategoryExpanded';
import { StylusNoteIcon } from './Icons';

interface PortfolioProps {
  onOpenProject: (categoryIndex: number, projectIndex: number) => void;
  /** The expanded category, or null. Lifted to App so the sidebar can open one too. */
  openIdx: number | null;
  setOpenIdx: (idx: number | null) => void;
  /**
   * True while a case study is open over the page. Escape should step back one
   * level at a time, so the expanded category ignores it while that is up.
   */
  overlayOpen: boolean;
}

const EASE = cubicBezier(0.33, 1, 0.68, 1);

/**
 * Three phases, all scrubbed off the pinned section's progress:
 *
 *  1. HEAD  — the green panel fills the stage and carries the section headline.
 *  2. SHRINK — the headline drops away and the panel contracts to a centred
 *              mark, clearing the space the grid will occupy.
 *  3. CARDS  — the four category cards fly in from off-stage and settle into
 *              the quadrants around the mark.
 *
 * The phases overlap substantially: the panel is already shrinking as the copy
 * fades, and the cards are well into their approach while the mark is still
 * travelling to the centre. That shared middle is the point — the two movements
 * read as one composition assembling itself, rather than as a sequence of
 * separate steps with a dead beat between them.
 */
/**
 * The phases span the whole window — everything is settled by CARDS.end, so any
 * progress left over past it would be scroll that moves nothing before the next
 * section arrives.
 */
const HEAD = { start: 0.0, end: 0.2 } as const;
const SHRINK = { start: 0.18, end: 0.55 } as const;
const CARDS = { start: 0.4, end: 0.98 } as const;

/**
 * How long the headline takes to clear once the collapse begins. The icon holds
 * on the eyebrow line until this is done, so the copy is gone before the mark
 * starts travelling — otherwise the two read as competing movements.
 */
const HEAD_FADE = 0.1;

/**
 * How far the page can scroll from where a category was opened before it
 * retracts — a little under half a viewport, so a small nudge is tolerated but
 * a deliberate scroll away closes the card while it is still on screen.
 *
 * This is a scroll *distance*, not a position in the section: the section is
 * 420vh and the stage stays pinned for all of it, so scrolling up from the end
 * leaves 3200px of travel where a bounds-based check would keep the card open
 * with the mosaic scrubbing behind it.
 */
const RETRACT_DISTANCE_VH = 0.45;

/**
 * The section-progress band the card also stays inside. Scrolling down has a
 * hard edge — the section simply ends — so this closes the card right at that
 * boundary instead of waiting out the full scroll distance.
 */
const RETRACT_EXIT = 1.03;

/**
 * The full-size card's height, as a share of the stage.
 *
 * Kept well under 1 so the card reads as a contained panel with its content
 * filling it, rather than a full-bleed sheet with a large empty middle. Its
 * width follows from `PANEL_ASPECT`.
 */
const PANEL_HEIGHT_OF_STAGE = 0.78;
/** Width ÷ height of the full-size card — near-square, matching the card design. */
const PANEL_ASPECT = 1.08;

/**
 * Panel scale at full size and once collapsed.
 *
 * The collapse targets are shares of the *stage*, while `scale` is a ratio
 * against the card's own size — so each is divided by what the card already
 * occupies on that axis. `MARK_OF_STAGE` is the share the mark ends up
 * covering, and the mosaic's centre hole uses it too.
 */
const PANEL_FULL = 1;
/**
 * The mark's height, as a share of the stage. Height is the reference because
 * the stage is wider than it is tall — sizing from the short axis is what keeps
 * the mark inside the stage at any viewport.
 */
const MARK_OF_STAGE = 0.16;

/** Fallback used for the first paint, before the spacer can be measured. */
const ICON_HOME_FALLBACK = { left: 5.7, top: 27.2 };

/**
 * Whether the section has scrolled far enough into view to show its panel.
 *
 * Tracks visibility in both directions rather than latching on first entry, so
 * scrolling back up hides the panel again and the reveal replays on the way
 * back down — otherwise the empty card is left drawn above the section.
 */
function useEnteredView(selector: string) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = document.querySelector(selector);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntered(entry.isIntersecting),
      // Trigger only once the panel is most of the way up the viewport, not
      // when its top edge first clips the bottom. The panel is nearly a full
      // viewport tall, so an edge-crossing trigger draws the empty card while
      // the previous section is still the thing being read.
      //
      // The large bottom margin shrinks the observed region to the upper part
      // of the screen: the panel has to actually arrive there to count.
      { rootMargin: '0px 0px -70% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selector]);

  return entered;
}

/**
 * Where the icon rests before it travels, as a percentage of the panel.
 *
 * Read from the spacer held open in the eyebrow line, so the mark sits on that
 * line at every breakpoint — the headline's clamped type and leading move the
 * eyebrow relative to the panel, so a fixed percentage only lands at the
 * viewport it was measured on.
 */
function useIconHome() {
  const [home, setHome] = useState(ICON_HOME_FALLBACK);

  useEffect(() => {
    const measure = () => {
      const panel = document.querySelector('[data-portfolio-panel]');
      const spacer = document.querySelector('[data-icon-home]');
      if (!panel || !spacer) return;

      const p = panel.getBoundingClientRect();
      const s = spacer.getBoundingClientRect();
      if (p.width === 0 || p.height === 0) return;

      // The headline animates in on a `y` transform, and this runs on mount
      // while that offset is still applied. The icon renders at the panel level
      // and doesn't inherit it, so subtract it to get the settled position.
      const head = spacer.closest('[data-portfolio-head]');
      const headY = head ? new DOMMatrixReadOnly(getComputedStyle(head).transform).m42 : 0;

      // The panel is scaled during the collapse, but this only ever runs while
      // it is still at full size, so its box needs no unscaling.
      setHome({
        left: ((s.left + s.width / 2 - p.left) / p.width) * 100,
        top: ((s.top + s.height / 2 - headY - p.top) / p.height) * 100,
      });
    };

    // The eyebrow's position depends on fonts resolving, so measure again as
    // things settle and whenever the layout can change.
    const raf = requestAnimationFrame(measure);
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return home;
}

/**
 * The mosaic: tiles of unequal size packed around the centre mark, rather than
 * four matching quadrants.
 *
 * The stage is a 3×3 grid whose middle cell is left free for the collapsed
 * panel. Each tile claims a different-shaped block around it — two wide
 * banners, two tall columns — pinwheeling around the centre so the arrangement
 * reads as a composed layout instead of a table.
 *
 * `origin` is where each tile flies in from, as a multiple of the stage, chosen
 * to match the edge it sits against so the movement converges inward.
 *
 * `wide` marks the short, wide tiles. Their copy leaves a lot of empty space to
 * the right, so the "Open" link moves to the bottom-right corner to sit in it
 * rather than leaving the tile visually lopsided.
 */
const MOSAIC = [
  { area: '1 / 1 / 2 / 3', origin: { x: -1.15, y: -0.7 }, wide: true },
  { area: '1 / 3 / 3 / 4', origin: { x: 1.2, y: -0.9 }, wide: false },
  { area: '2 / 1 / 4 / 2', origin: { x: -1.3, y: 0.8 }, wide: false },
  { area: '3 / 2 / 4 / 4', origin: { x: 1.15, y: 0.8 }, wide: true },
] as const;

/**
 * One accent per tile: the three brand colours plus a violet so the four read
 * as a set rather than a repeat.
 *
 * `ink` is the text colour used once the fill has landed — chosen against each
 * accent rather than assumed, since the light fills need dark type to stay
 * legible and the darker one needs the opposite.
 */
export const CARD_ACCENT = [
  { fill: '#00B8C9', ink: '#08191C' },
  { fill: '#FF9A5C', ink: '#241004' },
  { fill: '#47C89A', ink: '#062016' },
  { fill: '#A374FF', ink: '#150A2B' },
] as const;

function CategoryCard({
  progress,
  index,
  onOpen,
  hidden,
}: {
  progress: MotionValue<number>;
  index: number;
  onOpen: () => void;
  /** True while another tile is expanded over the stage. */
  hidden: boolean;
}) {
  const cat = CATEGORIES[index];
  const accent = CARD_ACCENT[index % CARD_ACCENT.length];

  /*
   * The fill grows from wherever the pointer entered, so the colour reads as
   * having been pushed into the card by the cursor rather than cross-fading in.
   *
   * The origin is captured on enter and held for the whole transition — letting
   * it track the pointer would drag the circle's centre around mid-grow, which
   * looks like the fill sliding rather than expanding. A radius of 150% of the
   * card's diagonal guarantees the far corner is covered from any origin.
   */
  const [fill, setFill] = useState<{ x: number; y: number } | null>(null);
  const filled = fill !== null;
  // All four converge together over the whole cards phase rather than arriving
  // in sequence — the mosaic reads as one composition assembling around the
  // mark, not as four separate entrances.
  const start = CARDS.start;
  const span = CARDS.end - CARDS.start;
  const range: [number, number] = [start, start + span];

  const { origin, wide } = MOSAIC[index];
  const opacity = useTransform(progress, [start, start + span * 0.3], [0, 1], { clamp: true });
  const x = useTransform(progress, range, [`${origin.x * 100}%`, '0%'], { clamp: true, ease: EASE });
  const y = useTransform(progress, range, [`${origin.y * 100}%`, '0%'], { clamp: true, ease: EASE });
  const scale = useTransform(progress, range, [0.9, 1], { clamp: true, ease: EASE });

  return (
    // Two layers: the outer one carries the scroll-driven entrance, the inner
    // one the layout morph and the fade-out while another tile is expanded.
    // They are separate elements because `opacity` here is a MotionValue driven
    // by scroll and cannot also be animated by state.
    <motion.div className="size-full" style={{ opacity, x, y, scale }}>
      <motion.div
        layoutId={`category-${index}`}
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        onPointerEnter={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setFill({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onPointerLeave={() => setFill(null)}
        className={`group relative flex size-full cursor-pointer flex-col gap-[clamp(10px,1.4vh,16px)] overflow-hidden ${CARD} px-[clamp(20px,2vw,32px)] py-[clamp(18px,2.4vh,30px)] text-left`}
        animate={{ opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        style={{ pointerEvents: hidden ? 'none' : 'auto' }}
      >
      {/*
        The colour itself: a circle centred on the pointer's entry point,
        scaling up to cover the card. It sits behind the copy (`-z-10` against
        the content's own stacking) and is `pointer-events-none` so it never
        interrupts the click that opens the category.
      */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          backgroundColor: accent.fill,
          // Sized to the card's diagonal so the far corner is reached from any
          // origin; positioned so the circle's own centre sits on the pointer.
          width: '250%',
          aspectRatio: '1',
          left: fill ? fill.x : '50%',
          top: fill ? fill.y : '50%',
          x: '-50%',
          y: '-50%',
        }}
        initial={false}
        animate={{ scale: filled ? 1 : 0, opacity: filled ? 1 : 0 }}
        transition={{
          scale: { duration: 0.52, ease: [0.22, 0.61, 0.24, 1] },
          opacity: { duration: filled ? 0.12 : 0.3 },
        }}
      />

      {/*
        Everything below sits above the fill and recolours to the accent's ink
        once it has landed, so the card reads as one solid block of colour
        rather than the old grey type over a new background.
      */}
      <motion.div
        className="relative font-heading text-[10.5px] font-medium tracking-[0.14em]"
        animate={{ color: filled ? accent.ink : '#5a5a5a' }}
        transition={{ duration: 0.18 }}
      >
        {String(index + 1).padStart(2, '0')} / {String(CATEGORIES.length).padStart(2, '0')}
      </motion.div>
      <motion.div
        className="relative font-heading text-[clamp(20px,2vw,34px)]/[1.15] font-semibold tracking-[-0.02em]"
        animate={{ color: filled ? accent.ink : '#FF9A5C' }}
        transition={{ duration: 0.18 }}
      >
        {cat.title}
      </motion.div>

      {/*
        On the wide tiles the copy and the link share a row pinned to the bottom
        of the card, so the link sits on the same baseline as the tall tiles'
        rather than floating mid-card above a band of empty space.

        The tall tiles keep the stacked layout, where a spacer pins the link to
        the bottom of the column.
      */}
      <div
        className={
          wide
            ? 'relative flex min-h-0 flex-1 items-end justify-between gap-6'
            : 'relative flex min-h-0 flex-1 flex-col'
        }
      >
        <motion.p
          className="m-0 max-w-[38ch] font-body text-[clamp(13px,1vw,16px)]/[1.65] text-pretty"
          animate={{ color: filled ? accent.ink : '#808080' }}
          transition={{ duration: 0.18 }}
        >
          {cat.lead}{' '}
          <motion.span
            className="font-bold"
            animate={{ color: filled ? accent.ink : '#ffffff' }}
            transition={{ duration: 0.18 }}
          >
            {cat.leadBold}
          </motion.span>
        </motion.p>
        {!wide && <div className="flex-1" />}
          <motion.div
            className="flex flex-none items-center gap-2.25 font-body text-[clamp(12.5px,0.95vw,15px)]"
            animate={{ color: filled ? accent.ink : '#00B8C9' }}
            transition={{ duration: 0.18 }}
          >
            Open <span className="font-bold">{cat.short}</span> <span className="text-[15px]">→</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Portfolio({ onOpenProject, overlayOpen, openIdx, setOpenIdx }: PortfolioProps) {
  const { ref, progress } = useSectionScroll<HTMLElement>();

  // Clears the mosaic before the ghost leaves the collapsed mark for career at
  // progress 1.02 (TO_CAREER in PortfolioTravelGhosts). The mark itself is the
  // ghost's source, so it keeps its own choreography and is exempt.
  const exit = useExitStyle(progress, { start: 0.94, end: 1 });

  // Which tile is expanded over the stage. Owned by App rather than here: the
  // sidebar's category list opens these too, so both need the same state.
  const closeCategory = useCallback(() => setOpenIdx(null), [setOpenIdx]);
  // Only collapse on Escape when nothing is layered above, so the key steps
  // back one level rather than closing the case study and the category at once.
  useEscapeKey(
    useCallback(() => {
      if (!overlayOpen) setOpenIdx(null);
    }, [overlayOpen, setOpenIdx]),
  );

  // The panel is on screen well before the section pins — it slides up into
  // view while the headline is still hidden, which reads as an empty card
  // sitting there waiting. Reveal it as it enters instead, the way every other
  // section introduces its content. This runs off viewport entry rather than
  // `progress`, which is clamped at 0 until the section pins.
  // Watch the stage, not the panel: the panel scales down to a small mark
  // mid-section and would fall out of the observed band, hiding itself and
  // everything on it. The stage holds its size and position for the whole pin.
  const entered = useEnteredView('[data-portfolio-stage]');

  // The stage's width ÷ height, measured live: it drives both the mosaic's
  // centre hole and the panel's collapsed width, so the two stay agreed on
  // where the square mark sits at any viewport.
  const stageAspect = useStageAspect('[data-portfolio-stage]');

  // Collapse an expanded category as soon as the reader scrolls away from the
  // section in either direction. Left open, the mosaic behind it keeps scrubbing
  // while an unrelated panel sits over the top, and the panel itself reads as
  // dead scroll on the way back to About.
  //
  // Measured as distance scrolled from where the card was opened, rather than
  // from the section's bounds. The stage is sticky and the section is 420vh, so
  // section-relative checks leave a long stretch — 3200px scrolling up from the
  // end — where the card stays open over a scrubbing mosaic.
  useEffect(() => {
    if (openIdx === null) return;

    const openedAt = window.scrollY;
    const limit = window.innerHeight * RETRACT_DISTANCE_VH;

    const check = () => {
      if (Math.abs(window.scrollY - openedAt) > limit) {
        setOpenIdx(null);
        return;
      }

      // Scrolling down also has a hard edge at the end of the section, which
      // arrives sooner than the distance limit — the cards finish settling just
      // before it, so there is nothing left to scroll past.
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      if (span > 0 && -r.top / span > RETRACT_EXIT) setOpenIdx(null);
    };

    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [openIdx, ref, setOpenIdx]);

  // The panel collapses from filling the stage to a small centred mark, holding
  // at full size until the headline has cleared. The icon is positioned as a
  // percentage of this panel, so it would drift as the panel contracts even
  // before its own travel begins — holding both keeps the mark still until the
  // copy is gone.
  const scaleRange: [number, number] = [SHRINK.start + HEAD_FADE, SHRINK.end];
  // A square mark on a stage that is wider than it is tall means the two axes
  // cannot both be `MARK_OF_STAGE` — that is a share of different lengths on
  // each axis, which is what left the collapsed card a rectangle. The height
  // share is authoritative; the width share is whatever makes the same number
  // of pixels on the wider axis.
  const markWidthOfStage = MARK_OF_STAGE * (stageAspect === 0 ? 1 : 1 / stageAspect);
  // The scales are ratios against the card's *own* full size, so both shares
  // are divided by what the card already occupies on that axis.
  const panelScaleY = useTransform(
    progress,
    scaleRange,
    [PANEL_FULL, MARK_OF_STAGE / PANEL_HEIGHT_OF_STAGE],
    { clamp: true, ease: EASE },
  );
  const panelWidthOfStage =
    PANEL_HEIGHT_OF_STAGE * PANEL_ASPECT * (stageAspect === 0 ? 1 : 1 / stageAspect);
  const panelScaleX = useTransform(
    progress,
    scaleRange,
    [PANEL_FULL, markWidthOfStage / panelWidthOfStage],
    { clamp: true, ease: EASE },
  );
  // Counter-scaled per axis so the radius stays visually constant at the card
  // spec's 10px, and the corner stays round rather than stretching into an
  // ellipse once the two scales diverge.
  const panelRadius = useTransform(
    [panelScaleX, panelScaleY] as const,
    ([sx, sy]: number[]) => `${10 / sx}px / ${10 / sy}px`,
  );
  /*
   * The card's own 1px border is scaled with the box, so at the collapsed size
   * it renders at ~0.26px vertically and the horizontal edges disappear.
   * Counter-scaling the border does not fix it: the browser rounds computed
   * border widths to whole pixels, so 3.85px becomes 3px and the top and bottom
   * still land at 0.78px.
   *
   * An inset box-shadow is not rounded that way, so the edge is drawn as a
   * shadow spread instead — counter-scaled per axis so all four sides stay a
   * visually constant 1px through the collapse.
   */
  /** `CARD`'s #15161A/85 fill, faded out with the rest of the collapsed mark. */
  const panelFill = useTransform(exit.opacity, (a: number) => `rgba(21,22,26,${0.85 * a})`);

  const panelEdge = useTransform(
    [panelScaleX, panelScaleY, exit.opacity] as const,
    ([sx, sy, a]: number[]) => {
      // The edge fades with the mark it outlines, so the collapsed card doesn't
      // linger next to the ghost that has already left it.
      const c = `rgba(137,145,159,${a})`;
      return (
        `inset 0 ${1 / sy}px 0 0 ${c}, inset 0 -${1 / sy}px 0 0 ${c},` +
        ` inset ${1 / sx}px 0 0 0 ${c}, inset -${1 / sx}px 0 0 0 ${c}`
      );
    },
  );

  // Headline lives on the full-size panel and clears out before the collapse.
  const headOpacity = useTransform(
    progress,
    [HEAD.start, HEAD.end, SHRINK.start, SHRINK.start + HEAD_FADE],
    [0, 1, 1, 0],
    { clamp: true },
  );
  const headY = useTransform(progress, [HEAD.start, HEAD.end], [22, 0], { clamp: true });

  // The icon is the one element that persists across the collapse: it starts
  // small beside the eyebrow and travels to the centre of the shrunken panel,
  // growing as it goes. It never fades, so it reads as the same object settling
  // into place rather than one mark replacing another.
  //
  // Its resting spot is measured from the spacer left in the eyebrow line
  // rather than hardcoded: the headline's type and leading are clamped against
  // the viewport, so the eyebrow's position as a share of the panel shifts
  // between breakpoints and no fixed percentage sits on it everywhere.
  const home = useIconHome();

  // Travels from that resting spot to the panel's centre, waiting out the
  // headline fade first so the copy has cleared before the mark moves.
  const iconTravel: [number, number] = [SHRINK.start + HEAD_FADE, SHRINK.end];
  const iconLeft = useTransform(progress, iconTravel, [`${home.left}%`, '50%'], {
    clamp: true,
    ease: EASE,
  });
  const iconTop = useTransform(progress, iconTravel, [`${home.top}%`, '50%'], {
    clamp: true,
    ease: EASE,
  });
  // Grows from the eyebrow's 14px to a mark sized for the collapsed panel,
  // counter-scaled so the panel's own contraction doesn't shrink it with it.
  // Counters the *larger* remaining scale so the icon never overflows the
  // narrower axis of the collapsed mark.
  const iconSize = useTransform([progress, panelScaleX, panelScaleY] as const, ([p, sx, sy]: number[]) => {
    const s = Math.max(sx, sy);
    const [from, to] = iconTravel;
    const t = Math.min(1, Math.max(0, (p - from) / (to - from)));
    return (14 + (58 - 14) * t) / s;
  });

  return (
    <section ref={ref} id="portfolio" className="relative h-[420vh] border-t border-white/6">
      <div className="sticky top-0 box-border flex h-screen items-center justify-center overflow-hidden px-gutter py-[clamp(16px,2.2vh,32px)] pl-gutter-nav">
        {/*
          One fixed-aspect stage holds both the panel and the card grid, so the
          panel's collapsed size and the grid's centre hole are defined against
          the same box and stay aligned at any viewport.
        */}
        {/*
          The stage fills the pinned viewport rather than sitting in a fixed
          box: the mosaic and the collapsed mark are both sized against it, so
          giving it the full height and width is what removes the dead margin
          around the section.
        */}
        <div
          data-portfolio-stage
          className="relative size-full max-w-none"
        >
          {/*
            The stage panel: headline first, then collapsed to the mark.

            `scale` is already driven by the scroll collapse, so the entry
            reveal rides on `opacity` and `y` to avoid fighting it.
          */}
          <motion.div
            data-portfolio-panel
            // Sized from the stage's short axis and centred, rather than
            // stretched to the full height between horizontal insets: the card
            // is a contained near-square panel, so its content fills it instead
            // of floating in a tall empty sheet.
            className={`absolute top-1/2 left-1/2 z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden ${CARD} border-0`}
            style={{
              height: `${PANEL_HEIGHT_OF_STAGE * 100}%`,
              width: `${PANEL_HEIGHT_OF_STAGE * PANEL_ASPECT * 100 * (stageAspect === 0 ? 1 : 1 / stageAspect)}%`,
              scaleX: panelScaleX,
              scaleY: panelScaleY,
              borderRadius: panelRadius,
              boxShadow: panelEdge,
              // `CARD`'s fill has to go with the edge and the mark, or the
              // collapsed card stays visible as a filled block beside the ghost
              // that has already left it. Driven here rather than through
              // `opacity`, which `animate` owns for the entry reveal.
              backgroundColor: panelFill,
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={
              entered && openIdx === null ? { opacity: 1, y: 0 } : { opacity: 0, y: openIdx === null ? 40 : 0 }
            }
            // A category expanding over the stage shares this panel's space,
            // and its own background is translucent (part of the card glass
            // style), so the mark stays faintly visible underneath through the
            // whole morph unless it is hidden here — the fade is quick since
            // it just needs to clear before the expanding panel arrives.
            transition={{ duration: openIdx === null ? 0.7 : 0.15, ease: EASE }}
          >
            {/*
              The hover light lives on this card rather than the mosaic tiles:
              it is the one thing on the stage that is a single object through
              the whole collapse, so the cue belongs to it.
            */}
            <CardGlow radius={10} color="#00B8C9" />
            {/*
              Counter-scaling shrinks this box along with the panel, so its
              width is pinned to the stage in viewport units rather than `ch` —
              otherwise the measure collapses to one word per line as the panel
              contracts.
            */}
            {/*
              Laid out against the reference card (Portfolio_card.svg), measured
              off its render: the eyebrow sits at 6.6% down, the opening
              statement at 19.4%, the doodle fills the middle, and the closing
              statement is right-aligned at the bottom.

              Positions and type size are percentages of the card, not the
              viewport, so the whole composition holds its proportions as the
              card scales — `cqw` against the card's own container query.
            */}
            <motion.div
              data-portfolio-head
              className="absolute inset-0 [container-type:size]"
              style={{ opacity: headOpacity, y: headY }}
            >
              <div className="absolute top-[6.4%] left-[6.6%] flex items-center gap-[1.2cqw] font-heading text-[1.9cqw] font-medium tracking-[0.18em] text-teal">
                {/*
                  The icon itself is rendered outside this block so it can
                  travel independently — this reserves the space it occupies on
                  the eyebrow line so the label doesn't shift when it leaves.
                */}
                <span data-icon-home className="inline-block size-[2.2cqw] flex-none" />
                02 · PORTFOLIO
              </div>

              <div className="absolute top-[17.5%] left-[6.6%] font-heading text-[6.4cqw]/[1.22] font-bold tracking-[-0.02em] text-white">
                <span className="text-teal">Every Project</span> started
                <br />
                with <span className="text-green">Curiosity.</span>
              </div>

              {/*
                The doodle occupies the band between the two statements: the
                thought leaves the first, travels the dashed path, and arrives
                as the burst above the second. Decorative, so it is hidden from
                assistive tech and never intercepts a click meant for the card.
              */}
              <img
                src="/images/doodles/portfolio-center-doodle.svg"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute top-[33%] left-[19%] h-[44%] w-auto select-none"
              />

              <div className="absolute right-[6.6%] bottom-[6.4%] text-right font-heading text-[6.4cqw]/[1.22] font-bold tracking-[-0.02em] text-white">
                <span className="text-teal">Every solution</span>
                <br />
                was shaped by <span className="text-orange">Design.</span>
              </div>
            </motion.div>

            {/*
              The persistent mark. It starts on the eyebrow line at icon size
              and ends centred in the collapsed panel, never fading — the
              `-translate-*` keeps it centred on its own box at the destination.
            */}
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 text-teal"
              // Clears alongside the mosaic, just before the outline departs for
              // career: the mark is the ghost's source, so leaving it lit would
              // duplicate the shape that is now travelling away. The panel keeps
              // its layout so the ghost can still measure it.
              style={{ left: iconLeft, top: iconTop, opacity: exit.opacity }}
            >
              <motion.div style={{ width: iconSize }}>
                <StylusNoteIcon className="block h-auto w-full" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/*
            The mosaic: a 4×4 grid where each tile claims a different-shaped
            block around the centre, leaving the middle cell free for the
            collapsed panel. The middle column and row are sized against
            MARK_OF_STAGE so that hole matches the mark.
          */}
          <motion.div
            className="grid size-full gap-[clamp(14px,1.6vw,24px)]"
            style={{
              // The hole is square: its height is the share of the stage, and
              // its width is the same pixel count expressed against the wider
              // axis. Both `26%` would make it as rectangular as the stage.
              gridTemplateColumns: `1fr ${markWidthOfStage * 100}% 1fr`,
              gridTemplateRows: `1fr ${MARK_OF_STAGE * 100}% 1fr`,
              ...exit,
            }}
          >
            {CATEGORIES.map((cat, i) => (
              <div key={cat.id} className="min-h-0" style={{ gridArea: MOSAIC[i].area }}>
                <CategoryCard
                  progress={progress}
                  index={i}
                  onOpen={() => setOpenIdx(i)}
                  hidden={openIdx !== null && openIdx !== i}
                />
              </div>
            ))}
          </motion.div>

          {/*
            The opened category fills the stage in place. It shares a layoutId
            with its tile, so motion morphs the box out from where the tile sat
            rather than fading a separate panel in over it.
          */}
          <AnimatePresence>
            {openIdx !== null && (
              <CategoryExpanded
                key={CATEGORIES[openIdx].id}
                category={CATEGORIES[openIdx]}
                categoryIndex={openIdx}
                onClose={closeCategory}
                onOpenProject={(projectIdx) => onOpenProject(openIdx, projectIdx)}
                accent={CARD_ACCENT[openIdx % CARD_ACCENT.length]}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
