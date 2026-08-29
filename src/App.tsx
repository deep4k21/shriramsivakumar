import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackgroundGrid } from './components/BackgroundGrid';
import { AboutTravelGhosts } from './components/AboutTravelGhosts';
import { PortfolioTravelGhosts } from './components/PortfolioTravelGhosts';
import { CARD_TRAVEL_ENABLED, CardTravelGhost } from './components/CardTravelGhost';
import { Sidebar } from './components/Sidebar';
import { Hero } from './components/Hero';
import { Intro } from './components/Intro';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { Career } from './components/Career';
import { ProjectPage } from './components/ProjectPage';
import { ConnectModal } from './components/ConnectModal';
import { useActiveSection } from './hooks/useActiveSection';
import { useNavVisible } from './hooks/useNavVisible';
import { usePointerGlow } from './hooks/usePointerGlow';
import { releaseBodyScrollLock } from './hooks/useBodyScrollLock';
import { useEscapeKey } from './hooks/useEscapeKey';
import { useSmoothScrollTo } from './hooks/useSmoothScrollTo';
import { useScrollSnap, type SnapPoint } from './hooks/useScrollSnap';
import { CATEGORIES } from './data/content';
import './styles/global.css';

interface View {
  categoryIdx: number;
  projectIdx: number;
}

/** The static backdrop behind the whole site. */
export const BACKDROPS = {
  one: '/images/Bg 1.svg',
  two: '/images/bg 2.svg',
} as const;

export type BackdropName = keyof typeof BACKDROPS;

export interface SiteConfig {
  showGrid: boolean;
  gridRadius: number;
  flipOnHover: boolean;
  availableForWork: boolean;
  /** Which backdrop image to use — see `BACKDROPS`. */
  backdrop: BackdropName;
}

const DEFAULT_CONFIG: SiteConfig = {
  showGrid: true,
  gridRadius: 210,
  flipOnHover: false,
  availableForWork: true,
  backdrop: 'one',
};

/**
 * The stretch of the portfolio's scroll window where the mosaic is both settled
 * and still fully opaque. Measured, not assumed:
 *
 *   - the mark finishes collapsing at `SHRINK.end` (0.68), but the tiles keep
 *     growing into the space it leaves until ~0.85 — landing before that drags
 *     them through the last of the resize, which reads as the cards shifting;
 *   - Portfolio's own exit fade starts at 0.9, so anything past that arrives
 *     part-way faded out.
 *
 * That leaves 0.85–0.88 as the band where the section is actually at rest and
 * at full strength. `_TARGET` is where a sidebar click scrolls to when the
 * reader is outside it.
 */
const MOSAIC_SETTLED_FROM = 0.82;
const MOSAIC_SETTLED_TO = 0.89;
const MOSAIC_SETTLED_TARGET = 0.86;

/**
 * Where in each section's scroll window its content has finished revealing.
 *
 * Every pinned section is several viewports tall, and its *top* is the state
 * before anything has revealed — so a plain `#id` anchor drops the reader on a
 * blank screen. These are the fractions of each window where the section is
 * actually showing what it is for.
 *
 * `home` and `career` reveal immediately, so they take their own top.
 */
const SECTION_SETTLED: Record<string, number> = {
  home: 0,
  intro: 0.92,
  about: 0.86,
  portfolio: MOSAIC_SETTLED_TARGET,
  career: 0.35,
};

/**
 * The intro card's settled position inside the portfolio's window.
 *
 * Portfolio reveals two things in sequence — the "Every Project" card, then the
 * category mosaic — and each has its own resting point. Measured: the card
 * finishes moving at 0.54 and holds, while the mosaic is still arriving. A
 * single snap at the mosaic meant the card had no stopping point of its own, so
 * the reader scrolled straight past the state it settles into.
 */
const PORTFOLIO_CARD_SETTLED = 0.54;

/**
 * Extra settled points beyond each section's primary one, for sections that
 * reveal more than one thing.
 *
 * These are snap targets only — sidebar navigation still goes to the section's
 * main position in `SECTION_SETTLED`.
 */
const EXTRA_SETTLED: Record<string, number[]> = {
  portfolio: [PORTFOLIO_CARD_SETTLED],
};

