import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ShieldCheck, ToggleLeft, ToggleRight, TrendingDown } from 'lucide-react';

type RiskSubscores = {
  roofWeatherScore: number;
  waterPlumbingScore: number;
  fireElectricalScore: number;
  securityScore: number;
  structuralScore: number;
  claimsHistoryScore: number;
};

type RiskResponse = {
  masterScore: number;
  riskTier: string;
  weights: Record<keyof RiskSubscores, number>;
  subscores: RiskSubscores;
  details?: Record<string, Array<{ reason: string; value: number }>>;
  generatedAt?: string;
};

type WhatIfKey = keyof RiskSubscores;

const CATEGORY_CONFIG: Record<WhatIfKey, { label: string; summary: string }> = {
  roofWeatherScore: {
    label: 'Roof & Weather',
    summary: 'Roofing repairs, impact resistance, and weather hardening.',
  },
  waterPlumbingScore: {
    label: 'Water & Plumbing',
    summary: 'Leak repairs, water shutoff controls, and moisture remediation.',
  },
  fireElectricalScore: {
    label: 'Fire & Electrical',
    summary: 'Wiring fixes, smoke detection, and fire-prevention upgrades.',
  },
  securityScore: {
    label: 'Security & Theft',
    summary: 'Alarms, cameras, reinforced access points, and theft deterrence.',
  },
  structuralScore: {
    label: 'Structural & Foundation',
    summary: 'Movement, cracking, drainage, and slab-moisture corrections.',
  },
  claimsHistoryScore: {
    label: 'Claims History',
    summary: 'The underwriting drag created by repeated and recent claims.',
  },
};

function scoreColor(score: number) {
  if (score >= 85) return 'text-red-400';
  if (score >= 70) return 'text-orange-400';
  if (score >= 50) return 'text-amber-300';
  if (score >= 30) return 'text-yellow-400';
  return 'text-green-400';
}

function barColor(score: number) {
  if (score >= 85) return 'bg-red-500';
  if (score >= 70) return 'bg-orange-400';
  if (score >= 50) return 'bg-amber-300';
  if (score >= 30) return 'bg-yellow-400';
  return 'bg-green-400';
}

