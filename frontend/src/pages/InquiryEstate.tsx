import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { NavigateFn } from '../types/navigation';
import InteractiveRiskSimulator from '../components/InteractiveRiskSimulator';

// Property type risk profiles — used for the mini bar charts
type PropertyProfile = {
  title: string;
  era: string;
  age: string;
  material: string;
  electrical: string;
  foundation: string;
  active?: boolean;
  alert?: string;
  bars: { label: string; value: number }[];
};

const PROFILES: PropertyProfile[] = [
  {
    title: 'Neoclassical',
    era: 'Pre-1900',
    age: '120+ years',
    material: 'Stone / Brick',
    electrical: 'Knob & tube era',
    foundation: 'Lime mortar, stable',
    bars: [
      { label: 'Structural', value: 74 },
      { label: 'Electrical', value: 68 },
      { label: 'Fire', value: 62 },
      { label: 'Maintenance', value: 71 },
    ],
  },
  {
    title: 'Gothic Revival',
    era: 'Active Target',
    age: '90–130 years',
    material: 'Cut stone / Slate',
    electrical: 'Mixed era wiring',
    foundation: 'Subsidence detected',
    active: true,
    alert: 'Stone degradation and foundational subsidence detected. Intervention recommended.',
    bars: [
      { label: 'Structural', value: 84 },
      { label: 'Electrical', value: 76 },
      { label: 'Fire', value: 71 },
      { label: 'Maintenance', value: 79 },
    ],
  },
  {
    title: 'Modernist',
    era: 'Post-1960',
    age: '30–60 years',
    material: 'Concrete / Glass',
    electrical: 'Updated systems',
    foundation: 'Reinforced slab',
    bars: [
      { label: 'Structural', value: 38 },
      { label: 'Electrical', value: 32 },
      { label: 'Systems', value: 55 },
      { label: 'Maintenance', value: 41 },
    ],
  },
];

function barColor(v: number) {
  if (v >= 70) return '#dc2626';
  if (v >= 55) return '#f87171';
  if (v >= 40) return '#fb923c';
  if (v >= 25) return '#fbbf24';
  return '#4ade80';
}

// Scoring methodology factors shown in the bottom section
const FACTORS = [
  { label: 'Roof Integrity', weight: '18%', desc: 'Age, material, and visible degradation of roof systems' },
  { label: 'Electrical Systems', weight: '16%', desc: 'Panel age, wiring type, update history' },
  { label: 'Water & Flood', weight: '15%', desc: 'FEMA flood zone classification and drainage assessment' },
  { label: 'Fire Risk', weight: '14%', desc: 'Construction materials, distance to fire station' },
  { label: 'Theft & Security', weight: '12%', desc: 'Alarm systems, access control, neighborhood index' },
  { label: 'Liability Exposure', weight: '10%', desc: 'Pool, outbuildings, visitor frequency, claims history' },
  { label: 'Weather & Wind', weight: '9%', desc: 'Wind zone classification, hail frequency, storm history' },
  { label: 'Foundation & Structure', weight: '6%', desc: 'Moisture intrusion, settling, crawlspace condition' },
];

const TIERS = [
  { range: '0–34', label: 'Low', color: '#4ade80', desc: 'Minimal exposure — standard coverage applies' },
  { range: '35–54', label: 'Moderate', color: '#fbbf24', desc: 'Some factors require attention before renewal' },
  { range: '55–74', label: 'Elevated', color: '#fb923c', desc: 'Active risks — underwriter review triggered' },
  { range: '75–89', label: 'High', color: '#f87171', desc: 'Multiple critical factors — intervention required' },
  { range: '90–100', label: 'Critical', color: '#dc2626', desc: 'Coverage may be restricted or non-renewable' },
];

