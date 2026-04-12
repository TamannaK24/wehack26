import { motion } from 'motion/react';
import { Shield, AlertCircle, AlertTriangle, LockOpen, Droplets, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

// ── Dummy data — swap with real API payloads ──────────────────────────────────
const SIGNAL_SUMMARY = {
  total: 142,
  critical: 4,
  elevated: 17,
  resolved: 121,
  lastUpdated: '2026-04-11 · 14:32 UTC',
};

const RECENT_SIGNALS = [
  { id: 'SIG-0441', ts: '14:29', severity: 'critical', category: 'Access', title: 'Unauthorized entry attempt', detail: 'Key-turn recorded at Archive Sub-Level 3 at 03:42. No physical entry confirmed — digital ghost pattern suspected.', trend: 'up' },
  { id: 'SIG-0440', ts: '13:57', severity: 'elevated', category: 'Water', title: 'Condensation buildup', detail: 'Hydric accumulation behind the west-facing wall exceeds baseline by 22%. Fungal activation risk elevated.', trend: 'up' },
  { id: 'SIG-0439', ts: '12:14', severity: 'elevated', category: 'Environmental', title: 'UV threshold breach', detail: "Ultraviolet seepage in the 'Vignette Room' exceeds safety threshold by 4%. Shutter inspection recommended.", trend: 'stable' },
  { id: 'SIG-0438', ts: '09:03', severity: 'moderate', category: 'Structural', title: 'Foundation variance', detail: 'Nominal variance detected in the North sector. Within acceptable bounds — flagged for monitoring.', trend: 'down' },
  { id: 'SIG-0437', ts: '08:41', severity: 'moderate', category: 'Environmental', title: 'Humidity spike', detail: 'Relative humidity in Wing B reached 68% during overnight hours. Dehumidifier schedule adjusted.', trend: 'down' },
  { id: 'SIG-0436', ts: '06:22', severity: 'low', category: 'Access', title: 'Scheduled maintenance window', detail: 'Alarm system temporarily suspended for quarterly testing. All checkpoints nominal.', trend: 'stable' },
];

const CATEGORY_STATS = [
  { label: 'Access Control', active: 2, resolved: 38, icon: LockOpen, color: '#f87171' },
  { label: 'Water & Hydric', active: 3, resolved: 24, icon: Droplets, color: '#60a5fa' },
  { label: 'Environmental', active: 5, resolved: 41, icon: Activity, color: '#a78bfa' },
  { label: 'Structural', active: 7, resolved: 18, icon: Shield, color: '#fb923c' },
];

const SEVERITY_CONFIG = {
  critical: { color: '#dc2626', bg: 'bg-red-950/50', border: 'border-red-600/40', label: 'Critical' },
  elevated: { color: '#f87171', bg: 'bg-red-950/30', border: 'border-red-700/30', label: 'Elevated' },
  moderate: { color: '#fbbf24', bg: 'bg-amber-950/30', border: 'border-amber-700/30', label: 'Moderate' },
  low: { color: '#4ade80', bg: 'bg-green-950/20', border: 'border-green-800/25', label: 'Low' },
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp size={12} className="text-red-400" />;
  if (trend === 'down') return <TrendingDown size={12} className="text-green-400" />;
  return <Minus size={12} className="text-white/30" />;
};

// ─────────────────────────────────────────────────────────────────────────────

const DeepLedger = ({ onNavigate }: { onNavigate: NavigateFn }) => (
  <div className="max-w-7xl mx-auto">

    {/* ── Header ────────────────────────────────────────────────────────── */}
    <section className="mb-12 border-l-2 border-primary/40 pl-8">
      <p className="font-label text-[10px] text-primary uppercase tracking-[0.35em] mb-4">
        Signal Log · Encrypted · Live Feed
      </p>
      <h1 className="text-6xl md:text-8xl font-headline uppercase tracking-[0.02em] text-white leading-[0.95] mb-4">
        Signal <span className="text-primary">Ledger</span>
      </h1>
      <p className="font-body text-white/55 text-lg max-w-xl leading-relaxed">
        A real-time index of detected risk events, environmental anomalies, and access alerts — ranked by severity and impact.
      </p>
    </section>

    {/* ── Summary stat bar ──────────────────────────────────────────────── */}
    <motion.section
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {[
        { label: 'Total signals', value: SIGNAL_SUMMARY.total, color: 'text-white' },
        { label: 'Critical active', value: SIGNAL_SUMMARY.critical, color: 'text-red-400' },
        { label: 'Elevated active', value: SIGNAL_SUMMARY.elevated, color: 'text-primary' },
        { label: 'Resolved (30d)', value: SIGNAL_SUMMARY.resolved, color: 'text-green-400' },
      ].map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 * i }}
          className="bg-surface-container-low border border-outline-variant/20 p-5"
        >
          <p className={`font-headline text-4xl leading-none mb-1 ${s.color}`}>{s.value}</p>
          <p className="font-label text-[9px] uppercase tracking-widest text-white/35">{s.label}</p>
        </motion.div>
      ))}
    </motion.section>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

      {/* ── Signal feed ──────────────────────────────────────────────────── */}
      <section className="lg:col-span-2">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-headline text-2xl uppercase tracking-[0.04em] text-white">Recent Signals</h2>
          <div className="flex-1 h-px bg-outline-variant/20" />
          <span className="font-label text-[9px] uppercase tracking-widest text-white/30">{SIGNAL_SUMMARY.lastUpdated}</span>
        </div>

        <div className="space-y-2">
          {RECENT_SIGNALS.map((sig, i) => {
            const cfg = SEVERITY_CONFIG[sig.severity as keyof typeof SEVERITY_CONFIG];
            return (
              <motion.div
                key={sig.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * i }}
                className={`${cfg.bg} border ${cfg.border} p-4 group hover:border-primary/30 transition-colors`}
              >
                <div className="flex items-start gap-4">
                  {/* Severity indicator */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}66` }} />
                    <TrendIcon trend={sig.trend} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-label text-[9px] uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
                      <span className="font-label text-[9px] uppercase tracking-widest text-white/25">·</span>
                      <span className="font-label text-[9px] uppercase tracking-widest text-white/30">{sig.category}</span>
                      <span className="font-label text-[9px] uppercase tracking-widest text-white/25 ml-auto">{sig.ts}</span>
                    </div>
                    <p className="font-label text-[11px] text-white/80 mb-1">{sig.title}</p>
                    <p className="font-body text-[11px] text-white/35 leading-relaxed">{sig.detail}</p>
                  </div>

                  {/* Signal ID */}
                  <span className="font-label text-[9px] text-white/20 shrink-0 hidden sm:block">{sig.id}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Right sidebar ────────────────────────────────────────────────── */}
      <aside className="space-y-6">

        {/* Category breakdown */}
        <div className="bg-surface-container-low border border-outline-variant/20 p-5">
          <p className="font-label text-[9px] uppercase tracking-widest text-white/30 mb-5">By Category</p>
          <div className="space-y-4">
            {CATEGORY_STATS.map((cat, i) => {
              const total = cat.active + cat.resolved;
              const pct = Math.round((cat.active / total) * 100);
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 * i }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon size={12} style={{ color: cat.color }} />
                      <span className="font-label text-[10px] uppercase tracking-widest text-white/50">{cat.label}</span>
                    </div>
                    <span className="font-label text-[9px] text-white/30">{cat.active} active</span>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-none overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ background: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.1 * i, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Critical alerts */}
        <div className="bg-red-950/20 border border-red-700/25 p-5">
          <div className="flex items-center gap-3 mb-5">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="font-label text-[9px] uppercase tracking-widest text-red-400">Critical Alerts</p>
          </div>
          <div className="space-y-4">
            {[
              { icon: AlertTriangle, label: 'Light Exposure', sub: 'UV exceeds threshold by 4%' },
              { icon: LockOpen, label: 'Access Breach', sub: 'Digital ghost at Sub-Level 3' },
              { icon: Droplets, label: 'Hydric Siphon', sub: 'Condensation at risk level' },
              { icon: Activity, label: 'Sensor Dropout', sub: '2 sensors offline >1h' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon size={13} className="text-red-400/70 shrink-0 mt-0.5" />
                <div>
                  <p className="font-label text-[10px] text-white/70">{label}</p>
                  <p className="font-body text-[10px] text-white/30">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate('INQUIRY', 'slide_up')}
            className="mt-5 w-full font-label text-[9px] uppercase tracking-widest text-primary border border-primary/30 py-2.5 hover:bg-primary/5 transition-colors"
          >
            Run Risk Assessment
          </button>
        </div>

        {/* Signal health minimap */}
        <div className="bg-surface-container-low border border-outline-variant/20 p-5">
          <p className="font-label text-[9px] uppercase tracking-widest text-white/30 mb-4">24-Hour Activity</p>
          <svg viewBox="0 0 200 60" className="w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sig-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,55 L10,52 L20,48 L30,50 L40,42 L50,38 L60,35 L70,40 L80,28 L90,22 L100,30 L110,18 L120,12 L130,20 L140,15 L150,22 L160,18 L170,25 L180,20 L190,15 L200,10" fill="none" stroke="#f87171" strokeWidth="1.5" />
            <path d="M0,55 L10,52 L20,48 L30,50 L40,42 L50,38 L60,35 L70,40 L80,28 L90,22 L100,30 L110,18 L120,12 L130,20 L140,15 L150,22 L160,18 L170,25 L180,20 L190,15 L200,10 L200,60 L0,60 Z" fill="url(#sig-fill)" />
            <circle cx="200" cy="10" r="2.5" fill="#f87171" />
          </svg>
          <div className="flex justify-between mt-1">
            <span className="font-label text-[8px] text-white/20">00:00</span>
            <span className="font-label text-[8px] text-white/20">Now</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
);

export default DeepLedger;
