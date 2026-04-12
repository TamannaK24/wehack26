import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowDown, TrendingDown } from 'lucide-react';

// --- Types ---

type RoofAge = '0_5' | '6_10' | '11_15' | '16_20' | '20plus';
type ElectricalPanel = 'modern' | 'older' | 'outdated';
type FemaZone = 'zone_x' | 'zone_c' | 'zone_a' | 'zone_v';
type Claims = 'none' | '1_2' | '3_4' | '5plus';
type SecuritySystem = 'none' | 'basic' | 'monitored' | 'smart';
type CrawlspaceMoisture = 'none' | 'minor' | 'active';

interface SimulatorInputs {
  roofAge: RoofAge;
  electricalPanel: ElectricalPanel;
  femaZone: FemaZone;
  claims: Claims;
  securitySystem: SecuritySystem;
  crawlspaceMoisture: CrawlspaceMoisture;
}

interface CategoryScores {
  fireRisk: number;
  roofCondition: number;
  naturalDisaster: number;
  theftSecurity: number;
  maintenance: number;
  structural: number;
  waterPlumbing: number;
  liability: number;
}

type BackendRiskSubscores = {
  roofWeatherScore: number;
  waterPlumbingScore: number;
  fireElectricalScore: number;
  securityScore: number;
  structuralScore: number;
  claimsHistoryScore: number;
};

type BackendRiskDetails = {
  reason: string;
  value: number;
};

type BackendRiskResponse = {
  masterScore: number;
  riskTier: string;
  subscores: BackendRiskSubscores;
  details?: Record<string, BackendRiskDetails[]>;
  generatedAt?: string;
};

// --- Scoring Engine ---

function calculateScores(inputs: SimulatorInputs): CategoryScores {
  const { roofAge, electricalPanel, femaZone, claims, securitySystem, crawlspaceMoisture } = inputs;

  // Fire risk: driven by electrical panel + roof age
  const fireElectrical: Record<ElectricalPanel, number> = { modern: 15, older: 40, outdated: 70 };
  const fireRoof: Record<RoofAge, number> = { '0_5': 2, '6_10': 5, '11_15': 8, '16_20': 12, '20plus': 18 };
  const fireRisk = fireElectrical[electricalPanel] + fireRoof[roofAge];

  // Roof condition: purely roof age
  const roofScores: Record<RoofAge, number> = { '0_5': 8, '6_10': 20, '11_15': 35, '16_20': 50, '20plus': 75 };
  const roofCondition = roofScores[roofAge];

  // Natural disaster: FEMA zone + moisture
  const ndFema: Record<FemaZone, number> = { zone_x: 10, zone_c: 35, zone_a: 60, zone_v: 85 };
  const ndMoisture: Record<CrawlspaceMoisture, number> = { none: 6, minor: 10, active: 18 };
  const naturalDisaster = ndFema[femaZone] + ndMoisture[crawlspaceMoisture];

  // Theft / security: security system + FEMA proximity factor
  const tsSecurity: Record<SecuritySystem, number> = { none: 68, basic: 42, monitored: 18, smart: 8 };
  const tsFema: Record<FemaZone, number> = { zone_x: 2, zone_c: 3, zone_a: 5, zone_v: 6 };
  const theftSecurity = tsSecurity[securitySystem] + tsFema[femaZone];

  // Maintenance: roof age + crawlspace moisture
  const maintRoof: Record<RoofAge, number> = { '0_5': 5, '6_10': 12, '11_15': 18, '16_20': 15, '20plus': 25 };
  const maintMoisture: Record<CrawlspaceMoisture, number> = { none: 6, minor: 25, active: 50 };
  const maintenance = maintRoof[roofAge] + maintMoisture[crawlspaceMoisture];

  // Structural: roof age + moisture
  const structRoof: Record<RoofAge, number> = { '0_5': 5, '6_10': 10, '11_15': 18, '16_20': 22, '20plus': 35 };
  const structMoisture: Record<CrawlspaceMoisture, number> = { none: 7, minor: 20, active: 42 };
  const structural = structRoof[roofAge] + structMoisture[crawlspaceMoisture];

  // Water / plumbing: FEMA zone + moisture + roof age
  const wpFema: Record<FemaZone, number> = { zone_x: 8, zone_c: 30, zone_a: 55, zone_v: 72 };
  const wpMoisture: Record<CrawlspaceMoisture, number> = { none: 5, minor: 20, active: 45 };
  const wpRoof: Record<RoofAge, number> = { '0_5': 2, '6_10': 4, '11_15': 6, '16_20': 6, '20plus': 10 };
  const waterPlumbing = wpFema[femaZone] + wpMoisture[crawlspaceMoisture] + wpRoof[roofAge];

  // Liability: claims history + FEMA zone
  const liabClaims: Record<Claims, number> = { none: 8, '1_2': 22, '3_4': 38, '5plus': 68 };
  const liabFema: Record<FemaZone, number> = { zone_x: 2, zone_c: 5, zone_a: 10, zone_v: 15 };
  const liability = liabClaims[claims] + liabFema[femaZone];

  return {
    fireRisk: Math.min(99, fireRisk),
    roofCondition: Math.min(99, roofCondition),
    naturalDisaster: Math.min(99, naturalDisaster),
    theftSecurity: Math.min(99, theftSecurity),
    maintenance: Math.min(99, maintenance),
    structural: Math.min(99, structural),
    waterPlumbing: Math.min(99, waterPlumbing),
    liability: Math.min(99, liability),
  };
}

