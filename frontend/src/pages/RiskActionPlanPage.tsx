import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Flame,
  Hammer,
  House,
  ScrollText,
  Shield,
  Siren,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

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

type ActionCard = {
  key: keyof RiskSubscores;
  label: string;
  score: number;
  urgency: 'high' | 'medium' | 'low';
  icon: LucideIcon;
  summary: string;
  whyItMatters: string;
  howToFix: string[];
  suggestions: string[];
  stateFarmRecommendations: string[];
  drivers: RiskDetail[];
};

const CATEGORY_CONFIG: Record<
  keyof RiskSubscores,
  {
    label: string;
    icon: LucideIcon;
    summary: string;
    whyItMatters: string;
    howToFix: string[];
    suggestions: string[];
    stateFarmRecommendations: string[];
  }
> = {
  roofWeatherScore: {
    label: 'Roof & Weather',
    icon: House,
    summary: 'Storm and roof condition signals are driving a major share of the current insurance risk.',
    whyItMatters: 'Roof damage can cascade into wind, hail, and interior water losses when remaining roof life is short.',
    howToFix: [
      'Get a roofing contractor to inspect all hail, shingle, and flashing damage.',
      'Replace cracked or missing shingles and address any exposed underlayment immediately.',
      'If replacement is needed, prioritize a Class 4 impact-resistant roof system.',
    ],
    suggestions: [
      'Document all roof repairs with before and after photos plus contractor invoices.',
      'Have the roofer confirm remaining useful life once repairs are complete.',
      'Regenerate the score after roof work so underwriting sees the updated condition.',
    ],
    stateFarmRecommendations: [
      'Ask your State Farm agent about the homeowners roofing discount for qualifying impact-resistant roofing products in Texas.',
      'Ask whether wind mitigation discounts apply based on your final roof construction standard.',
      'Review dwelling coverage after roof replacement so replacement cost reflects the upgraded system.',
    ],
  },
  waterPlumbingScore: {
    label: 'Water & Plumbing',
    icon: Droplets,
    summary: 'Water-loss indicators are elevated from prior leaks, plumbing failures, and moisture evidence.',
    whyItMatters: 'Water claims often repeat if the source is not fully corrected, and unresolved moisture can spread into larger repairs.',
    howToFix: [
      'Have a licensed plumber pressure-test supply lines and inspect for slab or concealed leaks.',
      'Repair the root cause first, then dry and remediate any wet materials.',
      'Install leak detectors near kitchens, water heaters, and high-risk plumbing runs.',
    ],
    suggestions: [
      'Add an automatic shutoff valve if the home has a history of sudden water release.',
      'Consider a sump pump with backup power if groundwater or drainage intrusion is recurring.',
      'Keep remediation receipts and moisture readings for underwriting review.',
    ],
    stateFarmRecommendations: [
      'Talk with your State Farm agent about available sewer or drain backup coverage options.',
      'If the property has basement or drainage exposure, ask what water-related endorsements are available in your state.',
      'Use repaired-system documentation during your policy review to show loss-prevention upgrades.',
    ],
  },
  fireElectricalScore: {
    label: 'Fire & Electrical',
    icon: Flame,
    summary: 'Electrical and fire safety risk is being shaped by wiring findings and smoke or fire-related evidence.',
    whyItMatters: 'Electrical faults and missing safety devices are high-severity triggers because they can escalate into fast, expensive losses.',
    howToFix: [
      'Have a licensed electrician inspect and remediate outdated or unsafe wiring.',
      'Install or replace smoke detectors in all missing or non-working locations.',
      'Keep extinguishers visible and verify monitored alarm coverage is active.',
    ],
    suggestions: [
      'Request a written electrician report after corrective work.',
      'Test smoke and fire devices on a recurring schedule and log the dates.',
      'Add photos of updated panels, wiring, and alarms for the next underwriting review.',
    ],
    stateFarmRecommendations: [
      'Eligible State Farm homeowners policyholders can enroll in Ting for electrical hazard monitoring at no extra cost in most states.',
      'Ask about home alert discounts tied to qualifying fire, smoke, or monitoring devices.',
      'If the home has indoor sprinklers or utility upgrades, ask whether those discounts apply to your policy.',
    ],
  },
  securityScore: {
    label: 'Security & Theft',
    icon: Shield,
    summary: 'Burglary history and weak physical security are increasing theft-related underwriting concern.',
    whyItMatters: 'Prior theft signals plus limited protective devices can keep a home in a higher-loss profile even when other categories improve.',
    howToFix: [
      'Upgrade door hardware and reinforce weak entry points first.',
      'Add a monitored burglar alarm and exterior cameras covering primary access points.',
      'Improve lighting and visible deterrence around doors, garage access, and rear entries.',
    ],
    suggestions: [
      'Keep a device inventory and photo record for high-value items.',
      'Use signage for monitored security systems once installed.',
      'Re-check the score after the monitoring system is active and documented.',
    ],
    stateFarmRecommendations: [
      'Ask your State Farm agent whether your installed burglar alarm or eligible home monitoring system qualifies for a home security discount.',
      'If you also carry auto with State Farm, ask whether a bundle changes your overall pricing.',
      'Bring proof of installed protective devices to your next policy review.',
    ],
  },
  structuralScore: {
    label: 'Structural & Foundation',
    icon: Hammer,
    summary: 'Foundation moisture and structural movement indicators are materially affecting the property risk profile.',
    whyItMatters: 'Structural issues can lead to long-tail claims and underwriting hesitation if movement or moisture remains active.',
    howToFix: [
      'Get a foundation specialist or structural engineer to inspect movement, cracking, and slab moisture.',
      'Correct drainage, grading, and moisture-entry conditions around the foundation.',
      'Complete repairs with a contractor who can provide a clear scope and completion documentation.',
    ],
    suggestions: [
      'Keep engineering findings and repair receipts in one underwriting-ready packet.',
      'Photograph crack progression before and after repair work.',
      'Monitor for recurring moisture after the next weather cycle.',
    ],
    stateFarmRecommendations: [
      'Use the repair packet during your annual State Farm coverage review so the home record reflects the corrected condition.',
      'If moisture is tied to water intrusion, pair the structural fix discussion with any available water-backup coverage review.',
      'Ask your agent whether utility or mitigation updates affect any available discounts in your state.',
    ],
  },
  claimsHistoryScore: {
    label: 'Claims History',
    icon: ScrollText,
    summary: 'The claim pattern itself is a risk signal, especially with recent or repeated losses and higher paid amounts.',
    whyItMatters: 'Even after repairs, repeated or recent claims can keep pricing and underwriting pressure elevated until the loss pattern stabilizes.',
    howToFix: [
      'Target the root causes of past claims instead of treating each event as isolated.',
      'Create a maintenance plan tied to roof, plumbing, and security prevention tasks.',
      'Keep a written record of completed mitigation steps that reduce repeat-loss exposure.',
    ],
    suggestions: [
      'Bundle contractor reports, invoices, and dates into a concise remediation timeline.',
      'Prioritize the categories that caused the most paid or open claims first.',
      'Avoid leaving open reserve-related issues unresolved if repairs are still pending.',
    ],
    stateFarmRecommendations: [
      'Schedule a policy review with your State Farm agent once the major fixes are complete so they can reassess the updated risk profile.',
      'Ask whether deductible or coverage structure changes make sense after the remediation plan is complete.',
      'Use documented mitigation to support a stronger renewal conversation after recent losses.',
    ],
  },
};

