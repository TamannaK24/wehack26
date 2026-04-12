import {
  UserCircle,
  Shield,
  Bell,
  Crown,
  ArrowRight,
  AlertTriangle,
  LogOut,
  KeyRound,
  Smartphone,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { NavigateFn } from '../types/navigation';

const NOTIFICATION_PREFS = [
  { id: 'critical', label: 'Critical risk alerts', sub: 'Immediate notification on severity ≥75', defaultChecked: true },
  { id: 'elevated', label: 'Elevated signal events', sub: 'Threshold breaches and access anomalies', defaultChecked: true },
  { id: 'weekly', label: 'Weekly risk digest', sub: 'Aggregated summary every Monday 09:00', defaultChecked: true },
  { id: 'renewal', label: 'Policy renewal reminders', sub: '60-day, 30-day, and 7-day advance notices', defaultChecked: false },
];

const CuratorSettings = ({
  onNavigate,
  onLogout,
}: {
  onNavigate: NavigateFn;
  onLogout: () => void;
}) => (
  <div className="max-w-5xl mx-auto space-y-10">

    {/* ── Header ── */}
    <section className="border-l-2 border-primary/40 pl-8">
      <p className="font-label text-[10px] text-primary uppercase tracking-[0.35em] mb-4">Account · Preferences</p>
      <h1 className="text-6xl md:text-7xl font-headline uppercase tracking-[0.02em] text-white leading-[0.95] mb-3">
        Account <span className="text-primary">Settings</span>
      </h1>
      <p className="font-body text-white/50 max-w-xl">Manage your profile, alert preferences, and access credentials.</p>
    </section>

    {/* ── Profile ── */}
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Avatar card */}
      <div className="bg-surface-container-low border border-outline-variant/25 p-6 flex flex-col items-start gap-5">
        <div className="w-24 h-24 bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
          <UserCircle className="text-primary" size={48} />
        </div>
        <div>
          <p className="font-headline text-xl text-white">Risk Radar</p>
          <p className="font-label text-[9px] uppercase tracking-widest text-primary/60 mt-0.5">Field Operator</p>
        </div>
        <button className="mt-auto w-full border border-outline-variant/30 text-primary/70 py-2.5 font-label uppercase tracking-[0.2em] text-[9px] hover:border-primary/50 hover:text-primary transition-colors">
          Update Photo
        </button>
      </div>

      {/* Form */}
      <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant/25 p-7 space-y-5">
        <p className="font-label text-[9px] uppercase tracking-widest text-white/30 mb-1">Profile Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="space-y-1.5">
            <span className="font-label text-[9px] uppercase tracking-widest text-primary/70">Full Name</span>
            <input
              defaultValue="Risk Radar"
              className="w-full bg-background border border-outline-variant/30 px-4 py-3 text-white/80 font-body text-sm focus:border-primary/50 focus:outline-none transition-colors"
            />
          </label>
          <label className="space-y-1.5">
            <span className="font-label text-[9px] uppercase tracking-widest text-primary/70">Username</span>
            <input
              defaultValue="risk_radar"
              className="w-full bg-background border border-outline-variant/30 px-4 py-3 text-white/80 font-body text-sm focus:border-primary/50 focus:outline-none transition-colors"
            />
          </label>
        </div>
        <label className="space-y-1.5 block">
          <span className="font-label text-[9px] uppercase tracking-widest text-primary/70">Email Address</span>
          <input
            defaultValue="hello@riskradar.app"
            className="w-full bg-background border border-outline-variant/30 px-4 py-3 text-white/80 font-body text-sm focus:border-primary/50 focus:outline-none transition-colors"
          />
        </label>
        <div className="flex justify-end pt-1">
          <button className="px-7 py-2.5 bg-primary text-on-primary font-label uppercase tracking-widest text-[9px] hover:brightness-110 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </motion.section>

    {/* ── Security & Notifications ── */}
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Security */}
      <div className="bg-surface-container-low border border-outline-variant/25 p-7 space-y-5">
        <div className="flex items-center gap-3">
          <Shield size={16} className="text-primary" />
          <h2 className="font-headline text-xl uppercase tracking-[0.04em] text-white">Security</h2>
        </div>
        <div className="space-y-3">
          {[
            { icon: KeyRound, label: 'Password', status: 'Last changed 34 days ago' },
            { icon: Smartphone, label: 'Two-Factor Auth', status: 'Not enabled' },
          ].map(({ icon: Icon, label, status }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-outline-variant/15 last:border-0">
              <div className="flex items-center gap-3">
                <Icon size={13} className="text-white/30" />
                <div>
                  <p className="font-label text-[10px] text-white/70">{label}</p>
                  <p className="font-body text-[10px] text-white/30">{status}</p>
                </div>
              </div>
              <button className="font-label text-[9px] uppercase tracking-widest text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Update <ArrowRight size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface-container-low border border-outline-variant/25 p-7 space-y-5">
        <div className="flex items-center gap-3">
          <Bell size={16} className="text-primary" />
          <h2 className="font-headline text-xl uppercase tracking-[0.04em] text-white">Notifications</h2>
        </div>
        <div className="space-y-3">
          {NOTIFICATION_PREFS.map((pref) => (
            <label key={pref.id} className="flex items-start justify-between gap-4 cursor-pointer group">
              <div>
                <p className="font-label text-[10px] text-white/70 group-hover:text-white/90 transition-colors">{pref.label}</p>
                <p className="font-body text-[10px] text-white/30">{pref.sub}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={pref.defaultChecked}
                className="mt-0.5 shrink-0 accent-primary"
              />
            </label>
          ))}
        </div>
      </div>
    </motion.section>

    {/* ── Membership ── */}
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12 }}
      className="bg-surface-container-low border border-outline-variant/25 border-l-4 border-l-primary p-7"
    >
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Crown size={18} className="text-primary" />
          <div>
            <h2 className="font-headline text-2xl uppercase tracking-[0.04em] text-white">Membership</h2>
            <p className="font-label text-[9px] uppercase tracking-widest text-white/30 mt-0.5">Pro Tier · Active</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-5 py-2.5 border border-outline-variant/35 font-label uppercase tracking-widest text-[9px] text-white/50 hover:border-outline-variant/60 hover:text-white/70 transition-colors">
            Manage Plan
          </button>
          <button className="px-5 py-2.5 bg-primary text-on-primary font-label uppercase tracking-widest text-[9px] hover:brightness-110 transition-all">
            Upgrade
          </button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-4">
        {[
          { label: 'Properties monitored', value: '1 / 3' },
          { label: 'Signal retention', value: '90 days' },
          { label: 'Renewal date', value: 'Dec 14, 2026' },
        ].map((item) => (
          <div key={item.label} className="border-l border-outline-variant/20 pl-4">
            <p className="font-label text-[9px] uppercase tracking-widest text-white/30">{item.label}</p>
            <p className="font-headline text-xl text-white mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.section>

    {/* ── Danger zone ── */}
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.16 }}
      className="border border-red-900/30 bg-red-950/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-400/70 shrink-0 mt-0.5" size={15} />
        <p className="font-body text-sm text-white/40">Destructive account actions cannot be undone. Proceed with caution.</p>
      </div>
      <button
        type="button"
        onClick={() => onNavigate('GALLERY', 'push_back')}
        className="shrink-0 text-primary border border-primary/25 px-5 py-2 font-label text-[9px] uppercase tracking-widest hover:bg-primary/10 transition-colors"
      >
        Back to Floor Plan
      </button>
    </motion.section>

    {/* ── Logout ── */}
    <div className="flex justify-center border-t border-outline-variant/15 pt-8 pb-4">
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-2 border border-zinc-700/40 px-8 py-3 font-label text-[9px] uppercase tracking-widest text-zinc-500 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400 transition-colors"
      >
        <LogOut size={14} aria-hidden />
        Sign Out
      </button>
    </div>
  </div>
);

export default CuratorSettings;