function getCompositeScore(scores: CategoryScores): number {
  const values = Object.values(scores);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

// ── Improvement engine ────────────────────────────────────────────────────────
type Improvement = {
  action: string;
  why: string;
  delta: number;       // estimated composite score reduction
  impact: 'high' | 'medium' | 'low';
};

function getImprovements(inputs: SimulatorInputs): Improvement[] {
  const items: Improvement[] = [];

  // Electrical panel
  if (inputs.electricalPanel === 'outdated') {
    items.push({
      action: 'Upgrade to a modern 200A electrical panel',
      why: 'Outdated 60A / fuse panels are the #1 driver of residential fire claims.',
      delta: 18,
      impact: 'high',
    });
  } else if (inputs.electricalPanel === 'older') {
    items.push({
      action: 'Upgrade the 100A panel to a modern 200A breaker box',
      why: 'Older panels lack arc-fault protection and cannot handle modern load demands.',
      delta: 9,
      impact: 'medium',
    });
  }

  // Security system
  if (inputs.securitySystem === 'none') {
    items.push({
      action: 'Install a professionally monitored alarm with motion sensors',
      why: 'Unmonitored properties are 3× more likely to sustain theft losses — this is the fastest win.',
      delta: 17,
      impact: 'high',
    });
  } else if (inputs.securitySystem === 'basic') {
    items.push({
      action: 'Upgrade from a basic alarm to a monitored system with cameras',
      why: 'Monitoring reduces response time to under 4 min and qualifies for most insurer discounts.',
      delta: 8,
      impact: 'medium',
    });
  }

  // Roof age
  if (inputs.roofAge === '20plus') {
    items.push({
      action: 'Replace the roof — prioritise Class 4 impact-resistant shingles',
      why: 'A 20+ year roof contributes to fire, water, and structural risk simultaneously.',
      delta: 16,
      impact: 'high',
    });
  } else if (inputs.roofAge === '16_20') {
    items.push({
      action: 'Schedule a full roof inspection and replace worn shingles',
      why: 'Catching degradation now avoids exponential damage from the next weather event.',
      delta: 8,
      impact: 'medium',
    });
  }

  // Crawlspace moisture
  if (inputs.crawlspaceMoisture === 'active') {
    items.push({
      action: 'Remediate active moisture — install a vapor barrier and fix drainage',
      why: 'Active moisture drives structural, maintenance, and plumbing risk across three categories at once.',
      delta: 14,
      impact: 'high',
    });
  } else if (inputs.crawlspaceMoisture === 'minor') {
    items.push({
      action: 'Install a vapor barrier before minor moisture becomes active mold',
      why: 'A $400 vapor barrier now prevents a $12,000+ remediation claim later.',
      delta: 6,
      impact: 'medium',
    });
  }

  // FEMA flood zone — can mitigate but not relocate
  if (inputs.femaZone === 'zone_v') {
    items.push({
      action: 'Install a sump pump, flood barriers, and add an NFIP flood policy',
      why: 'Zone V carries severe coastal surge risk that standard homeowner policies explicitly exclude.',
      delta: 10,
      impact: 'high',
    });
  } else if (inputs.femaZone === 'zone_a') {
    items.push({
      action: 'Install a sump pump with battery backup and supplement with NFIP coverage',
      why: 'Zone AE has a 26% chance of flooding over a 30-year mortgage — flood exclusions are common.',
      delta: 7,
      impact: 'medium',
    });
  }

  // Claims history
  if (inputs.claims === '5plus') {
    items.push({
      action: 'Implement a documented preventive maintenance programme',
      why: '5+ claims flags you as a high-frequency claimant — underwriters price this aggressively.',
      delta: 9,
      impact: 'medium',
    });
  } else if (inputs.claims === '3_4') {
    items.push({
      action: 'Address the root causes of prior claims to break the pattern',
      why: '3–4 claims in 5 years places you in the upper 12% of risk profiles in our database.',
      delta: 5,
      impact: 'low',
    });
  }

  return items.sort((a, b) => b.delta - a.delta).slice(0, 3);
}

function getRiskLevel(score: number): { label: string; color: string } {
  if (score < 35) return { label: 'Low risk', color: 'text-green-400' };
  if (score < 55) return { label: 'Moderate risk', color: 'text-yellow-400' };
  if (score < 75) return { label: 'High risk', color: 'text-orange-400' };
  return { label: 'Critical risk', color: 'text-red-400' };
}

function getBarColor(score: number): string {
  if (score >= 50) return 'bg-red-500';
  if (score >= 35) return 'bg-orange-400';
  if (score >= 25) return 'bg-yellow-400';
  return 'bg-green-400';
}

function getScoreTextColor(score: number): string {
  if (score >= 50) return 'text-red-400';
  if (score >= 35) return 'text-orange-400';
  if (score >= 25) return 'text-yellow-400';
  return 'text-green-400';
}

// --- Preset Scenarios ---

const SCENARIOS: { label: string; description: string; inputs: SimulatorInputs }[] = [
  {
    label: 'New Construction',
    description: 'Recently built with modern systems and minimal exposure',
    inputs: { roofAge: '0_5', electricalPanel: 'modern', femaZone: 'zone_x', claims: 'none', securitySystem: 'smart', crawlspaceMoisture: 'none' },
  },
  {
    label: 'Aging Victorian',
    description: 'Older structure with dated wiring and accumulated risk',
    inputs: { roofAge: '20plus', electricalPanel: 'outdated', femaZone: 'zone_a', claims: '3_4', securitySystem: 'basic', crawlspaceMoisture: 'active' },
  },
  {
    label: 'Coastal Property',
    description: 'Moderate-age home exposed to coastal flood risk',
    inputs: { roofAge: '11_15', electricalPanel: 'modern', femaZone: 'zone_v', claims: '1_2', securitySystem: 'monitored', crawlspaceMoisture: 'minor' },
  },
  {
    label: 'Historic Estate',
    description: 'Older urban property with updated electrical but worn systems',
    inputs: { roofAge: '16_20', electricalPanel: 'modern', femaZone: 'zone_c', claims: '3_4', securitySystem: 'monitored', crawlspaceMoisture: 'none' },
  },
];

// --- Field Configs ---

const ROOF_AGE_OPTIONS: { value: RoofAge; label: string }[] = [
  { value: '0_5', label: '0–5 years (new)' },
  { value: '6_10', label: '6–10 years' },
  { value: '11_15', label: '11–15 years' },
  { value: '16_20', label: '16–20 years (old)' },
  { value: '20plus', label: '20+ years (aging)' },
];

const ELECTRICAL_OPTIONS: { value: ElectricalPanel; label: string }[] = [
  { value: 'modern', label: 'Modern (200A updated)' },
  { value: 'older', label: 'Older (100A panel)' },
  { value: 'outdated', label: 'Outdated (60A / fuses)' },
];

const FEMA_OPTIONS: { value: FemaZone; label: string }[] = [
  { value: 'zone_x', label: 'Zone X (minimal risk)' },
  { value: 'zone_c', label: 'Zone C (moderate)' },
  { value: 'zone_a', label: 'Zone A/AE (high risk)' },
  { value: 'zone_v', label: 'Zone V (coastal / severe)' },
];

const CLAIMS_OPTIONS: { value: Claims; label: string }[] = [
  { value: 'none', label: '0 claims' },
  { value: '1_2', label: '1–2 claims' },
  { value: '3_4', label: '3–4 claims' },
  { value: '5plus', label: '5+ claims' },
];

const SECURITY_OPTIONS: { value: SecuritySystem; label: string }[] = [
  { value: 'none', label: 'No system' },
  { value: 'basic', label: 'Basic alarm' },
  { value: 'monitored', label: 'Monitored + cameras' },
  { value: 'smart', label: 'Smart home integrated' },
];

const MOISTURE_OPTIONS: { value: CrawlspaceMoisture; label: string }[] = [
  { value: 'none', label: 'None — vapor barrier present' },
  { value: 'minor', label: 'Minor moisture detected' },
  { value: 'active', label: 'Active moisture / mold' },
];

// --- Sub-components ---

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label text-[10px] uppercase tracking-widest text-zinc-500">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none bg-surface-container-low border border-outline-variant/30 text-on-surface font-headline text-sm px-4 py-3 pr-10 cursor-pointer hover:border-primary/40 focus:border-primary/60 focus:outline-none transition-colors"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
      </div>
    </div>
  );
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-label text-[11px] uppercase tracking-wide text-zinc-400 w-32 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-zinc-800 overflow-hidden">
        <motion.div
          className={`h-full ${getBarColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 80 }}
        />
      </div>
      <span className={`font-headline text-sm w-6 text-right ${getScoreTextColor(score)}`}>{score}</span>
    </div>
  );
}

// --- Main Component ---

const DEFAULT_INPUTS: SimulatorInputs = {
  roofAge: '16_20',
  electricalPanel: 'modern',
  femaZone: 'zone_c',
  claims: '3_4',
  securitySystem: 'monitored',
  crawlspaceMoisture: 'none',
};

export default function InteractiveRiskSimulator() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const [activeTab, setActiveTab] = useState<'scenario' | 'tune'>('tune');
  const [inputs, setInputs] = useState<SimulatorInputs>(DEFAULT_INPUTS);
  const [activeScenario, setActiveScenario] = useState<number | null>(3); // starts on "Historic Estate"
  const [backendRisk, setBackendRisk] = useState<BackendRiskResponse | null>(null);
  const [riskLoading, setRiskLoading] = useState(true);
  const [riskError, setRiskError] = useState<string | null>(null);

  const scores = useMemo(() => calculateScores(inputs), [inputs]);
  const composite = useMemo(() => getCompositeScore(scores), [scores]);
  const risk = getRiskLevel(composite);
  const improvements = useMemo(() => getImprovements(inputs), [inputs]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRiskBreakdown() {
      setRiskLoading(true);
      setRiskError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/risk`, { signal: controller.signal });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to load risk breakdown');
        }

        setBackendRisk(payload);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setRiskError(error instanceof Error ? error.message : 'Unable to load risk breakdown');
      } finally {
        if (!controller.signal.aborted) {
          setRiskLoading(false);
        }
      }
    }

    loadRiskBreakdown();

    return () => controller.abort();
  }, [apiBaseUrl]);

  function applyScenario(idx: number) {
    setActiveScenario(idx);
    setInputs(SCENARIOS[idx].inputs);
  }

  function handleManualChange<K extends keyof SimulatorInputs>(key: K, value: SimulatorInputs[K]) {
    setActiveScenario(null);
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  const categories: { label: string; key: keyof CategoryScores }[] = [
    { label: 'Fire risk', key: 'fireRisk' },
    { label: 'Roof condition', key: 'roofCondition' },
    { label: 'Natural disaster', key: 'naturalDisaster' },
    { label: 'Theft / security', key: 'theftSecurity' },
    { label: 'Maintenance', key: 'maintenance' },
    { label: 'Structural', key: 'structural' },
    { label: 'Water / plumbing', key: 'waterPlumbing' },
    { label: 'Liability', key: 'liability' },
  ];

  const backendCategories: { label: string; key: keyof BackendRiskSubscores }[] = [
    { label: 'Roof & weather', key: 'roofWeatherScore' },
    { label: 'Water & plumbing', key: 'waterPlumbingScore' },
    { label: 'Fire & electrical', key: 'fireElectricalScore' },
    { label: 'Security & theft', key: 'securityScore' },
    { label: 'Structural & foundation', key: 'structuralScore' },
    { label: 'Claims history', key: 'claimsHistoryScore' },
  ];

  const displayedScore = backendRisk?.masterScore ?? composite;
  const displayedRisk = backendRisk
    ? {
        label: backendRisk.riskTier,
        color:
          backendRisk.masterScore >= 85
            ? 'text-red-400'
            : backendRisk.masterScore >= 70
              ? 'text-orange-400'
              : backendRisk.masterScore >= 50
                ? 'text-amber-300'
                : backendRisk.masterScore >= 30
                  ? 'text-yellow-400'
                  : 'text-green-400',
      }
    : risk;
  const backendHighlights = useMemo(() => {
    if (!backendRisk?.details) {
      return [];
    }

    return Object.entries(backendRisk.details)
      .flatMap(([scoreKey, items]) =>
        (items || []).map((item) => ({
          scoreKey,
          reason: item.reason,
          value: item.value,
        })),
      )
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [backendRisk]);

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="px-6 pt-5 pb-0 border-b border-outline-variant/20">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Interactive Risk Simulator</p>
        <div className="flex gap-0">
          {(['scenario', 'tune'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-label text-xs uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'scenario' ? 'Try a scenario' : 'Tune inputs'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'scenario' ? (
            <motion.div
              key="scenario"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-0"
            >
              {SCENARIOS.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => applyScenario(idx)}
                  className={`text-left p-4 border transition-all duration-300 ${
                    activeScenario === idx
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant/30 bg-surface-container-lowest text-zinc-400 hover:border-primary/40 hover:text-zinc-200'
                  }`}
                >
                  <p className={`font-headline text-sm mb-1 ${activeScenario === idx ? 'text-primary' : 'text-on-surface'}`}>{scenario.label}</p>
                  <p className="font-label text-[10px] uppercase tracking-wide leading-relaxed">{scenario.description}</p>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="tune"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <SelectField
                label="Roof age"
                value={inputs.roofAge}
                options={ROOF_AGE_OPTIONS}
                onChange={(v) => handleManualChange('roofAge', v)}
              />
              <SelectField
                label="Electrical panel"
                value={inputs.electricalPanel}
                options={ELECTRICAL_OPTIONS}
                onChange={(v) => handleManualChange('electricalPanel', v)}
              />
              <SelectField
                label="FEMA flood zone"
                value={inputs.femaZone}
                options={FEMA_OPTIONS}
                onChange={(v) => handleManualChange('femaZone', v)}
              />
              <SelectField
                label="Claims (5 years)"
                value={inputs.claims}
                options={CLAIMS_OPTIONS}
                onChange={(v) => handleManualChange('claims', v)}
              />
              <SelectField
                label="Security system"
                value={inputs.securitySystem}
                options={SECURITY_OPTIONS}
                onChange={(v) => handleManualChange('securitySystem', v)}
              />
              <SelectField
                label="Crawlspace moisture"
                value={inputs.crawlspaceMoisture}
                options={MOISTURE_OPTIONS}
                onChange={(v) => handleManualChange('crawlspaceMoisture', v)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider with arrow */}
      <div className="flex items-center justify-center py-2 border-t border-outline-variant/15">
        <ArrowDown className="text-zinc-600" size={16} />
      </div>

      {/* Results: score + breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-outline-variant/15">
        {/* Composite Score */}
        <div className="p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-outline-variant/15 gap-2">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            {backendRisk ? 'Backend Risk Score' : 'Composite Score'}
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={displayedScore}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="font-headline text-7xl text-on-surface leading-none"
            >
              {displayedScore}
            </motion.div>
          </AnimatePresence>
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">
            {backendRisk ? 'saved underwriting score' : 'composite risk score'}
          </p>
          <motion.p
            key={displayedRisk.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`font-headline text-sm ${displayedRisk.color}`}
          >
            {displayedRisk.label}
          </motion.p>
          {riskLoading && <p className="font-label text-[9px] uppercase tracking-widest text-zinc-500">Loading backend score...</p>}
          {riskError && <p className="font-label text-[9px] uppercase tracking-widest text-red-400">{riskError}</p>}
          {backendRisk?.generatedAt && (
            <p className="font-label text-[9px] uppercase tracking-widest text-zinc-600">
              Updated {new Date(backendRisk.generatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="p-6 flex flex-col gap-3">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">
            {backendRisk ? 'Risk Score Breakdown' : 'Category Breakdown'}
          </p>
          {backendRisk
            ? backendCategories.map(({ label, key }) => (
                <CategoryBar key={key} label={label} score={backendRisk.subscores[key]} />
              ))
            : categories.map(({ label, key }) => <CategoryBar key={key} label={label} score={scores[key]} />)}
        </div>
      </div>

      {/* What to Improve */}
      <AnimatePresence mode="wait">
        {backendRisk ? (
          backendHighlights.length > 0 && (
            <motion.div
              key={backendHighlights.map((item) => item.reason).join()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-outline-variant/20"
            >
              <div className="px-6 py-4 flex items-center gap-3 border-b border-outline-variant/10">
                <TrendingDown size={14} className="text-primary shrink-0" />
                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">Primary Risk Drivers</p>
                <div className="flex-1 h-px bg-outline-variant/15" />
                <span className="font-label text-[9px] uppercase tracking-widest text-zinc-600">
                  From `risk.json`
                </span>
              </div>

              <div className="divide-y divide-outline-variant/10">
                {backendHighlights.map((item, i) => (
                  <motion.div
                    key={`${item.scoreKey}-${item.reason}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.07 }}
                    className="px-6 py-5 flex items-start gap-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-red-600" />
                    <span className="font-headline text-2xl leading-none shrink-0 ml-1 text-red-500/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-label text-[10px] uppercase tracking-widest text-white/75 leading-relaxed">
                          {item.reason.replaceAll('_', ' ')}
                        </p>
                        <span className="font-headline text-sm shrink-0 text-red-400">
                          +{item.value}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        ) : improvements.length > 0 && (
          <motion.div
            key={improvements.map(i => i.action).join()}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-outline-variant/20"
          >
            <div className="px-6 py-4 flex items-center gap-3 border-b border-outline-variant/10">
              <TrendingDown size={14} className="text-primary shrink-0" />
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">What to Improve</p>
              <div className="flex-1 h-px bg-outline-variant/15" />
              <span className="font-label text-[9px] uppercase tracking-widest text-zinc-600">
                Est. −{improvements.reduce((s, i) => s + i.delta, 0)} pts composite
              </span>
            </div>

            <div className="divide-y divide-outline-variant/10">
              {improvements.map((imp, i) => (
                <motion.div
                  key={imp.action}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.07 }}
                  className="px-6 py-5 flex items-start gap-4 relative overflow-hidden"
                >
                  {/* Impact colour strip */}
                  <div
                    className="absolute inset-y-0 left-0 w-[3px]"
                    style={{
                      background:
                        imp.impact === 'high' ? '#dc2626'
                        : imp.impact === 'medium' ? '#fb923c'
                        : '#fbbf24',
                    }}
                  />

                  {/* Rank */}
                  <span
                    className="font-headline text-2xl leading-none shrink-0 ml-1"
                    style={{
                      color:
                        imp.impact === 'high' ? '#dc2626'
                        : imp.impact === 'medium' ? '#fb923c'
                        : '#fbbf24',
                      opacity: 0.4,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="font-label text-[10px] uppercase tracking-widest text-white/75 leading-relaxed">
                        {imp.action}
                      </p>
                      <span
                        className="font-headline text-sm shrink-0"
                        style={{
                          color:
                            imp.impact === 'high' ? '#dc2626'
                            : imp.impact === 'medium' ? '#fb923c'
                            : '#fbbf24',
                        }}
                      >
                        −{imp.delta}
                      </span>
                    </div>
                    <p className="font-body text-[11px] text-white/35 leading-relaxed">{imp.why}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
