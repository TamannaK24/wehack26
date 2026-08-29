import {
  AlertCircle,
  AlertTriangle,
  Compass,
  Droplets,
  LockOpen,
  Shield,
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

type Signal = {
  id: string;
  title: string;
  detail: string;
  severity: 'critical' | 'elevated' | 'moderate' | 'low';
  time: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
};

const LIVE_SIGNALS: Signal[] = [
  {
    id: 'SIG-0441',
    title: 'Thermal spike in East Wing kitchen',
    detail: 'Climate suppression telemetry exceeded normal tolerance for 11 minutes. Manual inspection recommended.',
    severity: 'critical',
    time: '14:29',
    category: 'Access',
    trend: 'up',
  },
  {
    id: 'SIG-0440',
    title: 'Water ingress watchlist expanded',
    detail: 'Hydric accumulation in the western corridor is tracking 22% above baseline after the latest weather cycle.',
    severity: 'elevated',
    time: '13:57',
    category: 'Water',
    trend: 'up',
  },
  {
    id: 'SIG-0438',
    title: 'Foundation variance remains within watch threshold',
    detail: 'North-sector movement is still nominal, but repeat measurement is scheduled for the next review window.',
    severity: 'moderate',
    time: '09:03',
    category: 'Structural',
    trend: 'down',
  },
];

const SIGNAL_SUMMARY = {
  total: 142,
  critical: 4,
  elevated: 17,
  resolved: 121,
};

const CATEGORY_SUMMARY = [
  { label: 'Access', active: 2, resolved: 38, icon: LockOpen, color: '#f87171' },
  { label: 'Water', active: 3, resolved: 24, icon: Droplets, color: '#60a5fa' },
  { label: 'Structural', active: 4, resolved: 18, icon: Shield, color: '#fb923c' },
  { label: 'Environmental', active: 5, resolved: 41, icon: Activity, color: '#a78bfa' },
];

function severityTone(severity: 'critical' | 'elevated' | 'moderate' | 'low') {
  if (severity === 'critical') {
    return {
      border: 'border-red-700/40',
      bg: 'bg-red-950/25',
      text: 'text-red-400',
    };
  }
  if (severity === 'elevated') {
    return {
      border: 'border-orange-700/40',
      bg: 'bg-orange-950/15',
      text: 'text-orange-300',
    };
  }
  if (severity === 'moderate') {
    return {
      border: 'border-amber-700/35',
      bg: 'bg-amber-950/10',
      text: 'text-amber-300',
    };
  }
  return {
    border: 'border-green-800/30',
    bg: 'bg-green-950/10',
    text: 'text-green-300',
  };
}

function TrendIcon({ trend }: { trend: Signal['trend'] }) {
  if (trend === 'up') return <TrendingUp size={12} className="text-red-400" />;
  if (trend === 'down') return <TrendingDown size={12} className="text-green-400" />;
  return <Minus size={12} className="text-white/30" />;
}

const DeepLedger = ({ onNavigate }: { onNavigate: NavigateFn }) => {
  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative mb-14 border-l-2 border-red-800/40 pl-8">
        <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-red-400/90">Signal log · Encrypted</p>
        <h1 className="mb-6 font-headline text-6xl uppercase tracking-tighter text-on-background md:text-8xl">
          Deep <span className="text-red-400">ledger</span>
        </h1>
        <p className="max-w-2xl text-lg italic leading-relaxed text-zinc-400 md:text-xl">
          A quieter view of the active signal field. This page stays focused on current alerts, while the new top-level timeline tab handles the report-based event history.
        </p>
      </section>

      <section className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total signals', value: SIGNAL_SUMMARY.total, color: 'text-white' },
          { label: 'Critical active', value: SIGNAL_SUMMARY.critical, color: 'text-red-400' },
          { label: 'Elevated active', value: SIGNAL_SUMMARY.elevated, color: 'text-primary' },
          { label: 'Resolved (30d)', value: SIGNAL_SUMMARY.resolved, color: 'text-green-400' },
        ].map((card) => (
          <div key={card.label} className="border border-outline-variant/20 bg-surface-container-low p-5">
            <p className={`mb-1 font-headline text-4xl leading-none ${card.color}`}>{card.value}</p>
            <p className="font-label text-[9px] uppercase tracking-widest text-white/35">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {LIVE_SIGNALS.map((signal) => {
              const tone = severityTone(signal.severity);
              return (
                <article key={signal.id} className={`border p-5 ${tone.border} ${tone.bg}`}>
                  <div className="mb-3 flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${signal.severity === 'critical' ? 'bg-red-500' : signal.severity === 'elevated' ? 'bg-orange-400' : signal.severity === 'moderate' ? 'bg-amber-300' : 'bg-green-400'}`} />
                      <TrendIcon trend={signal.trend} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className={`font-label text-[9px] uppercase tracking-widest ${tone.text}`}>{signal.severity}</span>
                        <span className="font-label text-[9px] uppercase tracking-widest text-white/25">·</span>
                        <span className="font-label text-[9px] uppercase tracking-widest text-white/35">{signal.category}</span>
                        <span className="ml-auto font-label text-[9px] uppercase tracking-widest text-white/25">{signal.time}</span>
                      </div>
                      <h3 className="mb-2 font-headline text-2xl uppercase tracking-wide text-white">{signal.title}</h3>
                      <p className="text-sm leading-relaxed text-zinc-400">{signal.detail}</p>
                    </div>
                    <span className="hidden shrink-0 font-label text-[9px] text-white/20 sm:block">{signal.id}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="border border-outline-variant/20 bg-surface-container-high p-8">
            <div className="mb-6 flex items-center gap-3">
              <Compass className="text-primary" size={24} />
              <h3 className="font-headline text-2xl uppercase tracking-wide text-white">
                Structural Integrity
              </h3>
            </div>
            <ul className="space-y-6">
              <li className="flex items-start space-x-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary-container" />
                <div>
                  <p className="font-label text-xs uppercase text-zinc-500">Foundation Stress</p>
                  <p className="text-sm italic text-zinc-300">Nominal variance detected in the North Vault.</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                <div>
                  <p className="font-label text-xs uppercase text-zinc-500">Load Bearing</p>
                  <p className="text-sm italic text-zinc-300">Optimal across all primary pedestals.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="border border-secondary-container/20 bg-secondary-container/10 p-8">
            <div className="mb-6 flex items-center gap-3">
              <AlertCircle className="text-secondary" size={18} />
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary">Critical Concerns</p>
            </div>
            <div className="space-y-4">
              {[
                { icon: AlertTriangle, title: 'Light Exposure', desc: "Ultraviolet seepage in the 'Vignette Room' exceeds safety thresholds by 4%." },
                { icon: LockOpen, title: 'Access Breach', desc: 'Unauthorized key-turn recorded at 03:42 in the Archive Sub-Level.' },
                { icon: Droplets, title: 'Hydric Siphon', desc: 'Condensation buildup behind the tapestry wall remains elevated.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="text-secondary" size={16} />
                      <h4 className="font-headline text-lg uppercase tracking-wide text-on-surface">{item.title}</h4>
                    </div>
                    <p className="text-sm italic leading-relaxed text-zinc-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => onNavigate('TIMELINE', 'push')}
              className="mt-8 w-full border border-primary/30 py-3 font-label text-[10px] uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/5"
            >
              Open Timeline
            </button>
          </div>

          <div className="border border-outline-variant/20 bg-surface-container-low p-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-label text-[9px] uppercase tracking-widest text-white/30">By Category</p>
              <Shield size={14} className="text-primary/70" />
            </div>
            <div className="space-y-4">
              {CATEGORY_SUMMARY.map((item) => {
                const total = item.active + item.resolved;
                const width = Math.round((item.active / total) * 100);
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={12} style={{ color: item.color }} />
                        <span className="font-label text-[10px] uppercase tracking-widest text-white/50">{item.label}</span>
                      </div>
                      <span className="font-label text-[9px] text-white/30">{item.active} active</span>
                    </div>
                    <div className="h-1 bg-surface-container-highest">
                      <div className="h-full" style={{ width: `${width}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default DeepLedger;
