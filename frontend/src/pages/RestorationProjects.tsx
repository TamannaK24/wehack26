import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle, Zap, Droplets, Flame, Shield,
  Wind, Home, Layers, Clock, Activity,
} from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

// ── Types ──────────────────────────────────────────────────────────────────────
type RiskCategory = {
  id: string;
  label: string;
  score: number;
  Icon: LucideIcon;
  detail: string;
  action: string;
};

// ── Color scale ────────────────────────────────────────────────────────────────
function riskColor(score: number): string {
  if (score >= 80) return '#dc2626';
  if (score >= 65) return '#f87171';
  if (score >= 50) return '#fb923c';
  if (score >= 35) return '#fbbf24';
  return '#4ade80';
}

function riskLabel(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 50) return 'Elevated';
  if (score >= 35) return 'Moderate';
  return 'Low';
}

// ── SVG gauge math ─────────────────────────────────────────────────────────────
// Angles measured clockwise from 12 o'clock (North)
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcD(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, startDeg + sweepDeg);
  const large = sweepDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

// Gauge: 225° start (bottom-left) → 270° sweep → 135° end (bottom-right), gap at bottom
const CX = 150, CY = 145, R = 105, G_START = 225, G_SWEEP = 270;
const TRACK = arcD(CX, CY, R, G_START, G_SWEEP);

// ── Dummy data — swap for backend response ─────────────────────────────────────
const REPORT = {
  composite: 67,
  propertyId: 'NGC-0047-B',
  lastAssessed: 'Apr 10, 2026',
  categories: [
    {
      id: 'electrical', label: 'Electrical Systems', score: 84, Icon: Zap,
      detail: 'Aluminum wiring · panel aged 31 yrs',
      action: 'Upgrade to copper wiring and install arc-fault circuit interrupters (AFCIs). Est. $4,200 — reduces fire risk by 34% and is required for policy continuation past next renewal.',
    },
    {
      id: 'roof', label: 'Roof Integrity', score: 78, Icon: Home,
      detail: 'Shingle degradation · 22-year-old roof',
      action: 'Schedule full inspection. Replace damaged shingles and assess decking integrity. Est. $3,800. Delays will result in coverage exclusion at next policy cycle.',
    },
    {
      id: 'weather', label: 'Weather & Wind', score: 71, Icon: Wind,
      detail: 'Wind Zone II · moderate hail frequency',
      action: 'Install Class 4 impact-resistant roofing and storm shutters on all openings. Qualifies for a 12% premium discount upon certified installation.',
    },
    {
      id: 'liability', label: 'Liability Exposure', score: 60, Icon: AlertTriangle,
      detail: 'Unenclosed pool · visitor hazard',
      action: 'Install 4ft compliant pool fencing with self-latching gate. Required per underwriter guidelines — non-compliance triggers policy exclusion at next audit.',
    },
    {
      id: 'fire', label: 'Fire Risk', score: 55, Icon: Flame,
      detail: 'Wood-frame construction · 4.2mi to station',
      action: 'Install monitored smoke detectors on every floor. A residential sprinkler system reduces premium by up to 15% and satisfies municipal code.',
    },
    {
      id: 'foundation', label: 'Foundation & Structure', score: 49, Icon: Layers,
      detail: 'Crawlspace moisture · minor subsidence',
      action: 'Install vapor barrier and re-grade perimeter drainage. Est. $1,500. Left unaddressed, moisture ingress compounds structural risk annually.',
    },
    {
      id: 'flood', label: 'Water & Flood', score: 42, Icon: Droplets,
      detail: 'FEMA Zone AE · 1% annual flood probability',
      action: 'Install sump pump with battery backup and supplement with NFIP flood policy ($600–900/yr). Flood damage is excluded from standard homeowner coverage.',
    },
    {
      id: 'security', label: 'Theft & Security', score: 38, Icon: Shield,
      detail: 'No monitored alarm · single-lock entry',
      action: 'Install monitored alarm with motion sensors and Grade 3 deadbolts. Verified installation unlocks up to 8% premium discount.',
    },
  ] as RiskCategory[],
};

