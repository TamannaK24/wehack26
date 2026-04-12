import { motion } from 'motion/react';
import type { NavigateFn } from '../types/navigation';
import InteractiveRiskSimulator from '../components/InteractiveRiskSimulator';

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
