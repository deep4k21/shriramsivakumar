import { AnimatePresence } from 'motion/react';
import { useCallback, useState } from 'react';
import { BackgroundGrid } from './components/BackgroundGrid';
import { Sidebar } from './components/Sidebar';
import { Hero } from './components/Hero';
import { Intro } from './components/Intro';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { Career } from './components/Career';
import { CategoryPage } from './components/CategoryPage';
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
  projectIdx: number | null;
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

  const openCategory = useCallback(
    (categoryIdx: number) => setView({ categoryIdx, projectIdx: null }),
    [],
  );
  const openProject = useCallback(
    (categoryIdx: number, projectIdx: number) => setView({ categoryIdx, projectIdx }),
    [],
  );
  const backToCategory = useCallback(
    () => setView((v) => (v ? { categoryIdx: v.categoryIdx, projectIdx: null } : v)),
    [],
  );
  const closeView = useCallback(() => setView(null), []);
  const closeConnect = useCallback(() => setConnectOpen(false), []);
  const openConnect = useCallback(() => setConnectOpen(true), []);

  useEscapeKey(
    useCallback(() => {
      setView((v) => (v && v.projectIdx != null ? { categoryIdx: v.categoryIdx, projectIdx: null } : null));
      setConnectOpen(false);
    }, []),
  );

  const statusLabel = config.availableForWork ? 'Available for work' : 'Currently abroad';

  return (
    <div className="block min-h-screen">
      <BackgroundGrid visible={config.showGrid} />

      <Sidebar active={active} visible={navOn} statusLabel={statusLabel} onOpenConnect={openConnect} />

      <main className="min-w-0">
        <Hero flipOnHover={config.flipOnHover} />
        <Intro />
        <About />
        <Portfolio onOpenCategory={openCategory} />
        <Career />
      </main>

      <AnimatePresence>
        {view && (
          <CategoryPage
            key="category"
            category={CATEGORIES[view.categoryIdx]}
            categoryIndex={view.categoryIdx}
            onClose={closeView}
            onOpenProject={(projectIdx) => openProject(view.categoryIdx, projectIdx)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {view?.projectIdx != null && (
          <ProjectPage
            key="project"
            category={CATEGORIES[view.categoryIdx]}
            initialProjectIdx={view.projectIdx}
            onBackToCategory={backToCategory}
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
