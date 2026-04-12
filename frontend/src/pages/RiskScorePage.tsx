import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Droplets, Flame, Hammer, House, ScrollText, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type RiskSubscores = {
  roofWeatherScore: number;
  waterPlumbingScore: number;
  fireElectricalScore: number;
  securityScore: number;
  structuralScore: number;
  claimsHistoryScore: number;
};

type RiskDetail = {
  reason: string;
  value: number;
};

type RiskResponse = {
  masterScore: number;
  riskTier: string;
  subscores: RiskSubscores;
  details?: Record<string, RiskDetail[]>;
  generatedAt?: string;
};

type ScoreCard = {
  key: keyof RiskSubscores;
  label: string;
  icon: LucideIcon;
  score: number;
  tips: string[];
  drivers: RiskDetail[];
};

const CATEGORY_META: Record<
  keyof RiskSubscores,
  {
    label: string;
    icon: LucideIcon;
    tips: string[];
  }
> = {
  roofWeatherScore: {
    label: 'Roof & Weather',
    icon: House,
    tips: [
      'Repair roof damage first, especially shingles, flashing, and impact points.',
      'Document roof work with invoices and updated condition photos.',
    ],
  },
  waterPlumbingScore: {
    label: 'Water & Plumbing',
    icon: Droplets,
    tips: [
      'Fix recurring leak sources before cosmetic repairs.',
      'Add leak detection and shutoff controls where possible.',
    ],
  },
  fireElectricalScore: {
    label: 'Fire & Electrical',
    icon: Flame,
    tips: [
      'Address outdated wiring and missing smoke protection immediately.',
      'Keep proof of panel, detector, and alarm upgrades for underwriting.',
    ],
  },
  securityScore: {
    label: 'Security & Theft',
    icon: Shield,
    tips: [
      'Strengthen entry points, locks, alarms, and camera coverage.',
      'Visible monitored protection can help both risk and discounts.',
    ],
  },
  structuralScore: {
    label: 'Structural & Foundation',
    icon: Hammer,
    tips: [
      'Investigate cracks, moisture, and drainage before they compound.',
      'Use engineering or contractor reports to prove completed mitigation.',
    ],
  },
  claimsHistoryScore: {
    label: 'Claims History',
    icon: ScrollText,
    tips: [
      'Break repeat-loss patterns by fixing root causes, not just symptoms.',
      'Keep a clean remediation timeline for your next policy review.',
    ],
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

export default function RiskScorePage() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRisk() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/risk`, {
          signal: controller.signal,
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to load live risk score');
        }

        setRisk(payload);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unable to load live risk score');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadRisk();
    return () => controller.abort();
  }, [apiBaseUrl]);

  const scoreCards = useMemo(() => {
    if (!risk) return [] as ScoreCard[];

    return (Object.entries(risk.subscores) as Array<[keyof RiskSubscores, number]>)
      .map(([key, score]) => ({
        key,
        label: CATEGORY_META[key].label,
        icon: CATEGORY_META[key].icon,
        score,
        tips: CATEGORY_META[key].tips,
        drivers: (risk.details?.[key] || []).filter((item) => item.value > 0).slice(0, 2),
      }))
      .sort((a, b) => b.score - a.score);
  }, [risk]);

  return (
    <div className="mx-auto max-w-7xl">
      <section className="mb-14 border-l-2 border-primary/40 pl-8">
        <p className="mb-4 font-label text-[10px] uppercase tracking-[0.35em] text-primary">Live Underwriting Score</p>
        <h1 className="mb-5 font-headline text-6xl uppercase tracking-[0.02em] text-white md:text-8xl">
          Risk <span className="text-primary">Score</span>
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-white/55">
          This page reads the live scoring output from final.json to risk.json and shows the current insurance risk score,
          the category breakdown, and the highest-value next steps.
        </p>
      </section>

      {error && (
        <div className="mb-8 border border-red-700/35 bg-red-950/20 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="font-label text-[10px] uppercase tracking-widest text-red-400">{error}</p>
          </div>
        </div>
      )}

      <section className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="border border-outline-variant/20 bg-surface-container-low p-8">
          <p className="font-label text-[10px] uppercase tracking-[0.35em] text-zinc-500">Master Score</p>
          <div className={`mt-4 font-headline text-8xl leading-none ${scoreColor(risk?.masterScore ?? 0)}`}>
            {loading ? '--' : risk?.masterScore ?? '--'}
          </div>
          <p className="mt-3 font-headline text-2xl text-white">{loading ? '--' : risk?.riskTier ?? '--'}</p>
          <p className="mt-5 font-label text-[9px] uppercase tracking-widest text-zinc-500">
            {risk?.generatedAt ? `Updated ${new Date(risk.generatedAt).toLocaleString()}` : loading ? 'Loading…' : 'No timestamp'}
          </p>
        </div>

        <div className="border border-outline-variant/20 bg-surface-container-low p-8">
          <p className="mb-5 font-label text-[10px] uppercase tracking-[0.35em] text-zinc-500">Subscore Breakdown</p>
          {loading ? (
            <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">Loading breakdown...</p>
          ) : (
            <div className="space-y-5">
              {scoreCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.key}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-primary" />
                        <span className="font-label text-[10px] uppercase tracking-widest text-white/70">{card.label}</span>
                      </div>
                      <span className={`font-headline text-xl ${scoreColor(card.score)}`}>{card.score}</span>
                    </div>
                    <div className="h-2 overflow-hidden bg-zinc-800">
                      <div className={`h-full ${barColor(card.score)}`} style={{ width: `${card.score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5">
        {loading ? (
          <div className="border border-outline-variant/20 bg-surface-container-low p-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">Loading recommendations...</p>
          </div>
        ) : (
          scoreCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.key} className="border border-outline-variant/20 bg-surface-container-low">
                <div className="border-b border-outline-variant/10 px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center border border-outline-variant/20 bg-black/10">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-headline text-2xl text-white">{card.label}</p>
                        <p className="font-label text-[9px] uppercase tracking-widest text-zinc-500">What to do next</p>
                      </div>
                    </div>
                    <span className={`font-headline text-3xl ${scoreColor(card.score)}`}>{card.score}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-px bg-outline-variant/10 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="bg-surface-container-low p-6">
                    <div className="space-y-3">
                      {card.tips.map((tip) => (
                        <p key={tip} className="text-sm leading-relaxed text-zinc-300">{tip}</p>
                      ))}
                    </div>
                  </div>
                  <div className="bg-background/30 p-6">
                    <p className="mb-3 font-label text-[9px] uppercase tracking-widest text-white/35">Top Drivers</p>
                    {card.drivers.length > 0 ? (
                      <div className="space-y-3">
                        {card.drivers.map((driver) => (
                          <div key={`${card.key}-${driver.reason}`} className="border border-outline-variant/15 bg-surface-container-lowest px-3 py-2">
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-label text-[9px] uppercase tracking-wider text-white/55">
                                {driver.reason.replaceAll('_', ' ')}
                              </p>
                              <span className="font-headline text-sm text-red-400">+{driver.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">No active drivers were recorded for this subscore.</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
