import { motion, useMotionValue, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GhostSkin, readSkin, type Skin } from './GhostSkin';

/** Set false to remove the travelling outline entirely. */
export const CARD_TRAVEL_ENABLED = true;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
}

// The card *body*, not the flip wrapper. The wrapper spans the full 768.5×700
// composition — badges and portrait overhang the panel on both sides — so
// measuring it made the ghost start out roughly 1.7× the card's own width.
const HERO_CARD = '#home [data-hero-card-body]';
/**
 * The accent glow — orange on the design side, green on travel.
 *
 * Both faces are mounted at once, so this cannot simply take the first match:
 * that is always the design face, whichever side is actually turned toward the
 * viewer. The visible one is found by its rotation instead.
 */
const HERO_CARD_GLOW = '#home [data-hero-card-glow]';
const INTRO_PANEL = '[data-card-travel-target]';

/** The accent glow on whichever card face is currently turned toward the viewer. */
function visibleGlow(): Element | null {
  const glows = [...document.querySelectorAll(HERO_CARD_GLOW)];
  if (glows.length < 2) return glows[0] ?? null;
  /*
    Which face is turned toward the viewer, read from the glow's own ancestry
    rather than a fixed path down from the button. A hard-coded depth silently
    picks the wrong face the moment a wrapper is added or removed between the
    two — it keeps matching some element, just not the rotating one — and the
    ghost then departs in the colour of the hidden side.
  */
  const face = glows[0].closest('[data-hero-face]');
  const rotating = face?.parentElement ?? null;
  if (!rotating) return glows[0];
  const showingBack = new DOMMatrixReadOnly(getComputedStyle(rotating).transform).m11 < 0;
  return glows[showingBack ? 1 : 0];
}

/** How strongly the flight path bends back toward the viewport centre (0–1). */
const ARC_STRENGTH = 0.85;

function readRect(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0) return null;
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
    radius: Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
  };
}

/**
 * A ghost outline that travels from the hero card into the intro's slide panel
 * as you scroll between them.
 *
 * Only the outline moves — the hero card itself stays put and stays
 * interactive, and the panel keeps its own content. Both endpoints are
 * measured live, so the path stays correct across viewport sizes and the
 * intro's fit-to-viewport scaling.
 */