function urgencyFromScore(score: number): ActionCard['urgency'] {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function urgencyTone(urgency: ActionCard['urgency']) {
  if (urgency === 'high') {
    return {
      label: 'High urgency',
      text: 'text-red-400',
      border: 'border-red-700/40',
      bg: 'bg-red-950/20',
    };
  }
  if (urgency === 'medium') {
    return {
      label: 'Medium urgency',
      text: 'text-orange-300',
      border: 'border-orange-700/35',
      bg: 'bg-orange-950/15',
    };
  }
  return {
    label: 'Lower urgency',
    text: 'text-green-300',
    border: 'border-green-800/30',
    bg: 'bg-green-950/10',
  };
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-red-400';
  if (score >= 70) return 'text-orange-400';
  if (score >= 50) return 'text-amber-300';
  if (score >= 30) return 'text-yellow-400';
  return 'text-green-400';
}

function buildActionCards(risk: RiskResponse | null): ActionCard[] {
  if (!risk) {
    return [];
  }

  return (Object.entries(risk.subscores) as [keyof RiskSubscores, number][])
    .map(([key, score]) => {
      const config = CATEGORY_CONFIG[key];
      const drivers = (risk.details?.[key] || [])
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

      return {
        key,
        label: config.label,
        score,
        urgency: urgencyFromScore(score),
        icon: config.icon,
        summary: config.summary,
        whyItMatters: config.whyItMatters,
        howToFix: config.howToFix,
        suggestions: config.suggestions,
        stateFarmRecommendations: config.stateFarmRecommendations,
        drivers,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export default function RiskActionPlanPage({ onNavigate }: { onNavigate: NavigateFn }) {
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
        const response = await fetch(`${apiBaseUrl}/risk`, { signal: controller.signal });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to load risk breakdown');
        }

        setRisk(payload);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load risk breakdown');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRisk();
    return () => controller.abort();
  }, [apiBaseUrl]);

  const actionCards = useMemo(() => buildActionCards(risk), [risk]);
  const topThree = actionCards.slice(0, 3);
  const highUrgencyCount = actionCards.filter((card) => card.urgency === 'high').length;

  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative mb-14 border-l-2 border-red-800/40 pl-8">
        <p className="mb-4 font-label text-xs uppercase tracking-[0.3em] text-red-400/90">Risk Fix Plan · From risk.json</p>
        <h1 className="mb-6 font-headline text-6xl uppercase tracking-tighter text-on-background md:text-8xl">
          Action <span className="text-red-400">breakdown</span>
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-zinc-400 md:text-xl">
          This view turns your saved underwriting score into a prioritized fix list: what is driving the risk,
          what to repair first, and which State Farm-oriented options are worth asking about.
        </p>
      </section>

      <section className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border border-outline-variant/20 bg-surface-container-low p-5">
          <p className={`mb-1 font-headline text-4xl leading-none ${scoreColor(risk?.masterScore ?? 0)}`}>
            {loading ? '--' : risk?.masterScore ?? '--'}
          </p>
          <p className="font-label text-[9px] uppercase tracking-widest text-white/35">Master risk score</p>
        </div>
        <div className="border border-outline-variant/20 bg-surface-container-low p-5">
          <p className="mb-1 font-headline text-2xl leading-none text-white">
            {loading ? '--' : risk?.riskTier ?? '--'}
          </p>
          <p className="font-label text-[9px] uppercase tracking-widest text-white/35">Current tier</p>
        </div>
        <div className="border border-outline-variant/20 bg-surface-container-low p-5">
          <p className="mb-1 font-headline text-4xl leading-none text-red-400">
            {loading ? '--' : highUrgencyCount}
          </p>
          <p className="font-label text-[9px] uppercase tracking-widest text-white/35">High urgency items</p>
        </div>
        <div className="border border-outline-variant/20 bg-surface-container-low p-5">
          <p className="mb-1 font-headline text-sm leading-tight text-white/90">
            {risk?.generatedAt ? new Date(risk.generatedAt).toLocaleString() : loading ? '--' : 'Not available'}
          </p>
          <p className="font-label text-[9px] uppercase tracking-widest text-white/35">Last score refresh</p>
        </div>
      </section>

      {error && (
        <section className="mb-10 border border-red-700/35 bg-red-950/20 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="font-label text-[10px] uppercase tracking-widest text-red-400">{error}</p>
          </div>
        </section>
      )}

      <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {loading ? (
            <div className="border border-outline-variant/20 bg-surface-container-low p-8">
              <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">Loading action plan...</p>
            </div>
          ) : (
            actionCards.map((card) => {
              const tone = urgencyTone(card.urgency);
              const Icon = card.icon;

              return (
                <article key={card.key} className={`border ${tone.border} ${tone.bg}`}>
                  <div className="border-b border-outline-variant/10 px-6 py-5">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center border border-outline-variant/20 bg-black/20">
                        <Icon size={20} className={tone.text} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`font-label text-[9px] uppercase tracking-widest ${tone.text}`}>{tone.label}</span>
                          <span className="font-label text-[9px] uppercase tracking-widest text-white/20">·</span>
                          <span className="font-label text-[9px] uppercase tracking-widest text-white/35">{card.label}</span>
                          <span className={`ml-auto font-headline text-2xl ${scoreColor(card.score)}`}>{card.score}</span>
                        </div>
                        <h3 className="mb-2 font-headline text-2xl uppercase tracking-wide text-white">{card.summary}</h3>
                        <p className="text-sm leading-relaxed text-zinc-400">{card.whyItMatters}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-px bg-outline-variant/10 lg:grid-cols-3">
                    <div className="bg-surface-container-low p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Hammer size={14} className="text-primary" />
                        <p className="font-label text-[9px] uppercase tracking-widest text-primary">How to Fix</p>
                      </div>
                      <div className="space-y-3">
                        {card.howToFix.map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                            <p className="text-sm leading-relaxed text-zinc-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-surface-container-low p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <p className="font-label text-[9px] uppercase tracking-widest text-emerald-400">Suggestions</p>
                      </div>
                      <div className="space-y-3">
                        {card.suggestions.map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <p className="text-sm leading-relaxed text-zinc-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-surface-container-low p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Shield size={14} className="text-sky-300" />
                        <p className="font-label text-[9px] uppercase tracking-widest text-sky-300">State Farm-Oriented Options</p>
                      </div>
                      <div className="space-y-3">
                        {card.stateFarmRecommendations.map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-300" />
                            <p className="text-sm leading-relaxed text-zinc-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {card.drivers.length > 0 && (
                    <div className="border-t border-outline-variant/10 bg-background/30 px-6 py-4">
                      <p className="mb-3 font-label text-[9px] uppercase tracking-widest text-white/30">Top Score Drivers</p>
                      <div className="flex flex-wrap gap-2">
                        {card.drivers.map((driver) => (
                          <span
                            key={`${card.key}-${driver.reason}`}
                            className="border border-outline-variant/15 bg-surface-container-lowest px-3 py-1.5 font-label text-[9px] uppercase tracking-wider text-white/45"
                          >
                            {driver.reason.replaceAll('_', ' ')} · +{driver.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        <aside className="space-y-6">
          <div className="border border-outline-variant/20 bg-surface-container-high p-6">
            <div className="mb-4 flex items-center gap-2">
              <Siren size={14} className="text-red-400" />
              <p className="font-label text-[9px] uppercase tracking-widest text-red-400">Fix First</p>
            </div>
            <div className="space-y-4">
              {topThree.map((card, index) => (
                <div key={card.key} className="border border-outline-variant/15 bg-black/10 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-headline text-lg text-white/85">{String(index + 1).padStart(2, '0')}</span>
                    <span className={`font-headline text-lg ${scoreColor(card.score)}`}>{card.score}</span>
                  </div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-white/70">{card.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{card.howToFix[0]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-outline-variant/20 bg-surface-container-low p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-300" />
              <p className="font-label text-[9px] uppercase tracking-widest text-amber-300">How to Use This</p>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
              <p>Start with the highest score and highest urgency category before spending effort on lower-score items.</p>
              <p>Once repairs are done, regenerate `risk.json` so the app reflects the corrected property condition.</p>
              <p>Use invoices, inspection reports, and photos to support any renewal or discount conversation with your agent.</p>
            </div>
          </div>

          <div className="border border-outline-variant/20 bg-surface-container-low p-6">
            <div className="mb-4 flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              <p className="font-label text-[9px] uppercase tracking-widest text-primary">Next Step</p>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-zinc-400">
              Review the full score mechanics or compare against the simulator after you make changes.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => onNavigate('INQUIRY', 'push')}
                className="w-full border border-primary/30 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/5"
              >
                Open Risk Breakdown
              </button>
              <button
                onClick={() => onNavigate('TIMELINE', 'push')}
                className="w-full border border-outline-variant/20 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:bg-white/5"
              >
                Open Timeline
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
