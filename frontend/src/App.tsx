import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Landmark,
  DoorOpen,
  Lock,
  ScrollText,
  Compass,
  UserCircle,
  Clock3,
} from 'lucide-react';
import CuratorsGallery from './pages/GalleryPage';
import DeepLedger from './pages/DeepLedger';
import RiskTimelinePage from './pages/RiskTimelinePage';
import RestorationProjects from './pages/RestorationProjects';
import InquiryEstate from './pages/InquiryEstate';
import LandingPage from './pages/LandingPage';
import CuratorSettings from './pages/CuratorSettings';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import type { Screen, TransitionType } from './types/navigation';

type Gate = 'auth' | 'onboarding' | 'app';

/**
 * Require an active session (set on login/sign-up). Otherwise we always show auth first —
 * without this, a stored user with incomplete onboarding skipped straight to the intake form.
 */
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

const APP_NAV: {
  id: Screen;
  label: string;
  icon: typeof DoorOpen;
  transition: TransitionType;
}[] = [
  { id: 'GALLERY', label: 'Floor plan', icon: DoorOpen, transition: 'push_back' },
  { id: 'RESTORATION', label: 'Risk Score', icon: Lock, transition: 'push' },
  { id: 'ARCHIVE', label: 'Signal log', icon: ScrollText, transition: 'push' },
  { id: 'TIMELINE', label: 'Timeline', icon: Clock3, transition: 'push' },
  { id: 'INQUIRY', label: 'Simulator', icon: Compass, transition: 'push' },
];

const TopBar = ({
  currentScreen,
  onNavigate,
}: {
  currentScreen: Screen;
  onNavigate: (screen: Screen, transition: TransitionType) => void;
}) => {
  const openSettings = () => onNavigate('SETTINGS', 'push');
  const settingsActive = currentScreen === 'SETTINGS';

  const NavItems = ({ mobile }: { mobile?: boolean }) => (
    <>
      {APP_NAV.map((item) => {
        const isActive = currentScreen === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id, item.transition)}
            className={`relative flex shrink-0 items-center gap-2 px-4 font-label text-[11px] uppercase tracking-[0.15em] transition-all duration-200
              ${mobile ? 'py-2.5' : 'py-4'}
              ${isActive
                ? 'text-primary'
                : 'text-white/40 hover:text-white/80'
              }`}
          >
            <Icon size={15} aria-hidden />
            <span className="whitespace-nowrap">{item.label}</span>
            {/* Active underline */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
        );
      })}
    </>
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant/40 bg-surface-container-lowest/95 backdrop-blur-md">
      {/* ── Desktop: true 3-col grid so nav is always centred ── */}
      <div className="mx-auto hidden max-w-[1920px] grid-cols-[1fr_auto_1fr] items-stretch sm:grid sm:px-6 lg:px-8">
        {/* Left — brand */}
        <div className="flex items-center py-3">
          <span className="font-headline text-xl uppercase tracking-[0.1em] text-white lg:text-2xl">
            Risk <span className="text-primary">Radar</span>
          </span>
        </div>

        {/* Centre — nav (auto width, perfectly centred in grid) */}
        <nav className="flex items-stretch gap-0" aria-label="Primary">
          <NavItems />
        </nav>

        {/* Right — user section */}
        <div className="flex items-center justify-end gap-4 border-l border-outline-variant/30 pl-5">
          <button
            type="button"
            onClick={openSettings}
            aria-label="Open settings"
            className={`flex h-8 w-8 shrink-0 items-center justify-center border transition-colors
              ${settingsActive
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-outline-variant/50 bg-surface-container-low text-white/50 hover:border-primary/40 hover:text-primary/80'
              }`}
          >
            <UserCircle size={20} aria-hidden />
          </button>
          <div className="leading-tight hidden lg:block">
            <p className="font-label text-[9px] uppercase tracking-widest text-primary/70">Field Lead</p>
            <p className="font-headline text-xs tracking-wide text-white">Risk Radar</p>
          </div>
          <div className="flex items-center gap-3 text-primary/60 border-l border-outline-variant/30 pl-4">
            <Shield size={18} aria-hidden />
            <Landmark size={18} aria-hidden />
          </div>
        </div>
      </div>

      {/* ── Mobile: brand row + scrollable nav row ── */}
      <div className="flex items-center justify-between px-4 py-3 sm:hidden">
        <span className="font-headline text-xl uppercase tracking-[0.1em] text-white">
          Risk <span className="text-primary">Radar</span>
        </span>
        <button
          type="button"
          onClick={openSettings}
          aria-label="Open settings"
          className={`flex h-8 w-8 items-center justify-center border transition-colors
            ${settingsActive
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-outline-variant/50 bg-surface-container-low text-white/50'
            }`}
        >
          <UserCircle size={18} aria-hidden />
        </button>
      </div>
      <nav
        className="flex items-stretch gap-0 overflow-x-auto border-t border-outline-variant/25 px-2 sm:hidden"
        aria-label="Primary"
      >
        <NavItems mobile />
      </nav>
    </header>
  );
};

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [gate, setGate] = useState<Gate>('auth');
  const [currentScreen, setCurrentScreen] = useState<Screen>('GALLERY');
  const [transition, setTransition] = useState<TransitionType>('push');
  const handleAuthenticated = useCallback(() => {
    setGate('onboarding');
  }, []);

  const handleNavigate = (screen: Screen, type: TransitionType) => {
    setTransition(type);
    setCurrentScreen(screen);
  };

  const handleLogout = useCallback(() => {
    setCurrentScreen('GALLERY');
    setGate('auth');
  }, []);

  const ScreenComponent = useMemo(() => {
    switch (currentScreen) {
      case 'GALLERY':
        return <CuratorsGallery onNavigate={handleNavigate} />;
      case 'ARCHIVE':
        return <DeepLedger onNavigate={handleNavigate} />;
      case 'TIMELINE':
        return <RiskTimelinePage onNavigate={handleNavigate} />;
      case 'RESTORATION':
        return <RestorationProjects onNavigate={handleNavigate} />;
      case 'INQUIRY':
        return <InquiryEstate onNavigate={handleNavigate} />;
      case 'SETTINGS':
        return <CuratorSettings onNavigate={handleNavigate} onLogout={handleLogout} />;
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
      {!hasEntered && <LandingPage onEnter={() => setHasEntered(true)} />}
      <div className="film-grain" />

      {showAppChrome && <TopBar currentScreen={currentScreen} onNavigate={handleNavigate} />}

      <main
        className={`relative min-w-0 overflow-x-hidden ${
          showAppChrome
            ? 'bg-background px-4 pb-24 pt-[calc(env(safe-area-inset-top,0px)+6.75rem)] sm:px-8 sm:pt-[calc(env(safe-area-inset-top,0px)+4.75rem)]'
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
          className="w-full px-4 py-12 sm:px-8 flex flex-col items-center justify-center space-y-4 border-t border-red-950/25 bg-[#030203]"
        >
          <div className="font-headline text-sm uppercase tracking-[0.15em] text-white/90">Risk Radar</div>
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
          <p className="font-label text-[10px] tracking-widest uppercase text-zinc-600">© 2026 Risk Radar — UI demo</p>
        </footer>
      )}
    </div>
  );
}
