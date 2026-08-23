import { AnimatePresence, cubicBezier, motion, useTransform, type MotionValue } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { CATEGORIES } from '../data/content';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useSectionScroll } from '../hooks/useSectionScroll';
import { CARD } from '../styles/card';
import { CardGlow } from './CardGlow';
import { CategoryExpanded } from './CategoryExpanded';
import { StylusNoteIcon } from './Icons';

interface PortfolioProps {
  onOpenProject: (categoryIndex: number, projectIndex: number) => void;
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
const SHRINK = { start: 0.24, end: 0.68 } as const;
const CARDS = { start: 0.4, end: 0.98 } as const;

/**
 * How long the headline takes to clear once the collapse begins. The icon holds
 * on the eyebrow line until this is done, so the copy is gone before the mark
 * starts travelling — otherwise the two read as competing movements.
 */
const HEAD_FADE = 0.1;

/** Panel size as a share of the stage, at full size and once collapsed. */
const PANEL_FULL = 1;
const PANEL_SMALL = 0.26;

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
        className={`group relative flex size-full cursor-pointer flex-col gap-[clamp(10px,1.4vh,16px)] overflow-hidden ${CARD} px-[clamp(20px,2vw,32px)] py-[clamp(18px,2.4vh,30px)] text-left`}
        animate={{ opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        style={{ pointerEvents: hidden ? 'none' : 'auto' }}
      >
      {/* Replaces the old flat border tint — the travelling light is the hover cue. */}
      {!hidden && <CardGlow color="#FF9A5C" />}
      <div className="font-heading text-[10.5px] font-medium tracking-[0.14em] text-[#5a5a5a]">
        {String(index + 1).padStart(2, '0')} / {String(CATEGORIES.length).padStart(2, '0')}
      </div>
      <div className="font-heading text-[clamp(17px,1.5vw,24px)]/[1.2] font-semibold tracking-[-0.02em] text-orange">
        {cat.title}
      </div>

      {/*
        On the wide tiles the copy and the link share a row: they are short
        enough that stacking them plus a spacer overflows the tile on a less
        tall viewport, which pushes the link out of sight. Side by side, the
        content fits the height it is given and the link still lands right.

        The tall tiles keep the stacked layout, where a spacer pins the link to
        the bottom of the column.
      */}
      <div
        className={
          wide
            ? 'flex min-h-0 flex-1 items-end justify-between gap-6'
            : 'flex min-h-0 flex-1 flex-col'
        }
      >
        <p className="m-0 max-w-[34ch] font-body text-[clamp(12.5px,0.85vw,14px)]/[1.6] text-grey text-pretty">
          {cat.lead} <span className="font-bold text-white">{cat.leadBold}</span>
        </p>
        {!wide && <div className="flex-1" />}
          <div className="flex flex-none items-center gap-2.25 font-body text-[12.5px] text-teal">
            Open <span className="font-bold">{cat.short}</span> <span className="text-[15px]">→</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Portfolio({ onOpenProject, overlayOpen }: PortfolioProps) {
  const { ref, progress } = useSectionScroll<HTMLElement>();

  // Which tile is expanded over the stage, if any. Kept here rather than in App
  // because the expansion lives inside this section rather than over the page.
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const closeCategory = useCallback(() => setOpenIdx(null), []);
  // Only collapse on Escape when nothing is layered above, so the key steps
  // back one level rather than closing the case study and the category at once.
  useEscapeKey(
    useCallback(() => {
      if (!overlayOpen) setOpenIdx(null);
    }, [overlayOpen]),
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

  // The panel collapses from filling the stage to a small centred mark, holding
  // at full size until the headline has cleared. The icon is positioned as a
  // percentage of this panel, so it would drift as the panel contracts even
  // before its own travel begins — holding both keeps the mark still until the
  // copy is gone.
  const panelScale = useTransform(
    progress,
    [SHRINK.start + HEAD_FADE, SHRINK.end],
    [PANEL_FULL, PANEL_SMALL],
    { clamp: true, ease: EASE },
  );
  // Counter-scale the radius so it stays visually constant at the card spec's
  // 10px while the panel contracts, rather than shrinking with it.
  const panelRadius = useTransform(panelScale, (s) => `${10 / s}px`);

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
  const iconSize = useTransform([progress, panelScale] as const, ([p, s]: number[]) => {
    const [from, to] = iconTravel;
    const t = Math.min(1, Math.max(0, (p - from) / (to - from)));
    return (14 + (58 - 14) * t) / s;
  });

  return (
    <section ref={ref} id="portfolio" className="relative h-[420vh] border-t border-white/6">
      <div className="sticky top-0 box-border flex h-screen items-center justify-center overflow-hidden px-gutter py-[clamp(28px,4vh,56px)] pl-gutter-nav">
        {/*
          One fixed-aspect stage holds both the panel and the card grid, so the
          panel's collapsed size and the grid's centre hole are defined against
          the same box and stay aligned at any viewport.
        */}
        <div
          data-portfolio-stage
          className="relative w-full max-w-300"
          style={{ height: 'min(68vh, 600px)' }}
        >
          {/*
            The stage panel: headline first, then collapsed to the mark.

            `scale` is already driven by the scroll collapse, so the entry
            reveal rides on `opacity` and `y` to avoid fighting it.
          */}
          <motion.div
            data-portfolio-panel
            className={`absolute inset-0 z-10 grid place-items-center overflow-hidden ${CARD}`}
            style={{ scale: panelScale, borderRadius: panelRadius }}
            initial={{ opacity: 0, y: 40 }}
            animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {/*
              Counter-scaling shrinks this box along with the panel, so its
              width is pinned to the stage in viewport units rather than `ch` —
              otherwise the measure collapses to one word per line as the panel
              contracts.
            */}
            <motion.div
              data-portfolio-head
              className="absolute left-[clamp(24px,4vw,64px)] flex flex-col gap-3.5 text-teal"
              style={{ opacity: headOpacity, y: headY, width: 'min(90ch, 82vw)' }}
            >
              {/*
                The icon itself is rendered outside this block so it can travel
                independently — this reserves the space it occupies on the
                eyebrow line so the label doesn't shift when it leaves.
              */}
              <div className="flex items-center gap-2.25 font-heading text-[11px] font-medium tracking-[0.18em]">
                <span data-icon-home className="inline-block size-3.5 flex-none" />
                02 · PORTFOLIO
              </div>
              {/*
                Two sentences, one line each — they read as a pair, not as
                prose, so each is held on its own line rather than being left to
                wrap wherever the box happens to end.
              */}
              <div className="font-heading text-[clamp(24px,2.9vw,40px)]/[1.3] font-semibold tracking-[-0.015em]">
                <div className="whitespace-nowrap">
                  Every project started with <span className="font-bold">curiosity</span>.
                </div>
                <div className="whitespace-nowrap">
                  Every solution was shaped by <span className="font-bold">design</span>.
                </div>
              </div>
            </motion.div>

            {/*
              The persistent mark. It starts on the eyebrow line at icon size
              and ends centred in the collapsed panel, never fading — the
              `-translate-*` keeps it centred on its own box at the destination.
            */}
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 text-teal"
              style={{ left: iconLeft, top: iconTop }}
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
            PANEL_SMALL so that hole matches the mark.
          */}
          <div
            className="grid size-full gap-[clamp(14px,1.6vw,24px)]"
            style={{
              gridTemplateColumns: `1fr ${PANEL_SMALL * 100}% 1fr`,
              gridTemplateRows: `1fr ${PANEL_SMALL * 100}% 1fr`,
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
          </div>

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
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
