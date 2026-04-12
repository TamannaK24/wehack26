import {
  UserCircle,
  Shield,
  Bell,
  Crown,
  ArrowRight,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

const CuratorSettings = ({
  onNavigate,
  onLogout,
}: {
  onNavigate: NavigateFn;
  onLogout: () => void;
}) => (
  <div className="max-w-7xl mx-auto space-y-12">
    <section className="mb-8 border-l-2 border-red-800/40 pl-8">
      <p className="font-label text-red-400/90 uppercase tracking-[0.3em] text-xs mb-4">Cover ID · Backstop</p>
      <h1 className="text-6xl md:text-7xl font-headline uppercase tracking-tighter text-on-background">
        Identity <span className="text-red-400">settings</span>
      </h1>
      <p className="mt-4 text-zinc-400 max-w-2xl">Aliases, access, and dead-drop alerts for this workstation.</p>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-surface-container-low p-6 border border-outline-variant/20 space-y-6">
        <div className="w-28 h-28 bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
          <UserCircle className="text-primary" size={56} />
        </div>
        <div>
          <p className="font-headline text-2xl text-on-surface">Alistair Vance</p>
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Master Conservator</p>
        </div>
        <button className="w-full border border-outline-variant/30 text-primary py-3 font-label uppercase tracking-[0.2em] text-[10px] hover:bg-primary hover:text-on-primary transition-all">
          Change Portrait
        </button>
      </div>

      <div className="lg:col-span-2 bg-surface p-8 border border-outline-variant/10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="space-y-2">
            <span className="font-label text-[10px] uppercase tracking-widest text-primary">Full Name</span>
            <input defaultValue="Alistair Vance" className="w-full bg-background border border-outline-variant/25 px-4 py-3 text-on-surface" />
          </label>
          <label className="space-y-2">
            <span className="font-label text-[10px] uppercase tracking-widest text-primary">Public Alias</span>
            <input defaultValue="The_Vance_Archive" className="w-full bg-background border border-outline-variant/25 px-4 py-3 text-on-surface" />
          </label>
        </div>
        <label className="space-y-2 block">
          <span className="font-label text-[10px] uppercase tracking-widest text-primary">Email Address</span>
          <input defaultValue="alistair.vance@curator.digital" className="w-full bg-background border border-outline-variant/25 px-4 py-3 text-on-surface" />
        </label>
        <div className="flex justify-end">
          <button className="px-8 py-3 bg-primary text-on-primary font-label uppercase tracking-widest text-[10px] font-bold hover:brightness-110">
            Save Changes
          </button>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-surface-container-low p-8 border-t-4 border-primary/40 space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <Shield size={20} />
          <h2 className="font-headline text-2xl">Security & Access</h2>
        </div>
        <p className="text-zinc-400">Update keyphrase, linked devices, and two-factor settings for archive access.</p>
        <button className="text-primary font-label text-[10px] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
          Update Keyphrase <ArrowRight size={12} />
        </button>
      </div>

      <div className="bg-surface-container-low p-8 border-t-4 border-secondary-container/60 space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <Bell size={20} />
          <h2 className="font-headline text-2xl">Notifications</h2>
        </div>
        <div className="space-y-3 text-sm text-zinc-300">
          <label className="flex items-center justify-between"><span>Meteorological Shifts</span><input type="checkbox" defaultChecked /></label>
          <label className="flex items-center justify-between"><span>Seasonal Re-cataloging</span><input type="checkbox" defaultChecked /></label>
          <label className="flex items-center justify-between"><span>Proximity Protocols</span><input type="checkbox" /></label>
        </div>
      </div>
    </section>

    <section className="bg-surface-container-high p-8 border-l-4 border-primary space-y-4">
      <div className="flex items-center gap-3 text-primary">
        <Crown size={22} />
        <h2 className="font-headline text-3xl italic">Membership Status</h2>
      </div>
      <p className="text-zinc-400">Current Tier: Master Conservator · Renewal Date: December 14, 2024</p>
      <div className="flex flex-wrap gap-4">
        <button className="px-6 py-3 border border-outline-variant/40 font-label uppercase tracking-widest text-[10px]">Manage Subscription</button>
        <button className="px-6 py-3 bg-primary text-on-primary font-label uppercase tracking-widest text-[10px] font-bold">Upgrade Now</button>
      </div>
    </section>

    <section className="border border-secondary-container/30 bg-secondary-container/10 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-secondary mt-0.5" size={18} />
        <p className="text-sm text-zinc-300">Danger zone actions are permanent and cannot be undone.</p>
      </div>
      <button
        type="button"
        onClick={() => onNavigate('GALLERY', 'push_back')}
        className="text-primary border border-primary/30 px-6 py-2 font-label text-[10px] uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
      >
        Return to Gallery
      </button>
    </section>

    <div className="flex justify-center border-t border-outline-variant/20 pt-10">
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-2 border border-zinc-600/50 px-8 py-3 font-label text-[10px] uppercase tracking-widest text-zinc-400 transition-colors hover:border-red-900/60 hover:bg-red-950/30 hover:text-red-300"
      >
        <LogOut size={16} aria-hidden />
        Log out
      </button>
    </div>
  </div>
);

export default CuratorSettings;
