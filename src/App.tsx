import { AnimatePresence } from 'motion/react';
import { useCallback, useState } from 'react';
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
import { useEscapeKey } from './hooks/useEscapeKey';
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

  const openProject = useCallback(
    (categoryIdx: number, projectIdx: number) => setView({ categoryIdx, projectIdx }),
    [],
  );
  const closeView = useCallback(() => setView(null), []);
  const closeConnect = useCallback(() => setConnectOpen(false), []);
  const openConnect = useCallback(() => setConnectOpen(true), []);

  useEscapeKey(
    useCallback(() => {
      setView(null);
      setConnectOpen(false);
    }, []),
  );

  const statusLabel = config.availableForWork ? 'Available for work' : 'Currently abroad';

  return (
    <div className="block min-h-screen">
      <BackgroundGrid visible={config.showGrid} />
      {CARD_TRAVEL_ENABLED && (
        <>
          <CardTravelGhost />
          <AboutTravelGhosts />
          <PortfolioTravelGhosts />
        </>
      )}

      <Sidebar active={active} visible={navOn} statusLabel={statusLabel} onOpenConnect={openConnect} />

      <main className="min-w-0">
        <Hero flipOnHover={config.flipOnHover} />
        <Intro />
        <About />
        <Portfolio onOpenProject={openProject} overlayOpen={view !== null} />
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

export default App;
