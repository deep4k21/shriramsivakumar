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
import { SmallScreenNotice } from './components/SmallScreenNotice';
import { useIsSmallScreen } from './hooks/useIsSmallScreen';
import { useActiveSection } from './hooks/useActiveSection';
import { useNavVisible } from './hooks/useNavVisible';
import { usePointerGlow } from './hooks/usePointerGlow';
import { releaseBodyScrollLock } from './hooks/useBodyScrollLock';
import { useEscapeKey } from './hooks/useEscapeKey';
import { useSmoothScrollTo } from './hooks/useSmoothScrollTo';
import { useScrollSnap, type SnapPoint } from './hooks/useScrollSnap';
import { usePagedSnap } from './hooks/usePagedSnap';
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
  /** Which backdrop image to use — see `BACKDROPS`. */
  backdrop: BackdropName;
}

const DEFAULT_CONFIG: SiteConfig = {
  showGrid: true,
  gridRadius: 140,
  flipOnHover: false,
  backdrop: 'two',
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
 * Where the paginated Intro→Career chain lands for the mosaic's settled
 * stop — also what `SECTION_SETTLED.portfolio` uses, so a sidebar click
 * lands on the same point. Kept separate from `MOSAIC_SETTLED_TARGET`, which
 * only feeds the category-open logic's 0.82–0.89 "settled and opaque" band
 * above. Sits right at the edge of Portfolio's own exit fade (noted above as
 * starting at 0.9) — tried pulling it back to 0.88 and 0.89, but 0.90 read
 * best on review.
 */
const PAGED_MOSAIC_SETTLED = 0.9;

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
  // Matches `PAGED_MOSAIC_SETTLED` (not `MOSAIC_SETTLED_TARGET`), so a
  // sidebar click on Portfolio lands on the exact same stop the paginated
  // snap between Intro and Career settles on — the two navigation paths
  // should never disagree about where "Portfolio, settled" actually is.
  portfolio: PAGED_MOSAIC_SETTLED,
  career: 0.35,
};


/**
 * Where the intro card's headline reaches full opacity — see `HEAD.end` in
 * Portfolio.tsx. `PORTFOLIO_STOPS[0]` (0.30) turned out to be past the point
 * the copy is actually readable: `SHRINK` already starts at 0.18, right after
 * `HEAD` finishes at 0.20, so by 0.30 the panel is well into collapsing away
 * from it. 0.20 still read as slightly faded on review, so this sits just
 * under `SHRINK.start` instead.
 */
const PORTFOLIO_CARD_READABLE = 0.19;

