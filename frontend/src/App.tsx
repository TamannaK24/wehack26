import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Landmark,
  DoorOpen,
  Lock,
  ScrollText,
  Compass,
  Settings,
  UserCircle,
  ListFilter,
  DoorClosed,
} from 'lucide-react';
import CuratorsGallery from './pages/CuratorsGallery';
import DeepLedger from './pages/DeepLedger';
import RestorationProjects from './pages/RestorationProjects';
import InquiryEstate from './pages/InquiryEstate';
import CuratorSettings from './pages/CuratorSettings';
import type { Screen, TransitionType } from './types/navigation';

const TRANSITIONS = {
  push: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  push_back: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  slide_up: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
};

const Sidebar = ({
  currentScreen,
  onNavigate,
  isOpen,
}: {
  currentScreen: Screen;
  onNavigate: (screen: Screen, transition: TransitionType) => void;
  isOpen: boolean;
}) => {
  const navItems = [
    { id: 'GALLERY', label: 'Gallery Floor', icon: DoorOpen, transition: 'push_back' as const },
    { id: 'RESTORATION', label: 'Policy Vault', icon: Lock, transition: 'push' as const },
    { id: 'ARCHIVE', label: 'Claims Archive', icon: ScrollText, transition: 'push' as const },
    { id: 'INQUIRY', label: 'Risk Appraisal', icon: Compass, transition: 'push' as const },
    { id: 'SETTINGS', label: 'Curator Settings', icon: Settings, transition: 'push' as const },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-80 pt-24 pb-8 px-6 bg-[#131313]/90 backdrop-blur-xl border-r border-outline-variant/15 shadow-2xl shadow-black/80 z-40 flex flex-col transition-transform duration-500 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-10 px-4">
        <h2 className="font-headline text-lg tracking-wide uppercase text-primary">Curatorial Index</h2>
        <p className="font-label text-xs tracking-widest text-zinc-500 uppercase mt-1">Museum Risk Management</p>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen, item.transition)}
              className={`w-full flex items-center gap-4 px-4 py-4 transition-all duration-500 text-left ${
                isActive
                  ? 'bg-gradient-to-r from-primary-container/10 to-transparent border-l-4 border-primary text-primary translate-x-2'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
              }`}
            >
              <item.icon size={20} />
              <span className="font-headline text-lg tracking-wide uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-8 border-t border-outline-variant/10">
        <div className="flex items-center space-x-3 p-4 bg-surface-container-low">
          <div className="w-10 h-10 bg-primary-container/20 border border-primary/20 flex items-center justify-center">
            <UserCircle className="text-primary" size={24} />
          </div>
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-primary">Chief Curator</p>
            <p className="font-headline text-xs text-on-surface">Elias Thorne</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({
  isVisible,
}: {
  isVisible: boolean;
}) => (
  <header
    className={`fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#131313] border-b border-outline-variant/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
    }`}
  >
    <div className="flex items-center gap-6">
      <span className="text-3xl font-headline text-primary italic uppercase tracking-tight">The Nocturne Gallery</span>
    </div>
    <div className="flex items-center gap-8">
      <nav className="hidden md:flex space-x-8 font-headline text-primary tracking-tight">
        <a href="#" className="text-primary drop-shadow-[0_0_8px_rgba(233,193,118,0.5)]">Exhibits</a>
        <a href="#" className="text-zinc-500 hover:text-primary transition-colors">Collections</a>
        <a href="#" className="text-zinc-500 hover:text-primary transition-colors">Archive</a>
      </nav>
      <div className="flex items-center gap-4 border-l border-outline-variant/40 pl-6 text-primary">
        <Shield size={20} />
        <Landmark size={20} />
      </div>
    </div>
  </header>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('GALLERY');
  const [transition, setTransition] = useState<TransitionType>('push');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBar(window.scrollY <= 1);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavigate = (screen: Screen, type: TransitionType) => {
    setTransition(type);
    setCurrentScreen(screen);
  };

  const ScreenComponent = useMemo(() => {
    switch (currentScreen) {
      case 'GALLERY':
        return <CuratorsGallery onNavigate={handleNavigate} />;
      case 'ARCHIVE':
        return <DeepLedger onNavigate={handleNavigate} />;
      case 'RESTORATION':
        return <RestorationProjects onNavigate={handleNavigate} />;
      case 'INQUIRY':
        return <InquiryEstate onNavigate={handleNavigate} />;
      case 'SETTINGS':
        return <CuratorSettings onNavigate={handleNavigate} />;
    }
  }, [currentScreen]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-on-primary">
      <div className="film-grain" />

      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="fixed top-6 left-8 z-[60] w-10 h-10 border border-outline-variant/40 bg-[#131313]/90 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
        aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarOpen ? <DoorClosed size={18} /> : <ListFilter size={18} />}
      </button>

      <TopBar isVisible={showTopBar} />
      <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} isOpen={sidebarOpen} />

      <main className={`pt-32 pb-24 px-8 relative overflow-hidden transition-[padding] duration-500 ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-8'}`}>
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-[-5%] left-[20%] w-[400px] h-[400px] bg-secondary-container/5 blur-[100px] rounded-full pointer-events-none"></div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentScreen}
            initial={TRANSITIONS[transition].initial}
            animate={TRANSITIONS[transition].animate}
            exit={TRANSITIONS[transition].exit}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full"
          >
            {ScreenComponent}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={`w-full py-12 flex flex-col items-center justify-center space-y-4 border-t border-outline-variant/10 bg-[#0e0e0e] transition-[padding] duration-500 ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-8'}`}>
        <div className="font-headline italic text-sm text-secondary-container">The Nocturne Gallery</div>
        <div className="flex space-x-8">
          <a href="#" className="font-label text-[10px] tracking-widest uppercase text-zinc-600 hover:text-white transition-colors">Terms of Preservation</a>
          <a href="#" className="font-label text-[10px] tracking-widest uppercase text-zinc-600 hover:text-white transition-colors">Privacy Scroll</a>
          <a href="#" className="font-label text-[10px] tracking-widest uppercase text-zinc-600 hover:text-white transition-colors">Institutional Ethics</a>
        </div>
        <p className="font-label text-[10px] tracking-widest uppercase text-zinc-600 opacity-50">© 2024 The Nocturne Gallery - All Rights Reserved</p>
      </footer>
    </div>
  );
}
