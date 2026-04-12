import { useCallback, useEffect, useMemo, useState } from 'react';
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
import CuratorsGallery from './pages/GalleryPage';
import DeepLedger from './pages/DeepLedger';
import RestorationProjects from './pages/RestorationProjects';
import InquiryEstate from './pages/InquiryEstate';
import CuratorSettings from './pages/CuratorSettings';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import { hasBrowserSession, loadUser, setBrowserSession, type StoredUser } from './lib/authStorage';
import type { Screen, TransitionType } from './types/navigation';

type Gate = 'auth' | 'onboarding' | 'app';

/**
 * Require an active session (set on login/sign-up). Otherwise we always show auth first —
 * without this, a stored user with incomplete onboarding skipped straight to the intake form.
 */
function initialGate(): Gate {
  if (!hasBrowserSession()) return 'auth';
  const u = loadUser();
  if (!u) return 'auth';
  if (!u.onboardingComplete) return 'onboarding';
  return 'app';
}

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
    { id: 'GALLERY', label: 'Floor plan', icon: DoorOpen, transition: 'push_back' as const },
    { id: 'RESTORATION', label: 'Vault ops', icon: Lock, transition: 'push' as const },
    { id: 'ARCHIVE', label: 'Signal log', icon: ScrollText, transition: 'push' as const },
    { id: 'INQUIRY', label: 'Asset sweep', icon: Compass, transition: 'push' as const },
    { id: 'SETTINGS', label: 'Cover ID', icon: Settings, transition: 'push' as const },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-80 pt-24 pb-8 px-6 bg-[#060304]/95 backdrop-blur-xl border-r border-red-950/35 shadow-2xl shadow-black/90 z-40 flex flex-col transition-transform duration-500 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-10 px-4">
        <h2 className="font-headline text-xl tracking-[0.12em] uppercase text-white">Operations</h2>
        <p className="font-label text-[10px] tracking-widest text-red-400/70 uppercase mt-2">Nocturne · red cell</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen, item.transition)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 transition-all duration-300 text-left rounded-sm ${
                isActive
                  ? 'bg-red-950/40 border-l-4 border-red-500 text-red-300 translate-x-1 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.12)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-red-400' : 'text-zinc-500'} />
              <span className="font-headline text-base tracking-wide uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-8 border-t border-red-950/25">
        <div className="flex items-center space-x-3 p-4 bg-[#0a0506] ring-1 ring-red-950/40">
          <div className="w-10 h-10 bg-red-950/50 border border-red-800/40 flex items-center justify-center">
            <UserCircle className="text-red-300" size={24} />
          </div>
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-red-400/90">Field lead</p>
            <p className="font-headline text-xs text-white tracking-wide">E. Thorne</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({
  isVisible,
  sidebarOpen,
}: {
  isVisible: boolean;
  sidebarOpen: boolean;
}) => (
  <header
    className={`fixed top-0 w-full z-50 flex justify-between items-center h-20 pr-8 pl-24 bg-[#060304]/95 border-b border-red-950/30 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md transition-[padding,transform,opacity] duration-300 ${
      isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
    }`}
  >
    <div className="flex items-center gap-6">
      <span className="text-2xl sm:text-3xl font-headline text-white uppercase tracking-[0.08em]">
        Nocturne <span className="text-red-400">ops</span>
      </span>
    </div>
    <div className="flex items-center gap-8">
      <nav className="hidden md:flex space-x-8 font-label text-[11px] uppercase tracking-[0.2em]">
        <a href="#" className="text-red-300/90 hover:text-white transition-colors">
          Brief
        </a>
        <a href="#" className="text-zinc-500 hover:text-red-300 transition-colors">
          Intel
        </a>
        <a href="#" className="text-zinc-500 hover:text-red-300 transition-colors">
          Comms
        </a>
      </nav>
      <div className="flex items-center gap-4 border-l border-red-950/40 pl-6 text-red-400/90">
        <Shield size={20} />
        <Landmark size={20} />
      </div>
    </div>
  </header>
);

export default function App() {
  const [gate, setGate] = useState<Gate>(() => initialGate());
  const [currentScreen, setCurrentScreen] = useState<Screen>('GALLERY');
  const [transition, setTransition] = useState<TransitionType>('push');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);

  const handleAuthenticated = useCallback((user: StoredUser) => {
    setBrowserSession();
    if (user.onboardingComplete) setGate('app');
    else setGate('onboarding');
  }, []);

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

  const showAppChrome = gate === 'app';

  const gateContent = useMemo(() => {
    if (gate === 'auth') {
      return <AuthPage onSuccess={handleAuthenticated} />;
    }
    if (gate === 'onboarding') {
      return <OnboardingPage onComplete={() => setGate('app')} />;
    }
    return null;
  }, [gate, handleAuthenticated]);

  return (
    <div className="min-h-screen bg-background selection:bg-red-600/35 selection:text-white">
      <div className="film-grain" />

      {showAppChrome && (
        <>
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="fixed top-6 left-8 z-[60] w-10 h-10 border border-red-900/50 bg-[#0a0506]/95 text-red-400 hover:bg-red-950/60 hover:text-white transition-colors flex items-center justify-center"
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? <DoorClosed size={18} /> : <ListFilter size={18} />}
          </button>

          <TopBar isVisible={showTopBar} sidebarOpen={sidebarOpen} />
          <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} isOpen={sidebarOpen} />
        </>
      )}

      <main
        className={`relative min-w-0 overflow-x-hidden transition-[padding] duration-500 ${
          showAppChrome
            ? `pt-32 pb-24 px-8 ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-8'}`
            : 'min-h-screen pt-16 pb-20 px-4 sm:px-6'
        }`}
      >
        {showAppChrome && (
          <>
            <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/12 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-5%] left-[20%] w-[400px] h-[400px] bg-red-950/20 blur-[100px] rounded-full pointer-events-none" />
          </>
        )}

        {!showAppChrome ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={gate}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              {gateContent}
            </motion.div>
          </AnimatePresence>
        ) : (
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
        )}
      </main>

      {showAppChrome && (
        <footer
          className={`w-full py-12 flex flex-col items-center justify-center space-y-4 border-t border-red-950/25 bg-[#030203] transition-[padding] duration-500 ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-8'}`}
        >
          <div className="font-headline text-sm uppercase tracking-[0.15em] text-white/90">Nocturne ops</div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <a href="#" className="font-label text-[10px] tracking-widest uppercase text-zinc-500 hover:text-red-300 transition-colors">
              Rules of engagement
            </a>
            <a href="#" className="font-label text-[10px] tracking-widest uppercase text-zinc-500 hover:text-red-300 transition-colors">
              Signal privacy
            </a>
            <a href="#" className="font-label text-[10px] tracking-widest uppercase text-zinc-500 hover:text-red-300 transition-colors">
              Disclosure
            </a>
          </div>
          <p className="font-label text-[10px] tracking-widest uppercase text-zinc-600">© 2026 Nocturne — classified UI demo</p>
        </footer>
      )}
    </div>
  );
}