function DesktopApp({ config = DEFAULT_CONFIG }: { config?: SiteConfig }) {
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
  // Bumped to play the Career → connect-modal ghost once, in place of the
  // scroll-scrubbed runway the paginated snap replaced — see `usePagedSnap`'s
  // `onPastLastStop` below and `PortfolioTravelGhosts`'s `playCount` prop.
  const [connectGhostPlay, setConnectGhostPlay] = useState(0);
  // Bumped to play the Portfolio → career ghost on its own clock rather than
  // leaving it to scroll-scrubbing — see `usePagedSnap`'s `onAdvance` below
  // and `PortfolioTravelGhosts`'s `careerPlayCount` prop.
  const [careerGhostPlay, setCareerGhostPlay] = useState(0);
  // Bumped on the same jump in reverse (Career → Portfolio), so Portfolio can
  // hold its collapsed mark hidden until the returning ghost has landed on it
  // rather than drawing it while the outline is still on its way.
  const [careerReturnPlay, setCareerReturnPlay] = useState(0);
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
   *
   * `intro`, `about`, `portfolio` and `career` are excluded: that whole
   * stretch is now handled entirely by `usePagedSnap` below, which owns the
   * input itself rather than easing toward a point after the reader stops.
   * Running both there would have them fight — the idle-snap correcting a
   * position the paginated jump just finished settling on. Only `home`
   * remains an idle-snap target.
   */
  const snapPoints = useCallback(
    (): SnapPoint[] =>
      Object.entries(SECTION_SETTLED)
        .filter(([id]) => id !== 'intro' && id !== 'about' && id !== 'portfolio' && id !== 'career')
        .flatMap(([id, fraction]) => {
          const el = document.getElementById(id);
          if (!el) return [];
          const top = el.getBoundingClientRect().top + window.scrollY;
          const span = Math.max(0, el.offsetHeight - window.innerHeight);
          return [{ id, y: top + span * fraction }];
        }),
    [],
  );

  // Suspended while an overlay owns the screen: the body is scroll-locked then,
  // and a snap firing behind a modal would move the page out from under it.
  useScrollSnap(snapPoints, smoothScrollTo, view === null && !connectOpen && portfolioCategory === null);

  /**
   * Document-Y of every stop in the paginated stretch from Intro through to
   * Career: Intro settled, About settled, the portfolio card fully faded up
   * and readable (`PORTFOLIO_CARD_READABLE`), the mosaic at rest
   * (`PAGED_MOSAIC_SETTLED`), then Career's own settled point
   * (`SECTION_SETTLED.career`) — reused as-is since Career has no reveal-in
   * animation of its own; its content is already in full view from the top
   * of its pinned window. Same measurement as `snapPoints`, kept separate
   * since this hook needs a plain number array rather than `SnapPoint`s
   * carrying a section id.
   *
   * The order here is load-bearing: `PORTFOLIO_STOP_INDEX`/`CAREER_STOP_INDEX`
   * below index into it by position to recognise the Portfolio→Career jump
   * specifically, out of every jump this hook can fire.
   */
  const getPagedStops = useCallback((): number[] => {
    const stops: number[] = [];
    const push = (id: string, fraction: number) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = Math.max(0, el.offsetHeight - window.innerHeight);
      stops.push(top + span * fraction);
    };
    push('intro', SECTION_SETTLED.intro);
    push('about', SECTION_SETTLED.about);
    push('portfolio', PORTFOLIO_CARD_READABLE);
    push('portfolio', PAGED_MOSAIC_SETTLED);
    push('career', SECTION_SETTLED.career);
    return stops;
  }, []);

  // Replaces free scrolling from Intro through the mosaic's rest state
  // entirely: one wheel tick or swipe jumps straight from one settled state
  // to the next, skipping the reveal animation in between. Suspended on the
  // same terms as the idle-snap above.
  //
  // Pushing forward once more from Career — the last stop — has nothing left
  // to scroll to, so it plays the closing ghost instead: `usePagedSnap` fires
  // this rather than jumping, and `PortfolioTravelGhosts` opens the modal once
  // the flight lands.
  const playConnectGhost = useCallback(() => setConnectGhostPlay((n) => n + 1), []);
  // Indices into `getPagedStops`'s return array — see the comment there.
  const PORTFOLIO_STOP_INDEX = 3;
  const CAREER_STOP_INDEX = 4;
  const onPagedAdvance = useCallback((from: number, to: number) => {
    if (from === PORTFOLIO_STOP_INDEX && to === CAREER_STOP_INDEX) {
      setCareerGhostPlay((n) => n + 1);
    }
    /*
      The same jump in reverse. There is no ghost animation to launch here —
      scrolling back scrubs `TO_CAREER` backwards on its own — but Portfolio
      still needs to know, so the mark it is about to restore stays hidden
      until the returning outline has actually landed on it.
    */
    if (from === CAREER_STOP_INDEX && to === PORTFOLIO_STOP_INDEX) {
      setCareerReturnPlay((n) => n + 1);
    }
  }, []);
  usePagedSnap(
    getPagedStops,
    view === null && !connectOpen && portfolioCategory === null,
    playConnectGhost,
    onPagedAdvance,
  );

  // Whether scroll currently sits at the mosaic's settled stop — the sidebar's
  // portfolio category list only shows there, not across the whole time
  // Portfolio is on screen, since the tiles themselves aren't in their final
  // positions (or aren't on screen at all) at any other point in its window.
  const [showPortfolioSubmenu, setShowPortfolioSubmenu] = useState(false);
  useEffect(() => {
    const check = () => {
      const el = document.getElementById('portfolio');
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = Math.max(0, el.offsetHeight - window.innerHeight);
      const stopY = top + span * PAGED_MOSAIC_SETTLED;
      // A tolerance band rather than an exact match: the reader is never
      // pixel-perfect on the stop even right after the paginated jump lands
      // there, and idle-snap or a scrollbar drag can settle a few pixels off.
      setShowPortfolioSubmenu(Math.abs(window.scrollY - stopY) < window.innerHeight * 0.04);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

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

  const statusLabel = 'Available for work';

  return (
    <div className="block min-h-screen">
      <BackgroundGrid visible={config.showGrid} />
      {CARD_TRAVEL_ENABLED && (
        <>
          <CardTravelGhost />
          <AboutTravelGhosts />
          <PortfolioTravelGhosts
            onOpenConnect={openConnect}
            playCount={connectGhostPlay}
            careerPlayCount={careerGhostPlay}
          />
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
        showPortfolioSubmenu={showPortfolioSubmenu}
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
          careerPlayCount={careerGhostPlay}
          careerReturnCount={careerReturnPlay}
        />
        <Career />
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

/**
 * Picks between the desktop site and the small-screen notice.
 *
 * A wrapper rather than an early return inside `DesktopApp`: that component
 * opens with a long run of hooks — scroll progress, paged snap, observers —
 * and hooks cannot be skipped conditionally. Branching a level up also means
 * none of that machinery mounts at all on a phone, so no scroll listeners or
 * `IntersectionObserver`s are set up for a layout that isn't being shown.
 */
function App({ config = DEFAULT_CONFIG }: { config?: SiteConfig }) {
  const isSmall = useIsSmallScreen();

  // `null` until the media query has been read — see `useIsSmallScreen`.
  // Rendering nothing for that first frame avoids showing the desktop site
  // and then swapping it out on exactly the devices that can't use it.
  if (isSmall === null) return null;
  return isSmall ? <SmallScreenNotice /> : <DesktopApp config={config} />;
}

export default App;
