import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Landmark, 
  DoorOpen, 
  Lock, 
  ScrollText, 
  Compass, 
  Settings, 
  AlertTriangle, 
  Activity, 
  Flower, 
  ShieldCheck, 
  ArrowRight, 
  Info, 
  Circle, 
  UserCircle,
  AlertCircle,
  Droplets,
  LockOpen,
  ExternalLink,
  ListFilter,
  DoorClosed
} from 'lucide-react';

// --- Types & Constants ---

type Screen = 'GALLERY' | 'ARCHIVE' | 'RESTORATION' | 'INQUIRY';
type TransitionType = 'push' | 'push_back' | 'slide_up';

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
  }
};

// --- Components ---

const Sidebar = ({ currentScreen, onNavigate, isOpen }: { currentScreen: Screen, onNavigate: (s: Screen, t: TransitionType) => void, isOpen: boolean }) => {
  const navItems = [
    { id: 'GALLERY', label: 'Gallery Floor', icon: DoorOpen, transition: 'push_back' as const },
    { id: 'RESTORATION', label: 'Policy Vault', icon: Lock, transition: 'push' as const },
    { id: 'ARCHIVE', label: 'Claims Archive', icon: ScrollText, transition: 'push' as const },
    { id: 'INQUIRY', label: 'Risk Appraisal', icon: Compass, transition: 'push' as const },
    { id: 'SETTINGS', label: 'Curator Settings', icon: Settings, transition: 'push' as const },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full w-80 pt-24 pb-8 px-6 bg-[#131313]/90 backdrop-blur-xl border-r border-outline-variant/15 shadow-2xl shadow-black/80 z-40 flex flex-col transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
              onClick={() => item.id !== 'SETTINGS' && onNavigate(item.id as Screen, item.transition)}
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

const TopBar = ({ sidebarOpen, onToggleSidebar }: { sidebarOpen: boolean, onToggleSidebar: () => void }) => (
  <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#131313] border-b border-outline-variant/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
    <div className="flex items-center gap-6">
      <button
        onClick={onToggleSidebar}
        className="w-10 h-10 border border-outline-variant/40 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
        aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarOpen ? <DoorClosed size={18} /> : <ListFilter size={18} />}
      </button>
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

// --- Screen 1: The Curator's Gallery ---
const CuratorsGallery = ({ onNavigate }: { onNavigate: (s: Screen, t: TransitionType) => void }) => (
  <div className="max-w-7xl mx-auto space-y-12">
    <section className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-outline-variant/10 pb-8">
      <div>
        <span className="font-label text-xs tracking-[0.3em] uppercase text-primary mb-2 block">Current Exhibition</span>
        <h1 className="text-6xl font-headline font-extrabold tracking-tighter text-on-surface">The Curator's Gallery</h1>
      </div>
      <div className="text-right">
        <div className="bg-secondary-container/10 border border-secondary-container/30 px-6 py-3 flex items-center gap-4">
          <AlertTriangle className="text-secondary" size={20} />
          <div className="text-left">
            <p className="font-label text-[10px] uppercase tracking-widest text-secondary font-bold">Active Threat Alert</p>
            <p className="font-headline italic text-secondary text-sm">Integrity breach detected in West Wing</p>
          </div>
        </div>
      </div>
    </section>

    <section className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-xl opacity-20"></div>
      <div className="relative bg-surface-container-low border-[12px] border-primary-container shadow-[0_50px_100px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(0,0,0,0.8)] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/40">
          <img 
            src="https://picsum.photos/seed/blueprint/1920/1080?blur=10" 
            alt="Estate Blueprint" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#e9c176]"></div>
                  <span className="font-label text-xs text-primary/80 uppercase tracking-widest">Structural Node: 04-A</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md p-4 border-l border-primary/40 space-y-1">
                  <p className="font-label text-[10px] text-zinc-400 uppercase tracking-widest">Material Appraisal</p>
                  <p className="font-headline text-lg text-on-surface">Italian Travertine & Steel</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-black/60 backdrop-blur-md p-6 border-b border-primary/40">
                  <p className="font-label text-xs text-zinc-400 uppercase tracking-widest mb-1">Archival Grade</p>
                  <p className="text-7xl font-headline font-black text-primary drop-shadow-[0_0_15px_rgba(233,193,118,0.4)]">84<span className="text-2xl text-primary/50">/100</span></p>
                  <p className="font-headline italic text-sm text-primary/70 mt-2">Elite Risk Intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-24">
              <div className="text-center">
                <div className="w-2 h-24 bg-gradient-to-t from-primary/60 to-transparent mx-auto mb-4"></div>
                <Activity className="text-primary mx-auto mb-2" size={32} />
                <p className="font-label text-[10px] text-zinc-400 uppercase tracking-widest">Seismic Monitoring</p>
                <p className="font-headline text-primary">Active</p>
              </div>
              <div className="text-center opacity-40">
                <div className="w-2 h-24 bg-gradient-to-t from-primary/60 to-transparent mx-auto mb-4"></div>
                <Flower className="text-primary mx-auto mb-2" size={32} />
                <p className="font-label text-[10px] text-zinc-500 uppercase tracking-widest">HVAC Filtration</p>
                <p className="font-headline text-zinc-500">Stable</p>
              </div>
              <div className="text-center opacity-40">
                <div className="w-2 h-24 bg-gradient-to-t from-primary/60 to-transparent mx-auto mb-4"></div>
                <ShieldCheck className="text-primary mx-auto mb-2" size={32} />
                <p className="font-label text-[10px] text-zinc-500 uppercase tracking-widest">Perimeter Grid</p>
                <p className="font-headline text-zinc-500">Engaged</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-surface p-8 shadow-2xl relative overflow-hidden group hover:translate-y-[-4px] transition-transform duration-500">
        <ScrollText className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" size={120} />
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-6">Historical Context</p>
        <h3 className="text-3xl font-headline mb-4 text-on-surface">Provenance Audit</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
            <span className="font-label text-xs text-zinc-500 uppercase">Original Build</span>
            <span className="font-headline text-on-surface">1924, Neo-Gothic</span>
          </div>
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
            <span className="font-label text-xs text-zinc-500 uppercase">Last Appraisal</span>
            <span className="font-headline text-on-surface">Oct 2023</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-label text-xs text-zinc-500 uppercase">Risk Level</span>
            <span className="font-headline text-secondary font-bold uppercase tracking-widest text-xs">Nominal</span>
          </div>
        </div>
        <div className="mt-8">
          <button 
            onClick={() => onNavigate('ARCHIVE', 'push')}
            className="w-full bg-primary-container text-on-primary py-3 font-headline uppercase tracking-widest text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            View Scroll <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="bg-surface p-8 shadow-2xl relative overflow-hidden group hover:translate-y-[-4px] transition-transform duration-500">
        <Activity className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" size={120} />
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-6">Climate Integrity</p>
        <h3 className="text-3xl font-headline mb-4 text-on-surface">Atmospheric Log</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-4 text-center">
            <p className="font-label text-[10px] text-zinc-500 uppercase mb-1">Humidity</p>
            <p className="font-headline text-2xl text-primary">48%</p>
          </div>
          <div className="bg-background p-4 text-center">
            <p className="font-label text-[10px] text-zinc-500 uppercase mb-1">Temp</p>
            <p className="font-headline text-2xl text-primary">68°F</p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-secondary-container/5 border border-secondary-container/20 flex gap-3">
          <Info className="text-secondary" size={16} />
          <p className="font-label text-[10px] text-zinc-400 uppercase leading-relaxed">Minor variance detected in archival storage chamber 3.</p>
        </div>
      </div>

      <div className="bg-secondary-container/20 p-8 shadow-2xl relative border-t-4 border-secondary-container overflow-hidden group hover:translate-y-[-4px] transition-transform duration-500">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary-container/20 rounded-full blur-3xl group-hover:bg-secondary-container/40 transition-all"></div>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-6">Security Incident</p>
        <h3 className="text-3xl font-headline mb-4 text-secondary">Active Perimeter Breach</h3>
        <p className="font-headline text-sm text-zinc-400 mb-6 italic leading-relaxed">Unidentified motion detected near the Northern Vault entry. Automated containment systems engaged.</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-secondary">
            <Circle size={12} fill="currentColor" />
            <span className="font-label text-xs uppercase tracking-widest font-bold">Deploy Guardians</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500">
            <Circle size={12} />
            <span className="font-label text-xs uppercase tracking-widest">Silent Alarm</span>
          </div>
        </div>
        <button className="mt-8 w-full border border-secondary-container text-secondary py-3 font-label uppercase tracking-[0.2em] text-[10px] font-black hover:bg-secondary-container hover:text-white transition-all">
          Execute Protocols
        </button>
      </div>
    </section>

    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-headline font-bold">Curated Assets</h2>
        <span className="font-label text-xs text-zinc-500 uppercase tracking-widest">Showing 4 of 124 works</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { id: 'NY-921', title: 'The Silent Observer', value: '$4.2M', img: 'https://picsum.photos/seed/art1/400/500' },
          { id: 'NY-922', title: 'Ethereal Form', value: '$1.8M', img: 'https://picsum.photos/seed/art2/400/500' },
          { id: 'NY-923', title: 'The Iron Crown', value: '$0.9M', img: 'https://picsum.photos/seed/art3/400/500' },
          { id: 'NY-924', title: 'Nocturnal Flow', value: '$2.1M', img: 'https://picsum.photos/seed/art4/400/500' },
        ].map((asset) => (
          <div key={asset.id} className="bg-surface-container p-6 flex flex-col gap-4 group cursor-pointer border border-transparent hover:border-primary/20 transition-all">
            <div className="w-full aspect-[4/5] bg-surface-container-highest overflow-hidden">
              <img 
                src={asset.img} 
                alt={asset.title} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-1">Asset ID: {asset.id}</p>
              <h4 className="font-headline text-lg">{asset.title}</h4>
              <p className="font-headline italic text-sm text-zinc-500">Estimated value: {asset.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

// --- Screen 2: The Archive: Deep Ledger ---
const DeepLedger = ({ onNavigate }: { onNavigate: (s: Screen, t: TransitionType) => void }) => (
  <div className="max-w-7xl mx-auto">
    <section className="mb-20 relative border-l-2 border-primary/30 pl-8">
      <p className="font-label text-primary uppercase tracking-[0.3em] text-xs mb-4">Volume IV: Security Ledger</p>
      <h1 className="text-6xl md:text-8xl font-headline italic text-on-background tracking-tighter mb-6">The Archive: <span className="text-primary/80">Deep Ledger</span></h1>
      <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl leading-relaxed italic">
        A comprehensive cartography of institutional vulnerability. Every entry is a testament to the preservation of the intangible.
      </p>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
      <div className="md:col-span-8 bg-surface-container-low p-1 rounded-none overflow-hidden group">
        <div className="h-32 bg-primary/5 flex items-end justify-center pb-4 mb-8 arch-mask">
          <h3 className="font-headline text-3xl text-primary tracking-widest uppercase">Environmental Decay</h3>
        </div>
        <div className="px-8 pb-12">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-1">
              <p className="font-label text-xs text-zinc-500 uppercase tracking-widest">Atmospheric Stability</p>
              <p className="text-4xl font-headline italic">94.2% Consistency</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shadow-lg">
              <Shield className="text-white/40" size={20} />
            </div>
          </div>
          <div className="h-48 w-full border-b border-primary/20 relative">
            <svg className="w-full h-full opacity-60" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path d="M0,80 Q50,75 100,85 T200,60 T300,70 T400,20" fill="none" stroke="#e9c176" strokeDasharray="5,3" strokeWidth="2" />
              <circle cx="400" cy="20" r="4" fill="#960711" />
            </svg>
            <div className="absolute top-0 right-0 text-[10px] font-label text-primary/40 uppercase rotate-90 translate-x-4">Ink Trace Index</div>
          </div>
          <p className="mt-6 text-sm text-zinc-400 italic leading-relaxed">
            Fluctuations in the western corridor noted during the winter solstice. Recommended recalibration of hydro-regulators in Wing B.
          </p>
        </div>
      </div>

      <div className="md:col-span-4 bg-surface-container-high p-8 flex flex-col justify-between border-t-4 border-primary/40">
        <div>
          <Compass className="text-primary mb-6" size={40} />
          <h3 className="font-headline text-2xl text-on-surface mb-4">Structural Integrity</h3>
          <ul className="space-y-6">
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary-container mt-1.5"></div>
              <div>
                <p className="font-label text-xs text-zinc-500 uppercase">Foundation Stress</p>
                <p className="text-sm italic">Nominal variance detected in the North Vault.</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
              <div>
                <p className="font-label text-xs text-zinc-500 uppercase">Load Bearing</p>
                <p className="text-sm italic">Optimal across all primary pedestals.</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="pt-8 border-t border-outline-variant/20">
          <div className="flex items-center justify-between">
            <p className="font-headline italic text-primary">Verified Status</p>
            <p className="font-label text-[10px] text-primary tracking-tighter italic">Signature: G. Thorne</p>
          </div>
        </div>
      </div>

      <div className="md:col-span-12 bg-secondary-container/10 p-12 border border-secondary-container/20 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary-container/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h3 className="font-headline text-4xl text-secondary mb-2">Critical Concerns</h3>
            <p className="font-label text-xs tracking-widest text-secondary uppercase">High-Tier Exposure Risks</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mt-6 md:mt-0 shadow-xl">
            <AlertCircle className="text-white/50" size={32} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: AlertTriangle, title: 'Light Exposure', desc: "Ultraviolet seepage in the 'Vignette Room' exceeds safety thresholds by 4%. Immediate shutter inspection required." },
            { icon: LockOpen, title: 'Access Breach', desc: "Unauthorized key-turn recorded at 03:42 in the Archive Sub-Level. No physical entry confirmed, digital ghosting suspected." },
            { icon: Droplets, title: 'Hydric Siphon', desc: "Condensation buildup behind the 17th-century tapestry wall. Risk of fungal spore activation: Elevated." },
          ].map((concern, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center space-x-2">
                <concern.icon className="text-secondary" size={16} />
                <h4 className="font-headline text-lg text-on-surface uppercase tracking-wide">{concern.title}</h4>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed italic">{concern.desc}</p>
              <button className="text-primary text-[10px] font-label uppercase tracking-widest hover:underline">Draft Intervention</button>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
      <div className="arch-mask bg-surface-container-highest overflow-hidden aspect-[4/5] relative">
        <img 
          src="https://picsum.photos/seed/paper/800/1000" 
          alt="Archival Paper" 
          className="w-full h-full object-cover grayscale opacity-60 mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>
      <div className="space-y-8">
        <h2 className="text-5xl font-headline italic leading-tight">Preserving the <span className="text-primary">Untouchable</span></h2>
        <p className="text-zinc-400 leading-relaxed">
          The Archive is more than a record of damage—it is a map of our collective memory. Each scratch on a marble bust or fade in a pigment is a note in the symphony of time. Our role is not just to prevent, but to document the inevitable passage.
        </p>
        <div className="flex space-x-8">
          <button 
            onClick={() => onNavigate('INQUIRY', 'slide_up')}
            className="bg-primary-container text-on-primary font-label text-xs uppercase tracking-[0.2em] px-8 py-4 shadow-xl hover:shadow-primary/20 transition-all"
          >
            Request Transcript
          </button>
          <button className="text-primary font-label text-xs uppercase tracking-[0.2em] border-b border-primary/40 pb-2 hover:border-primary transition-all">
            Curator Guidelines
          </button>
        </div>
      </div>
    </section>
  </div>
);

// --- Screen 3: Sanctuary Restoration Projects ---
const RestorationProjects = ({ onNavigate }: { onNavigate: (s: Screen, t: TransitionType) => void }) => (
  <div className="max-w-7xl mx-auto">
    <section className="mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="font-label text-sm tracking-[0.3em] uppercase text-primary mb-4 block">Operation: Sanctum</span>
          <h1 className="text-5xl md:text-7xl font-headline italic tracking-tighter text-on-background max-w-2xl">Sanctuary Restoration Projects</h1>
        </div>
        <div className="text-right">
          <p className="font-label text-xs uppercase tracking-widest text-zinc-500 mb-2">Total Restoration Progress</p>
          <div className="w-64 h-2 bg-surface-container-highest relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary w-3/4 shadow-[0_0_15px_rgba(233,193,118,0.6)]"></div>
          </div>
          <span className="font-serif italic text-2xl text-primary mt-2 block">75% Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { title: 'Varnishing the High Altar', desc: 'Repairing environmental oxidation layers on the central exhibit frames.', progress: 'Completed', img: 'https://picsum.photos/seed/rest1/600/400' },
          { title: 'The Lidar Recalibration', desc: 'Updating the volumetric perimeter sensors around the Marble Atrium.', progress: '42%', img: 'https://picsum.photos/seed/rest2/600/400' },
          { title: 'Preservation Scroll Crypt', desc: 'Securing the digital backups of the insurance archives.', progress: 'Locked', img: 'https://picsum.photos/seed/rest3/600/400' },
        ].map((project, idx) => (
          <div key={idx} className="group relative bg-surface-container-low border border-outline-variant/15 p-1 transition-all duration-700 hover:shadow-[0_0_40px_rgba(233,193,118,0.15)]">
            <div className="bg-surface p-6 h-full flex flex-col justify-between">
              <div>
                <div className="arch-mask overflow-hidden h-48 mb-6 relative">
                  <img 
                    src={project.img} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
                </div>
                <h3 className="font-headline text-3xl mb-2 text-primary tracking-tight">{project.title}</h3>
                <p className="font-headline text-zinc-400 text-lg leading-relaxed mb-6">{project.desc}</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-label text-xs uppercase tracking-widest text-zinc-500">{project.progress === 'Locked' ? 'Locked Exhibit' : 'Progress'}</span>
                  <span className="font-headline text-primary italic">{project.progress}</span>
                </div>
                <div className="h-1 w-full bg-surface-container-highest relative">
                  {project.progress === 'Completed' && <div className="absolute inset-0 gold-shimmer w-full opacity-80"></div>}
                  {project.progress === '42%' && <div className="absolute inset-y-0 left-0 gold-shimmer w-[42%]"></div>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="mt-32 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent"></div>
      <div className="text-center mb-20">
        <span className="font-label text-sm tracking-[0.5em] uppercase text-zinc-500 mb-4 block">Legacy Recognition</span>
        <h2 className="text-6xl font-headline tracking-tighter italic">Hall of Honors</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { title: 'Vanguard of Security', date: 'Earned Dec 2023', img: 'https://picsum.photos/seed/medal1/200/200' },
          { title: 'Aegis Custodian', date: 'Locked Artifact', img: 'https://picsum.photos/seed/medal2/200/200', locked: true },
          { title: 'Master Restorer', date: 'Earned Jan 2024', img: 'https://picsum.photos/seed/medal3/200/200' },
          { title: 'Patron’s Guard', date: 'Institutional Honors', img: 'https://picsum.photos/seed/medal4/200/200', elite: true },
        ].map((medal, idx) => (
          <div key={idx} className={`flex flex-col items-center group ${medal.locked ? 'opacity-40' : ''}`}>
            <div className={`w-40 h-40 relative flex items-center justify-center p-4 border border-outline-variant/10 shadow-2xl ${medal.elite ? 'bg-secondary-container/10 border-secondary-container/20' : 'bg-surface-container-high'}`}>
              <img 
                src={medal.img} 
                alt={medal.title} 
                className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              {medal.locked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="text-zinc-600" size={32} />
                </div>
              )}
              {medal.elite && (
                <div className="absolute -top-2 -right-2 bg-secondary-container text-white px-2 py-1 font-label text-[8px] uppercase tracking-tighter">Elite</div>
              )}
            </div>
            <span className={`font-headline text-xl mt-6 transition-colors ${medal.elite ? 'text-secondary' : 'text-on-background group-hover:text-primary'}`}>{medal.title}</span>
            <span className="font-label text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{medal.date}</span>
          </div>
        ))}
      </div>
    </section>
  </div>
);

// --- Screen 4: Inquiry into the Estate ---
const InquiryEstate = ({ onNavigate }: { onNavigate: (s: Screen, t: TransitionType) => void }) => (
  <div className="max-w-7xl mx-auto">
    <nav className="flex items-center justify-center mb-20 space-x-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex items-center ${i > 1 ? 'opacity-40' : ''}`}>
          <div className={`w-12 h-16 border flex items-center justify-center ${i === 1 ? 'border-primary bg-surface-container-low' : 'border-outline-variant bg-surface-container-lowest'}`}>
            {i === 1 ? <DoorOpen className="text-primary" size={24} /> : <DoorClosed className="text-outline" size={24} />}
          </div>
          {i < 4 && <div className="h-[1px] w-8 bg-outline-variant/30"></div>}
        </div>
      ))}
    </nav>

    <section className="mb-16 text-center">
      <h1 className="text-5xl md:text-7xl font-headline italic tracking-tighter text-primary mb-4">Inquiry into the Estate</h1>
      <p className="font-label text-sm uppercase tracking-[0.3em] text-zinc-500">Step I: Architectural Provenance</p>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { title: 'The Neoclassical', desc: 'Structures built between 1750–1850. Characterized by grandeur of scale and geometric forms.', img: 'https://picsum.photos/seed/arch1/600/800' },
        { title: 'The Gothic Revival', desc: '19th-century interpretations of medieval motifs. Features high pointed arches.', img: 'https://picsum.photos/seed/arch2/600/800', active: true },
        { title: 'The Modernist', desc: '20th-century functionalism. Emphasizes volume over mass and balance over symmetry.', img: 'https://picsum.photos/seed/arch3/600/800' },
      ].map((era, idx) => (
        <div key={idx} className={`group relative p-1 transition-all duration-700 ${era.active ? 'bg-surface-container-high ring-1 ring-secondary-container' : 'bg-surface-container-low hover:bg-primary/10'}`}>
          <div className="relative overflow-hidden aspect-[3/4] mb-6">
            <img 
              src={era.img} 
              alt={era.title} 
              className="arch-mask object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="px-4 pb-8">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-headline text-primary">{era.title}</h3>
              {era.active && <span className="font-label text-[10px] bg-secondary-container text-white px-2 py-1 tracking-tighter">HIGH RISK</span>}
            </div>
            <p className="font-headline text-zinc-400 text-sm mb-6 leading-relaxed">{era.desc}</p>
            {era.active && (
              <div className="mb-6 p-4 bg-secondary-container/10 border-l-2 border-secondary-container">
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <AlertCircle size={12} />
                  <span className="font-label text-[10px] uppercase tracking-widest">Appraisal Note</span>
                </div>
                <p className="text-xs font-headline italic text-secondary">Stone degradation and foundational subsidence common.</p>
              </div>
            )}
            <button 
              onClick={() => era.active && onNavigate('RESTORATION', 'push')}
              className={`w-full py-4 font-label text-xs tracking-widest uppercase transition-all duration-500 ${era.active ? 'bg-primary text-on-primary' : 'border border-primary/20 text-primary hover:bg-primary hover:text-on-primary'}`}
            >
              {era.active ? 'Era Selected' : 'Select This Era'}
            </button>
          </div>
        </div>
      ))}
    </div>

    <section className="mt-32 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
      <div className="md:col-span-5 order-2 md:order-1">
        <div className="relative group">
          <div className="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-primary/30"></div>
          <img 
            src="https://picsum.photos/seed/ledger/800/600" 
            alt="Antique Ledger" 
            className="w-full shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b border-r border-primary/30"></div>
        </div>
      </div>
      <div className="md:col-span-7 order-1 md:order-2">
        <h2 className="text-4xl font-headline text-primary mb-6 italic leading-snug">The record of your estate is the beginning of its preservation.</h2>
        <p className="font-headline text-lg text-zinc-400 mb-8 leading-relaxed max-w-lg">
          Each artifact selected informs the curatorial risk profile. Our appraisal engine cross-references historical architectural data with modern climatic shifts to ensure your legacy remains untarnished.
        </p>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-2 h-2 bg-primary group-hover:scale-150 transition-transform"></div>
            <span className="font-label text-sm uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">Review Foundation Ethics</span>
          </div>
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-2 h-2 bg-primary group-hover:scale-150 transition-transform"></div>
            <span className="font-label text-sm uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">Download Vault Protocol</span>
          </div>
        </div>
      </div>
    </section>
  </div>
);

// --- Main App ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('GALLERY');
  const [transition, setTransition] = useState<TransitionType>('push');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigate = (screen: Screen, type: TransitionType) => {
    setTransition(type);
    setCurrentScreen(screen);
  };

  const ScreenComponent = useMemo(() => {
    switch (currentScreen) {
      case 'GALLERY': return <CuratorsGallery onNavigate={handleNavigate} />;
      case 'ARCHIVE': return <DeepLedger onNavigate={handleNavigate} />;
      case 'RESTORATION': return <RestorationProjects onNavigate={handleNavigate} />;
      case 'INQUIRY': return <InquiryEstate onNavigate={handleNavigate} />;
    }
  }, [currentScreen]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-on-primary">
      <div className="film-grain" />
      
      <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} isOpen={sidebarOpen} />

      <main className={`pt-32 pb-24 px-8 relative overflow-hidden transition-[padding] duration-500 ${sidebarOpen ? 'lg:pl-80' : 'lg:pl-8'}`}>
        {/* Atmospheric Light Leaks */}
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
