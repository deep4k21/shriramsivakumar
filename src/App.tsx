import { AnimatePresence } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
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
import { CATEGORIES } from './data/content';
import './styles/global.css';

interface View {
  categoryIdx: number;
  projectIdx: number;
}

export interface SiteConfig {
  showGrid: boolean;
  gridRadius: number;
  flipOnHover: boolean;
  availableForWork: boolean;
}

const DEFAULT_CONFIG: SiteConfig = {
  showGrid: true,
  gridRadius: 210,
  flipOnHover: false,
  availableForWork: true,
};

function App({ config = DEFAULT_CONFIG }: { config?: SiteConfig }) {
  const { active } = useActiveSection();
  const navOn = useNavVisible();
  usePointerGlow(config.gridRadius);

  const [view, setView] = useState<View | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
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

      <Sidebar active={active} visible={navOn} statusLabel={statusLabel} onOpenConnect={openConnect} />

      <main className="min-w-0">
        <Hero flipOnHover={config.flipOnHover} />
        <Intro />
        <About />
        <Portfolio onOpenProject={openProject} overlayOpen={view !== null} />
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