function riskTier(score: number) {
  if (score <= 29) return 'Low Risk';
  if (score <= 49) return 'Moderate Risk';
  if (score <= 69) return 'Elevated Risk';
  if (score <= 84) return 'High Risk';
  return 'Critical Risk';
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 font-label text-[11px] uppercase tracking-wide text-zinc-400">{label}</span>
      <div className="h-2 flex-1 overflow-hidden bg-zinc-800">
        <motion.div
          className={`h-full ${barColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 80 }}
        />
      </div>
      <span className={`w-8 text-right font-headline text-sm ${scoreColor(score)}`}>{score}</span>
    </div>
  );
}

export default function RiskWhatIfSimulator() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mitigated, setMitigated] = useState<Record<WhatIfKey, boolean>>({
    roofWeatherScore: false,
    waterPlumbingScore: false,
    fireElectricalScore: false,
    securityScore: false,
    structuralScore: false,
    claimsHistoryScore: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadRisk() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/risk`, { signal: controller.signal });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to load risk simulator data');
        }

        setRisk(payload);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unable to load risk simulator data');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRisk();
    return () => controller.abort();
  }, [apiBaseUrl]);

  const projectedSubscores = useMemo(() => {
    if (!risk) return null;
    return Object.fromEntries(
      Object.entries(risk.subscores).map(([key, value]) => [key, mitigated[key as WhatIfKey] ? 0 : value]),
    ) as RiskSubscores;
  }, [risk, mitigated]);

  const projectedScore = useMemo(() => {
    if (!risk || !projectedSubscores) return null;
    return Math.round(
      (Object.entries(projectedSubscores) as Array<[WhatIfKey, number]>).reduce(
        (total, [key, value]) => total + value * risk.weights[key],
        0,
      ),
    );
  }, [risk, projectedSubscores]);

  const sortedCategories = useMemo(() => {
    if (!risk) return [];
    return (Object.entries(risk.subscores) as Array<[WhatIfKey, number]>)
      .map(([key, value]) => ({
        key,
        currentScore: value,
        projectedScore: mitigated[key] ? 0 : value,
        estimatedReduction: Math.round(value * risk.weights[key]),
        drivers: (risk.details?.[key] || []).filter((item) => item.value > 0).slice(0, 2),
      }))
      .sort((a, b) => b.currentScore - a.currentScore);
  }, [risk, mitigated]);

  const totalReduction = risk && projectedScore !== null ? risk.masterScore - projectedScore : 0;

  return (
    <div className="border border-outline-variant/20 bg-surface-container-low shadow-2xl shadow-black/60">
      <div className="border-b border-outline-variant/20 px-6 py-5">
        <p className="mb-2 font-label text-[10px] uppercase tracking-[0.3em] text-zinc-500">What-If Risk Simulator</p>
        <h3 className="font-headline text-3xl uppercase tracking-[0.04em] text-white">Mitigation Projection</h3>
        <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-white/45">
          Toggle each risk category as if it were fully mitigated. The simulator recalculates the projected master score
          from your current `risk.json` values.
        </p>
      </div>

      <div className="grid grid-cols-1 border-b border-outline-variant/15 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-2 border-b border-outline-variant/15 p-6 md:border-b-0 md:border-r">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-zinc-500">Current Score</p>
          <div className={`font-headline text-7xl leading-none ${scoreColor(risk?.masterScore ?? 0)}`}>
            {loading ? '--' : risk?.masterScore ?? '--'}
          </div>
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">
            {loading ? 'Loading...' : risk?.riskTier ?? 'No score'}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 p-6">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-zinc-500">Projected Score</p>
          <div className={`font-headline text-7xl leading-none ${scoreColor(projectedScore ?? 0)}`}>
            {loading ? '--' : projectedScore ?? '--'}
          </div>
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">
            {loading ? 'Calculating...' : projectedScore !== null ? riskTier(projectedScore) : 'No projection'}
          </p>
          {!loading && projectedScore !== null && (
            <p className="font-label text-[9px] uppercase tracking-widest text-emerald-400">
              {totalReduction > 0 ? `Improvement ${totalReduction} pts` : 'No change yet'}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center border-b border-outline-variant/15 py-2">
        <ArrowDown className="text-zinc-600" size={16} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-6">
          {error && (
            <div className="mb-4 border border-red-700/35 bg-red-950/20 p-4">
              <p className="font-label text-[9px] uppercase tracking-widest text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="border border-outline-variant/20 bg-surface-container-lowest p-5">
                <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">Loading categories...</p>
              </div>
            ) : (
              sortedCategories.map((item) => {
                const config = CATEGORY_CONFIG[item.key];
                const isOn = mitigated[item.key];
                const ToggleIcon = isOn ? ToggleRight : ToggleLeft;

                return (
                  <div key={item.key} className="border border-outline-variant/20 bg-surface-container-lowest p-5">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-headline text-lg uppercase tracking-wide text-white">{config.label}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/35">{config.summary}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMitigated((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`flex items-center gap-2 border px-3 py-2 font-label text-[9px] uppercase tracking-widest transition-colors ${
                          isOn
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                            : 'border-outline-variant/25 bg-background/30 text-white/45 hover:text-white/70'
                        }`}
                      >
                        <ToggleIcon size={16} />
                        {isOn ? 'Mitigated' : 'Active'}
                      </button>
                    </div>

                    <div className="space-y-3">
                      <CategoryBar label="Current" score={item.currentScore} />
                      <CategoryBar label="What-if" score={item.projectedScore} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/10 pt-4">
                      <span className="font-label text-[9px] uppercase tracking-widest text-white/30">
                        Estimated master score change
                      </span>
                      <span className={`font-headline text-sm ${isOn ? 'text-emerald-400' : 'text-white/70'}`}>
                        {isOn ? `-${item.estimatedReduction}` : '0'} pts
                      </span>
                    </div>

                    {item.drivers.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.drivers.map((driver) => (
                          <span
                            key={`${item.key}-${driver.reason}`}
                            className="border border-outline-variant/15 bg-background/40 px-2 py-1 font-label text-[8px] uppercase tracking-widest text-white/35"
                          >
                            {driver.reason.replaceAll('_', ' ')} · +{driver.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <aside className="border-t border-outline-variant/15 p-6 md:border-l md:border-t-0">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck size={14} className="text-primary" />
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary">Scenario Impact</p>
          </div>

          <div className="space-y-4">
            <div className="border border-outline-variant/20 bg-background/30 p-4">
              <p className="font-label text-[9px] uppercase tracking-widest text-white/25">Current vs projected</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-label text-[8px] uppercase tracking-widest text-white/20">Current</p>
                  <p className={`font-headline text-3xl ${scoreColor(risk?.masterScore ?? 0)}`}>{risk?.masterScore ?? '--'}</p>
                </div>
                <TrendingDown size={18} className="text-emerald-400" />
                <div className="text-right">
                  <p className="font-label text-[8px] uppercase tracking-widest text-white/20">Projected</p>
                  <p className={`font-headline text-3xl ${scoreColor(projectedScore ?? 0)}`}>{projectedScore ?? '--'}</p>
                </div>
              </div>
            </div>

            <div className="border border-outline-variant/20 bg-background/30 p-4">
              <p className="font-label text-[9px] uppercase tracking-widest text-white/25">What this means</p>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/45">
                <p>Each toggle treats that category as fully mitigated and recalculates the weighted master score.</p>
                <p>This gives you a best-case view of how much that risk area matters to your overall underwriting result.</p>
              </div>
            </div>

            <div className="border border-outline-variant/20 bg-background/30 p-4">
              <p className="font-label text-[9px] uppercase tracking-widest text-white/25">Highest-value toggles</p>
              <div className="mt-3 space-y-3">
                {sortedCategories.slice(0, 3).map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-3">
                    <span className="font-label text-[9px] uppercase tracking-widest text-white/40">
                      {CATEGORY_CONFIG[item.key].label}
                    </span>
                    <span className="font-headline text-sm text-emerald-400">-{item.estimatedReduction} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