const InquiryEstate = ({ onNavigate }: { onNavigate: NavigateFn }) => (
  <div className="max-w-7xl mx-auto">

    {/* Header */}
    <section className="mb-16 border-l-2 border-primary/40 pl-8">
      <p className="font-label text-[10px] text-primary uppercase tracking-[0.35em] mb-4">
        Target Assessment · Phase I
      </p>
      <h1 className="text-6xl md:text-8xl font-headline uppercase tracking-[0.02em] text-white leading-[0.95] mb-4">
        Risk <span className="text-primary">Appraisal</span>
      </h1>
      <p className="font-body text-white/55 text-lg max-w-xl leading-relaxed">
        Select a property class to load its risk profile, then use the simulator below to model your own exposure in real time.
      </p>
    </section>

    {/* Property Cards — no images, data-rich */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
      {PROFILES.map((p, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`relative p-6 border transition-all duration-500 ${
            p.active
              ? 'bg-surface-container-high border-primary/30'
              : 'bg-surface-container-low border-outline-variant/15 hover:border-primary/20'
          }`}
        >
          {/* Era badge + title */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-headline text-3xl uppercase tracking-wide text-white leading-tight">{p.title}</h3>
              <span className={`font-label text-[9px] uppercase tracking-widest ${p.active ? 'text-primary' : 'text-white/35'}`}>
                {p.era}
              </span>
            </div>
            {p.active && (
              <span className="font-label text-[8px] uppercase tracking-widest bg-primary/15 border border-primary/30 text-primary px-2 py-1">
                Selected
              </span>
            )}
          </div>

          {/* Property metadata grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5 pb-5 border-b border-outline-variant/15">
            {[
              { k: 'Age', v: p.age },
              { k: 'Material', v: p.material },
              { k: 'Electrical', v: p.electrical },
              { k: 'Foundation', v: p.foundation },
            ].map(({ k, v }) => (
              <div key={k}>
                <p className="font-label text-[8px] uppercase tracking-widest text-white/30 mb-0.5">{k}</p>
                <p className="font-body text-xs text-white/65 leading-tight">{v}</p>
              </div>
            ))}
          </div>

          {/* Mini risk bar chart */}
          <div className="space-y-2.5 mb-5">
            <p className="font-label text-[8px] uppercase tracking-widest text-white/30 mb-3">Risk Profile</p>
            {p.bars.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="font-label text-[9px] uppercase tracking-wide text-white/40 w-24 shrink-0">{label}</span>
                <div className="flex-1 h-[3px] bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: barColor(value) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                </div>
                <span className="font-headline text-sm w-6 text-right leading-none" style={{ color: barColor(value) }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Alert block for active card */}
          {p.alert && (
            <div className="mb-5 p-3 bg-primary/5 border-l-2 border-primary/50">
              <div className="flex items-center gap-2 text-primary mb-1">
                <AlertCircle size={11} />
                <span className="font-label text-[9px] uppercase tracking-widest">Appraisal Flag</span>
              </div>
              <p className="font-body text-[11px] text-white/55">{p.alert}</p>
            </div>
          )}

          <button
            onClick={() => p.active && onNavigate('RESTORATION', 'push')}
            className={`w-full py-3 font-label text-[10px] tracking-widest uppercase transition-all duration-300 ${
              p.active
                ? 'bg-primary text-on-primary hover:brightness-110'
                : 'border border-outline-variant/25 text-white/35 hover:border-primary/30 hover:text-primary/70'
            }`}
          >
            {p.active ? 'View Risk Score' : 'Select Target'}
          </button>
        </motion.div>
      ))}
    </div>

    {/* Interactive Risk Simulator */}
    <section className="mb-20">
      <div className="mb-8">
        <p className="font-label text-[10px] text-primary uppercase tracking-[0.35em] mb-2">Live Scoring Engine</p>
        <h2 className="text-4xl font-headline uppercase tracking-[0.04em] text-white mb-2">Risk Simulator</h2>
        <p className="font-label text-[10px] uppercase tracking-widest text-white/35">
          Tune your property parameters — the engine scores your exposure and tells you exactly what to fix
        </p>
      </div>
      <InteractiveRiskSimulator />
    </section>

    {/* Scoring Methodology */}
    <section>
      <div className="flex items-center gap-4 mb-8">
        <h2 className="font-headline text-3xl uppercase tracking-[0.04em] text-white">Scoring Methodology</h2>
        <div className="flex-1 h-px bg-outline-variant/20" />
        <span className="font-label text-[9px] uppercase tracking-widest text-white/30">8 weighted factors</span>
      </div>

      {/* Factor weights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {FACTORS.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className="p-4 bg-surface-container-low border border-outline-variant/15"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-label text-[10px] uppercase tracking-widest text-white/60 leading-tight">{f.label}</p>
              <span className="font-headline text-lg leading-none text-primary ml-2 shrink-0">{f.weight}</span>
            </div>
            <p className="font-body text-[11px] text-white/30 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Score tier legend */}
      <div className="border border-outline-variant/15 bg-surface-container-low p-6">
        <p className="font-label text-[10px] uppercase tracking-[0.4em] text-white/30 mb-5">Risk Tier Reference</p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {TIERS.map((t) => (
            <div key={t.label} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                <span className="font-headline text-lg leading-none" style={{ color: t.color }}>{t.label}</span>
                <span className="font-label text-[9px] text-white/30 ml-auto">{t.range}</span>
              </div>
              <p className="font-body text-[11px] text-white/35 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default InquiryEstate;
