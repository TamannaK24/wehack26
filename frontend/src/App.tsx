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
} from 'lucide-react';
import CuratorsGallery from './pages/GalleryPage';
import DeepLedger from './pages/DeepLedger';
import RestorationProjects from './pages/RestorationProjects';
import InquiryEstate from './pages/InquiryEstate';
import CuratorSettings from './pages/CuratorSettings';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import {
  clearBrowserSession,
  clearUser,
  hasBrowserSession,
  loadUser,
  setBrowserSession,
  type StoredUser,
} from './lib/authStorage';
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

const APP_NAV: {
  id: Screen;
  label: string;
  icon: typeof DoorOpen;
  transition: TransitionType;
}[] = [
  { id: 'GALLERY', label: 'Floor plan', icon: DoorOpen, transition: 'push_back' },
  { id: 'RESTORATION', label: 'Vault ops', icon: Lock, transition: 'push' },
  { id: 'ARCHIVE', label: 'Signal log', icon: ScrollText, transition: 'push' },
  { id: 'INQUIRY', label: 'Asset sweep', icon: Compass, transition: 'push' },
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

  return (
  <header className="fixed top-0 z-50 w-full bg-background/90 backdrop-blur-md">
    <div className="mx-auto flex max-w-[1920px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-2 lg:px-8">
      <div className="flex shrink-0 items-center justify-between gap-4 sm:min-w-0">
        <span className="font-headline text-xl uppercase tracking-[0.08em] text-white sm:text-2xl">
          React <span className="text-red-400">Radar</span>
        </span>
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={openSettings}
            aria-label="Open settings"
            className={`flex h-8 w-8 items-center justify-center border border-red-900/50 bg-red-950/40 transition-colors hover:bg-red-950/60 ${
              settingsActive ? 'ring-1 ring-red-400/50' : ''
            }`}
          >
            <UserCircle className="text-red-300" size={18} aria-hidden />
          </button>
        </div>
      </div>

      <nav
        className="-mx-1 flex min-w-0 flex-1 items-center justify-start gap-1 overflow-x-auto pb-1 sm:mx-0 sm:justify-center sm:pb-0 sm:pt-0.5"
        aria-label="Primary"
      >
        {APP_NAV.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id, item.transition)}
              className={`flex shrink-0 items-center gap-2 rounded-sm px-3 py-2 font-label text-[10px] uppercase tracking-[0.12em] transition-colors sm:px-3.5 sm:py-2 sm:text-[11px] ${
                isActive
                  ? 'bg-red-950/50 text-red-200 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.2)]'
                  : 'text-zinc-500 hover:bg-white/5 hover:text-red-200/90'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-red-400' : 'text-zinc-500'} aria-hidden />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="hidden shrink-0 items-center gap-4 border-red-950/40 sm:flex sm:border-l sm:pl-5">
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={openSettings}
            aria-label="Open settings"
            className={`flex h-9 w-9 shrink-0 items-center justify-center border border-red-900/50 bg-[#0a0506] transition-colors hover:bg-red-950/40 ${
              settingsActive ? 'ring-1 ring-red-400/50' : ''
            }`}
          >
            <UserCircle className="text-red-300" size={22} aria-hidden />
          </button>
          <div className="leading-tight">
            <p className="font-label text-[9px] uppercase tracking-widest text-red-400/90">Field lead</p>
            <p className="font-headline text-xs tracking-wide text-white">E. Thorne</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-red-400/90">
          <Shield size={20} aria-hidden />
          <Landmark size={20} aria-hidden />
        </div>
      </div>
    </div>
  </header>
  );
};

export default function App() {
  const [gate, setGate] = useState<Gate>(() => initialGate());
  const [currentScreen, setCurrentScreen] = useState<Screen>('GALLERY');
  const [transition, setTransition] = useState<TransitionType>('push');
  const handleAuthenticated = useCallback((user: StoredUser) => {
    setBrowserSession();
    if (user.onboardingComplete) setGate('app');
    else setGate('onboarding');
  }, []);

  const handleNavigate = (screen: Screen, type: TransitionType) => {
    setTransition(type);
    setCurrentScreen(screen);
  };

  const handleLogout = useCallback(() => {
    clearUser();
    clearBrowserSession();
    setCurrentScreen('GALLERY');
    setGate('auth');
  }, []);

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
          <div className="font-headline text-sm uppercase tracking-[0.15em] text-white/90">React Radar</div>
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
          <p className="font-label text-[10px] tracking-widest uppercase text-zinc-600">© 2026 React Radar — UI demo</p>
        </footer>
      )}
    </div>
  );
}