// ── Animated score gauge ───────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v)}`);
  const color = riskColor(score);

  useEffect(() => {
    const ctrl = animate(count, score, { duration: 2.4, ease: 'easeOut', delay: 0.5 });
    return ctrl.stop;
  }, [score]);

  const endAngle = G_START + G_SWEEP * (score / 100);
  const ep = polar(CX, CY, R, endAngle);

  return (
    <div className="relative w-full max-w-[300px] mx-auto select-none">
      <svg viewBox="0 0 300 240" className="w-full">
        {/* Faint radial grid rings */}
        {[78, 92, 105, 118].map((r) => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#1c0808" strokeWidth="1" />
        ))}

        {/* Track shadow */}
        <path d={TRACK} fill="none" stroke="#160606" strokeWidth="18" strokeLinecap="round" />

        {/* Tick marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const deg = G_START + (G_SWEEP * i) / 10;
          const filled = i / 10 <= score / 100;
          const inner = polar(CX, CY, R - 22, deg);
          const outer = polar(CX, CY, R - 13, deg);
          return (
            <line
              key={i}
              x1={inner.x.toFixed(2)} y1={inner.y.toFixed(2)}
              x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)}
              stroke={filled ? color : '#2a0d0d'}
              strokeWidth={i % 5 === 0 ? 2.5 : 1}
              strokeOpacity={filled ? 0.85 : 0.3}
            />
          );
        })}

        {/* Glow layer (blurred) */}
        <motion.path
          d={TRACK}
          fill="none"
          stroke={color}
          strokeWidth="22"
          strokeLinecap="round"
          strokeOpacity={0.1}
          style={{ filter: 'blur(6px)' }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 2.4, ease: 'easeOut', delay: 0.5 }}
        />

        {/* Main progress arc */}
        <motion.path
          d={TRACK}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 2.4, ease: 'easeOut', delay: 0.5 }}
        />

        {/* Leading dot at arc tip */}
        <motion.circle
          cx={ep.x.toFixed(2)}
          cy={ep.y.toFixed(2)}
          r="6"
          fill={color}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1], scale: [0, 1.3, 1] }}
          transition={{ delay: 2.7, duration: 0.4, times: [0, 0.4, 1] }}
        />

        {/* Scale labels: 0, 50, 100 */}
        {[
          { label: '0', deg: G_START },
          { label: '50', deg: G_START + G_SWEEP / 2 },
          { label: '100', deg: G_START + G_SWEEP },
        ].map(({ label, deg }) => {
          const p = polar(CX, CY, R + 22, deg);
          return (
            <text
              key={label}
              x={p.x.toFixed(2)} y={p.y.toFixed(2)}
              textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,0.2)"
              style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Score overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: '18px' }}>
        <motion.span
          className="font-headline leading-none"
          style={{ fontSize: '82px', color, textShadow: `0 0 40px ${color}50` }}
        >
          {rounded}
        </motion.span>
        <span className="font-label text-[9px] uppercase tracking-[0.5em] text-white/25 mt-1">/ 100</span>
        <div className="flex items-center gap-2 mt-3">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: color }}
            animate={{ scale: [1, 1.7, 1], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="font-label text-[10px] uppercase tracking-[0.35em]" style={{ color }}>
            {riskLabel(score)} Risk
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Category card ──────────────────────────────────────────────────────────────
function CategoryCard({ cat, index }: { cat: RiskCategory; index: number }) {
  const color = riskColor(cat.score);
  const isCritical = cat.score >= 65;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.7 + index * 0.065, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-surface-container-low border border-outline-variant/15 p-5 overflow-hidden"
    >
      {/* Scan sweep on critical items */}
      {isCritical && (
        <motion.div
          className="absolute inset-y-0 w-20 pointer-events-none"
          style={{ background: `linear-gradient(to right, transparent, ${color}14, transparent)` }}
          animate={{ x: ['-80px', '120%'] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', delay: index * 0.35 }}
        />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0 border"
            style={{ background: `${color}10`, borderColor: `${color}28` }}
          >
            <cat.Icon size={13} style={{ color }} />
          </div>
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-white/60 leading-tight">{cat.label}</p>
            <p className="font-body text-[11px] text-white/25 leading-tight mt-0.5">{cat.detail}</p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 ml-2">
          <span className="font-headline text-2xl leading-none" style={{ color }}>{cat.score}</span>
          <span className="font-label text-[8px] uppercase tracking-widest mt-0.5" style={{ color, opacity: 0.65 }}>
            {riskLabel(cat.score)}
          </span>
        </div>
      </div>

      {/* Animated bar */}
      <div className="h-[3px] bg-surface-container-highest rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(to right, ${color}70, ${color})` }}
          initial={{ width: '0%' }}
          animate={{ width: `${cat.score}%` }}
          transition={{ duration: 1.2, delay: 0.9 + index * 0.065, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>

      {/* Pulsing indicator dot for critical */}
      {isCritical && (
        <motion.div
          className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 1.3, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// ── Priority intervention card ─────────────────────────────────────────────────
function InterventionCard({ cat, rank }: { cat: RiskCategory; rank: number }) {
  const color = riskColor(cat.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1.5 + rank * 0.13, ease: [0.22, 1, 0.36, 1] }}
      className="relative p-6 bg-surface-container-low border border-outline-variant/15 overflow-hidden"
    >
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[3px]"
        style={{ background: `linear-gradient(to bottom, ${color}, ${color}40)` }}
      />

      {/* Subtle background radiance */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 50%, ${color}07, transparent 55%)` }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: rank * 0.6 }}
      />

      <div className="flex items-start gap-5 pl-3">
        <span className="font-headline text-4xl leading-none shrink-0" style={{ color, opacity: 0.35 }}>
          {String(rank + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <cat.Icon size={12} style={{ color }} />
            <span className="font-label text-[10px] uppercase tracking-widest" style={{ color }}>{cat.label}</span>
            <div className="flex-1 h-px" style={{ background: `${color}25` }} />
            <span className="font-headline text-xl leading-none shrink-0" style={{ color }}>{cat.score}</span>
          </div>
          <p className="font-body text-white/45 text-sm leading-relaxed">{cat.action}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
const RestorationProjects = ({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) => {
  const sorted = [...REPORT.categories].sort((a, b) => b.score - a.score);
  const topPriorities = sorted.slice(0, 3);
  const compositeColor = riskColor(REPORT.composite);
  const criticalCount = sorted.filter((c) => c.score >= 65).length;
  const elevatedCount = sorted.filter((c) => c.score >= 50 && c.score < 65).length;

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 border-l-2 border-primary/40 pl-8"
      >
        <p className="font-label text-[10px] text-primary uppercase tracking-[0.35em] mb-4">
          Risk Intelligence · Property {REPORT.propertyId}
        </p>
        <h1 className="text-5xl md:text-7xl font-headline uppercase tracking-[0.02em] text-white leading-[0.95] mb-4">
          Risk Score <span className="text-primary">Breakdown</span>
        </h1>
        <p className="font-body text-white/50 text-lg max-w-xl leading-relaxed">
          Composite exposure analysis across 8 risk vectors. Each factor is weighted by historical claims data and underwriter benchmarks.
        </p>
      </motion.section>

      {/* ── Hero: Gauge + stats + top risks ─────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-16">

        {/* Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-2 flex flex-col items-center justify-between bg-surface-container-low border border-outline-variant/15 p-8 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${compositeColor}08 0%, transparent 65%)` }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          />
          <p className="font-label text-[9px] uppercase tracking-[0.5em] text-white/30 mb-2 relative">
            Composite Risk Score
          </p>
          <ScoreGauge score={REPORT.composite} />
          <div className="flex items-center gap-3 w-full mt-2 relative">
            <div className="h-px flex-1 bg-outline-variant/15" />
            <span className="font-label text-[9px] uppercase tracking-widest text-white/25 flex items-center gap-1.5">
              <Clock size={9} /> {REPORT.lastAssessed}
            </span>
            <div className="h-px flex-1 bg-outline-variant/15" />
          </div>
        </motion.div>

        {/* Stats + top risks */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Stat trio */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Risk Tier', value: riskLabel(REPORT.composite).toUpperCase(), sub: 'Overall', c: compositeColor },
              { label: 'Critical Vectors', value: criticalCount, sub: 'Score ≥ 65', c: '#dc2626' },
              { label: 'Elevated Vectors', value: elevatedCount, sub: 'Score 50–64', c: '#fb923c' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.35 + i * 0.08 }}
                className="bg-surface-container-low border border-outline-variant/15 p-4 relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: stat.c, opacity: 0.55 }} />
                <p className="font-label text-[9px] uppercase tracking-widest text-white/30 mb-2">{stat.label}</p>
                <p className="font-headline text-3xl leading-none mb-1" style={{ color: stat.c }}>{stat.value}</p>
                <p className="font-label text-[8px] uppercase tracking-widest text-white/20">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Top 3 risk bars */}
          <div className="space-y-2 flex-1">
            {topPriorities.map((cat, i) => {
              const c = riskColor(cat.score);
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.55 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-4 px-5 py-4 bg-surface-container-low border border-outline-variant/15 relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: c }} />
                  <cat.Icon size={13} style={{ color: c }} className="shrink-0 ml-1" />
                  <span className="font-label text-[10px] uppercase tracking-widest text-white/55 flex-1 truncate">
                    {cat.label}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-28 h-[3px] bg-surface-container-highest rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: c }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.score}%` }}
                        transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                      />
                    </div>
                    <span className="font-headline text-xl w-8 text-right leading-none" style={{ color: c }}>
                      {cat.score}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── All risk vectors ─────────────────────────────────────────────────── */}
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-4 mb-6"
        >
          <h2 className="font-headline text-3xl uppercase tracking-[0.04em] text-white">All Risk Vectors</h2>
          <div className="flex-1 h-px bg-outline-variant/20" />
          <span className="font-label text-[9px] uppercase tracking-widest text-white/30">
            8 factors · weighted composite
          </span>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sorted.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      </section>

      {/* ── Priority interventions ───────────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <AlertTriangle size={15} className="text-primary shrink-0" />
          <h2 className="font-headline text-3xl uppercase tracking-[0.04em] text-white">Priority Interventions</h2>
          <div className="flex-1 h-px bg-outline-variant/20" />
          <span className="font-label text-[9px] uppercase tracking-widest text-white/30">
            Immediate action required
          </span>
        </motion.div>
        <div className="space-y-3">
          {topPriorities.map((cat, i) => (
            <InterventionCard key={cat.id} cat={cat} rank={i} />
          ))}
        </div>
      </section>

      {/* ── Data source notice ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="mt-16 px-4 py-3 border border-outline-variant/10 bg-surface-container-lowest flex items-center gap-3"
      >
        <Activity size={11} className="text-white/20 shrink-0" />
        <span className="font-label text-[9px] uppercase tracking-widest text-white/20">
          Simulated assessment data · Property {REPORT.propertyId} · Backend integration pending
        </span>
      </motion.div>
    </div>
  );
};

export default RestorationProjects;