function App({ config = DEFAULT_CONFIG }: { config?: SiteConfig }) {
  const { active } = useActiveSection();
  const navOn = useNavVisible();
  usePointerGlow(config.gridRadius);

  // The backdrop is painted by a fixed `body::before` in global.css, which
  // reads this property — set here so the choice lives with the other options.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--site-backdrop',
      `url('${BACKDROPS[config.backdrop]}')`,
    );
  }, [config.backdrop]);

  const [view, setView] = useState<View | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  // The expanded portfolio category. Owned here rather than inside Portfolio so
  // the sidebar's category list can open one directly.
  const [portfolioCategory, setPortfolioCategory] = useState<number | null>(null);
  // Mirrors `connectOpen` for the Escape handler, which must not re-create
  // itself on every open/close.
  const connectOpenRef = useRef(connectOpen);
  connectOpenRef.current = connectOpen;
  const smoothScrollTo = useSmoothScrollTo();

  const openProject = useCallback(
    (categoryIdx: number, projectIdx: number) => setView({ categoryIdx, projectIdx }),
    [],
  );
  const closeView = useCallback(() => setView(null), []);

  /**
   * Sidebar navigation: scrolls to where a section has settled rather than to
   * its top edge, so the reader never lands on a pinned section's blank
   * pre-reveal state.
   */
  const navigateToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = Math.max(0, el.offsetHeight - window.innerHeight);
      smoothScrollTo(top + span * (SECTION_SETTLED[id] ?? 0));
    },
    [smoothScrollTo],
  );

  /**
   * The settled position of every section, in document coordinates.
   *
   * Measured on demand rather than cached: the pinned sections are sized in
   * viewport units, so every one of these moves when the window is resized.
   */
  const snapPoints = useCallback(
    (): SnapPoint[] =>
      Object.entries(SECTION_SETTLED).flatMap(([id, fraction]) => {
        const el = document.getElementById(id);
        if (!el) return [];
        const top = el.getBoundingClientRect().top + window.scrollY;
        const span = Math.max(0, el.offsetHeight - window.innerHeight);
        // A section can rest at more than one place on the way through.
        const fractions = [fraction, ...(EXTRA_SETTLED[id] ?? [])];
        return fractions.map((f) => ({ id, y: top + span * f }));
      }),
    [],
  );

  // Suspended while an overlay owns the screen: the body is scroll-locked then,
  // and a snap firing behind a modal would move the page out from under it.
  useScrollSnap(snapPoints, smoothScrollTo, view === null && !connectOpen && portfolioCategory === null);

  /**
   * Opens a category from the sidebar.
   *
   * The mosaic is fully settled across a stretch of the portfolio's window, not
   * at a single point — so if the reader is already anywhere in that stretch,
   * the category opens immediately and the page does not move at all. Scrolling
   * to a nominal "settled" offset instead would drag the tiles through the last
   * of their resize on the way, which reads as the cards shifting before the
   * panel appears.
   *
   * Only when they are outside that range does it travel, and the expansion is
   * then deferred until the scroll lands: Portfolio dismisses an open category
   * once the reader scrolls far enough from where it opened, so setting it
   * first would have the travel itself close it again.
   */
  const openPortfolioCategory = useCallback(
    (idx: number) => {
      const el = document.getElementById('portfolio');
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = el.offsetHeight - window.innerHeight;
      const progress = span > 0 ? (window.scrollY - top) / span : 0;

      if (progress >= MOSAIC_SETTLED_FROM && progress <= MOSAIC_SETTLED_TO) {
        setPortfolioCategory(idx);
        return;
      }

      smoothScrollTo(top + span * MOSAIC_SETTLED_TARGET);
      // Matches the scroll's own duration, so the tile opens as it arrives.
      window.setTimeout(() => setPortfolioCategory(idx), 780);
    },
    [smoothScrollTo],
  );
  const openConnect = useCallback(() => setConnectOpen(true), []);

  /**
   * Dismissing the modal eases back up to the career section rather than
   * leaving the reader parked on the empty runway below the last section, with
   * nothing on screen and nowhere obvious to go.
   *
   * This also re-arms the modal: its trigger fires on a downward crossing of
   * the runway threshold, so landing above it means scrolling down again brings
   * the modal back the same way it came the first time.
   */
  const closeConnect = useCallback(() => {
    setConnectOpen(false);

    const career = document.getElementById('career');
    if (!career) return;
    // Career pins across its own window, so aim for the middle of that window —
    // where it sits still in full view — rather than the section's top edge,
    // which is a whole viewport further up and lands mid-entry.
    const top = career.getBoundingClientRect().top + window.scrollY;
    const pinned = career.offsetHeight - window.innerHeight;

    // The modal's scroll lock makes `window.scrollTo` a no-op until the modal
    // unmounts at the end of its exit animation. Releasing it up front lets the
    // travel start on the next frame instead, so the page is already moving as
    // the modal fades rather than waiting the animation out first.
    releaseBodyScrollLock();
    requestAnimationFrame(() => smoothScrollTo(top + pinned * 0.4, 750));
  }, [smoothScrollTo]);

  useEscapeKey(
    useCallback(() => {
      setView(null);
      // Escape takes the same route out as the close button, so the scroll back
      // to career happens either way — but only when the connect modal is what
      // was actually open, not on every Escape press. Read from a ref rather
      // than inside a state updater, which React may run twice in StrictMode
      // and would fire the scroll twice with it.
      if (connectOpenRef.current) closeConnect();
    }, [closeConnect]),
  );

  const statusLabel = config.availableForWork ? 'Available for work' : 'Currently abroad';

  return (
    <div className="block min-h-screen">
      <BackgroundGrid visible={config.showGrid} />
      {CARD_TRAVEL_ENABLED && (
        <>
          <CardTravelGhost />
          <AboutTravelGhosts />
          <PortfolioTravelGhosts onOpenConnect={openConnect} />
        </>
      )}

      <Sidebar
        active={active}
        visible={navOn}
        statusLabel={statusLabel}
        onOpenConnect={openConnect}
        activeCategory={portfolioCategory}
        onOpenCategory={openPortfolioCategory}
        onNavigate={navigateToSection}
      />

      <main className="min-w-0">
        <Hero flipOnHover={config.flipOnHover} />
        <Intro />
        <About />
        <Portfolio
          onOpenProject={openProject}
          overlayOpen={view !== null}
          openIdx={portfolioCategory}
          setOpenIdx={setPortfolioCategory}
        />
        <Career />

        {/*
          Runway past the last section. Career ends exactly at the document
          bottom, so without this there is no scroll left for the closing ghost
          to travel through on its way into the connect modal.
        */}
        <div data-connect-runway aria-hidden="true" className="h-[70vh]" />
      </main>

      {/*
        Categories now expand in place inside the portfolio section, so only the
        individual case study still opens as an overlay.
      */}
      <AnimatePresence>
        {view && (
          <ProjectPage
            key="project"
            category={CATEGORIES[view.categoryIdx]}
            initialProjectIdx={view.projectIdx}
            onBackToCategory={closeView}
            onClose={closeView}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {connectOpen && <ConnectModal key="connect" onClose={closeConnect} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