export function CardTravelGhost() {
  const { scrollY } = useScroll();
  const [ends, setEnds] = useState<{ from: Rect; to: Rect; startY: number; endY: number } | null>(null);

  // The travel spans the gap between the hero card leaving and the intro
  // panel settling: from the hero's own height of scroll through to the point
  // the intro body has revealed.
  const measure = useCallback(() => {
    const heroEl = document.getElementById('home');
    const introEl = document.getElementById('intro');
    if (!heroEl || !introEl) return;

    const scrollY = window.scrollY;
    const introRect = introEl.getBoundingClientRect();
    const introTop = introRect.top + scrollY;
    const introTravel = introRect.height - window.innerHeight;

    const from = readRect(HERO_CARD);
    const panelEl = document.querySelector(INTRO_PANEL);
    const stickyEl = introEl.firstElementChild;
    if (!from || !panelEl || !stickyEl) return;

    // Read the panel, its sticky parent and its reveal transform in one go —
    // these must describe the same instant to combine correctly.
    const panelRect = panelEl.getBoundingClientRect();
    const stickyTop = stickyEl.getBoundingClientRect().top;
    const revealOffsetY = new DOMMatrixReadOnly(getComputedStyle(panelEl).transform).m42;

    const to: Rect = {
      top: panelRect.top,
      left: panelRect.left,
      width: panelRect.width,
      height: panelRect.height,
      radius: Number.parseFloat(getComputedStyle(panelEl).borderTopLeftRadius) || 0,
    };

    // `from` is stored in *document* space so it can be re-projected to the
    // viewport at any scroll position — the hero card scrolls away with the
    // page, and the ghost has to stay glued to it as it goes.
    //
    // `to` must be the panel's position *once the intro is pinned*, which is
    // not where it sits at the current scroll offset. The sticky child parks at
    // `top: 0`, so subtracting its current top gives the panel's offset within
    // it; subtracting the reveal transform removes the rise it animates through
    // on the way in. What's left is the settled viewport position.
    const restingTop = to.top - stickyTop - revealOffsetY;

    setEnds({
      from: { ...from, top: from.top + scrollY },
      to: { ...to, top: restingTop },
      startY: 0,
      // Runs to where the slide panel finishes its own reveal (PANEL_END in
      // Intro.tsx), so the ghost lands on the panel's settled position rather
      // than while it's still rising into place.
      endY: introTop + introTravel * 0.14,
    });
  }, []);

  useEffect(() => {
    // The endpoints depend on fonts loading and the intro's fit-to-viewport
    // scaling resolving, neither of which is done on the first frame. Re-measure
    // as those settle, and whenever the layout can change afterwards.
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    const settleTimers = [80, 250, 600, 1200].map((ms) => setTimeout(measure, ms));
    document.fonts?.ready.then(measure).catch(() => {});

    const observer = new ResizeObserver(measure);
    const panel = document.querySelector(INTRO_PANEL);
    if (panel) observer.observe(panel);

    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      settleTimers.forEach(clearTimeout);
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const progress = useMotionValue(0);
  useMotionValueEvent(scrollY, 'change', (y) => {
    if (!ends) return;
    const span = ends.endY - ends.startY;
    progress.set(span <= 0 ? 0 : Math.min(1, Math.max(0, (y - ends.startY) / span)));
  });

  // The start point is in document space, so subtract scroll to get where the
  // hero card actually is on screen right now; the end point is already
  // viewport-relative. Interpolating between them keeps the ghost attached to
  // the card as it scrolls away, then hands it off to the pinned panel.
  //
  // Straight interpolation sags toward the top edge mid-flight, because the
  // hero card is scrolling away while the panel stays pinned. A sine arc
  // (zero at both ends, peak in the middle) bends the path back toward the
  // viewport's vertical centre so the ghost stays fully in view.
  const top = useTransform([progress, scrollY], ([p, y]: number[]) => {
    if (!ends) return 0;
    const fromTop = ends.from.top - y;
    const linear = fromTop + (ends.to.top - fromTop) * p;

    const midCenter = window.innerHeight / 2 - ends.from.height / 2;
    const pull = Math.sin(p * Math.PI);
    return linear + (midCenter - linear) * pull * ARC_STRENGTH;
  });
  const left = useTransform(progress, [0, 1], [ends?.from.left ?? 0, ends?.to.left ?? 0]);
  const width = useTransform(progress, [0, 1], [ends?.from.width ?? 0, ends?.to.width ?? 0]);
  const height = useTransform(progress, [0, 1], [ends?.from.height ?? 0, ends?.to.height ?? 0]);
  const borderRadius = useTransform(progress, [0, 1], [ends?.from.radius ?? 0, ends?.to.radius ?? 0]);
  // Fade in as it leaves the hero, out as it lands on the panel.
  const opacity = useTransform(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);

  // The ghost wears the hero card's glass on the way out and the intro panel's
  // surface on the way in, read from the elements themselves so the two stay in
  // step with whatever those are styled as.
  const [skins, setSkins] = useState<{ from: Skin | null; to: Skin | null }>({ from: null, to: null });
  const readSkins = useCallback(() => {
    setSkins({
      from: readSkin(document.querySelector(HERO_CARD), visibleGlow()),
      to: readSkin(document.querySelector(INTRO_PANEL)),
    });
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(readSkins);
    const timers = [200, 700].map((ms) => setTimeout(readSkins, ms));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [readSkins]);

  // Re-read as the flight begins, so the ghost departs in whichever accent is
  // facing the viewer at that moment. Reading only once at mount would freeze
  // the colour that happened to be up on load, and the card can be flipped any
  // number of times before the reader ever scrolls away from the hero.
  const departed = useRef(false);
  useMotionValueEvent(scrollY, 'change', () => {
    const flying = progress.get() > 0 && progress.get() < 0.5;
    if (flying && !departed.current) {
      departed.current = true;
      readSkins();
    } else if (!flying && progress.get() === 0) {
      departed.current = false;
    }
  });

  if (!ends) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-20 max-[900px]:hidden"
      style={{ top, left, width, height, borderRadius, opacity }}
    >
      <GhostSkin t={progress} from={skins.from} to={skins.to} borderRadius={borderRadius} />
    </motion.div>
  );
}
