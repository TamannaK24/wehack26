import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  CloudHail,
  Droplets,
  Flame,
  House,
  Image as ImageIcon,
  MapPin,
  ScrollText,
  Shield,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

type FinalDocument = {
  address?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  document_risk_extraction?: {
    documents?: Array<Record<string, unknown>>;
    risk_factors?: Array<Record<string, unknown>>;
  };
  document_risk_extraction_meta?: {
    source_files?: string[];
    saved_at?: string;
  };
  photo_risk_extraction?: {
    risk_factors?: Array<Record<string, unknown>>;
  };
  photo_risk_extraction_meta?: {
    source_files?: string[];
    saved_at?: string;
  };
};

type RiskResponse = {
  masterScore: number;
  riskTier: string;
  subscores: Record<string, number>;
  details?: Record<string, Array<{ reason: string; value: number }>>;
};

type TimelineEntry = {
  id: string;
  dateKey: string;
  displayDate: string;
  severity: 'critical' | 'elevated' | 'moderate';
  category: string;
  title: string;
  detail: string;
  metrics: string[];
  icon: LucideIcon;
  type: 'claim' | 'inspection' | 'photo' | 'completion';
};

function severityTone(severity: TimelineEntry['severity']) {
  if (severity === 'critical') {
    return {
      text: 'text-red-400',
      dot: 'bg-red-500',
      border: 'border-red-700/40',
      bg: 'bg-red-950/20',
      badge: 'bg-red-950/60 text-red-400 border-red-700/50',
    };
  }
  if (severity === 'elevated') {
    return {
      text: 'text-orange-300',
      dot: 'bg-orange-400',
      border: 'border-orange-700/35',
      bg: 'bg-orange-950/10',
      badge: 'bg-orange-950/50 text-orange-300 border-orange-700/40',
    };
  }
  return {
    text: 'text-zinc-300',
    dot: 'bg-zinc-400',
    border: 'border-zinc-700/35',
    bg: 'bg-zinc-900/25',
    badge: 'bg-zinc-900/60 text-zinc-400 border-zinc-700/40',
  };
}

function parseDate(value: unknown): string | null {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function slugToLabel(value: string) {
  return value.replaceAll('_', ' ').replaceAll('-', ' ');
}

function claimSeverity(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('open')) return 'critical';
  if (normalized.includes('partial')) return 'elevated';
  return 'moderate';
}

function iconForCategory(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('hail') || normalized.includes('roof')) return CloudHail;
  if (normalized.includes('water') || normalized.includes('plumbing')) return Droplets;
  if (normalized.includes('fire') || normalized.includes('smoke')) return Flame;
  if (normalized.includes('wind')) return Wind;
  if (normalized.includes('structural') || normalized.includes('foundation')) return House;
  if (normalized.includes('security') || normalized.includes('theft')) return Shield;
  return ScrollText;
}

function buildTimeline(finalDocument: FinalDocument | null, risk: RiskResponse | null): TimelineEntry[] {
  if (!finalDocument) {
    return [];
  }

  const entries: TimelineEntry[] = [];
  const documents = finalDocument.document_risk_extraction?.documents || [];
  const documentFactors = (finalDocument.document_risk_extraction?.risk_factors || []).filter(
    (factor): factor is Record<string, unknown> => typeof factor === 'object' && factor !== null,
  );

  documents.forEach((document, index) => {
    const documentType = String(document.document_type || 'document');
    const isClaim = documentType === 'claim';
    const primaryDate =
      parseDate(document.date_of_loss) ||
      parseDate(document.date_reported) ||
      parseDate(document.inspection_date);

    if (!primaryDate) {
      return;
    }

    const relatedFactors = documentFactors
      .filter((factor) => {
        if (isClaim) {
          return factor.source_type === 'claim' && factor.source_name === document.source_name;
        }
        return factor.source_type === 'home_inspection_report';
      })
      .slice(0, 3);

    const status = String(document.claim_status || document.document_type || 'Document');
    entries.push({
      id: `claim-${index}`,
      dateKey: primaryDate,
      displayDate: formatDate(primaryDate),
      severity: isClaim ? claimSeverity(status) : 'moderate',
      category: isClaim ? 'Claim document' : 'Inspection document',
      title: isClaim
        ? `${status} · ${document.claim_number || 'Unnumbered claim'}`
        : `${slugToLabel(documentType)} reviewed`,
      detail: isClaim
        ? `Carrier ${document.carrier || 'unknown'} logged a ${status.toLowerCase()} event tied to this property.`
        : 'Inspection findings were extracted and added to the underwriting file for this home.',
      metrics: [
        document.policy_number ? `Policy ${document.policy_number}` : 'Inspection evidence added',
        ...relatedFactors.map((factor) => slugToLabel(String(factor.factor_key || factor.category || 'risk factor'))),
      ].slice(0, 4),
      icon: isClaim ? ClipboardList : ScrollText,
      type: isClaim ? 'claim' : 'inspection',
    });
  });

  const inspectionFiles = (finalDocument.document_risk_extraction_meta?.source_files || []).filter((file) =>
    file.startsWith('inspection_'),
  );
  const inspectionDate = parseDate(finalDocument.document_risk_extraction_meta?.saved_at);
  inspectionFiles.forEach((fileName, index) => {
    const fallbackDate = inspectionDate
      ? new Date(new Date(inspectionDate).getTime() + index * 60_000).toISOString()
      : new Date(Date.UTC(2026, 3, 12, 10, index, 0)).toISOString();
    entries.push({
      id: `inspection-file-${index}`,
      dateKey: fallbackDate,
      displayDate: formatDate(fallbackDate),
      severity: 'moderate',
      category: 'Inspection file',
      title: slugToLabel(fileName.replace(/^inspection_[^_]+_/, '').replace(/\.pdf$/i, '')),
      detail: 'Inspection document captured and included in the property review sequence.',
      metrics: ['Inspection upload', 'Ordered from uploaded file list'],
      icon: ScrollText,
      type: 'inspection',
    });
  });

  const photoFactors = (finalDocument.photo_risk_extraction?.risk_factors || []).filter(
    (factor): factor is Record<string, unknown> => typeof factor === 'object' && factor !== null,
  );
  const photoFiles = finalDocument.photo_risk_extraction_meta?.source_files || [];
  const photoSavedAt = parseDate(finalDocument.photo_risk_extraction_meta?.saved_at);
  photoFiles.forEach((fileName, index) => {
    const relatedFactor = photoFactors[index];
    const factorCategory = relatedFactor ? String(relatedFactor.category || 'photo evidence') : 'photo evidence';
    const severity =
      String(relatedFactor?.severity || '').toLowerCase() === 'high'
        ? 'critical'
        : relatedFactor
          ? 'elevated'
          : 'moderate';
    const fallbackDate = photoSavedAt
      ? new Date(new Date(photoSavedAt).getTime() + index * 60_000).toISOString()
      : new Date(Date.UTC(2026, 3, 12, 11, index, 0)).toISOString();
    entries.push({
      id: `photo-${index}`,
      dateKey: fallbackDate,
      displayDate: formatDate(fallbackDate),
      severity,
      category: 'Photo evidence',
      title: slugToLabel(fileName.replace(/^photo_[^_]+_/, '').replace(/\.[^.]+$/i, '')),
      detail: relatedFactor
        ? String(relatedFactor.evidence || `Photo evidence supports ${factorCategory} risk.`)
        : 'Property photo captured as part of the underwriting review.',
      metrics: [
        relatedFactor ? `Category ${slugToLabel(factorCategory)}` : 'Visual evidence',
        relatedFactor ? `Severity ${String(relatedFactor.severity || 'unknown')}` : 'No extracted severity',
      ],
      icon: relatedFactor ? iconForCategory(factorCategory) : ImageIcon,
      type: 'photo',
    });
  });

  const topRisks = Object.entries(risk?.subscores || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, value]) => `${slugToLabel(key)} ${value}`);

  const completionBase = photoSavedAt || inspectionDate || new Date().toISOString();
  const completionDate = new Date(new Date(completionBase).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  entries.push({
    id: 'expected-completion',
    dateKey: completionDate,
    displayDate: formatDate(completionDate),
    severity: 'moderate',
    category: 'Expected completion',
    title: 'Priority remediation package should be complete',
    detail:
      'The timeline ends with the expected point where the highest-risk repairs, documentation updates, and underwriting follow-up should be ready for resubmission.',
    metrics: topRisks.length > 0 ? topRisks : ['Complete top repairs', 'Refresh risk score', 'Prepare insurer review'],
    icon: CheckCircle2,
    type: 'completion',
  });

  return entries.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export default function RiskTimelineDataPage({ onNavigate }: { onNavigate: NavigateFn }) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const [finalDocument, setFinalDocument] = useState<FinalDocument | null>(null);
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [finalResponse, riskResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/final`, { signal: controller.signal }),
          fetch(`${apiBaseUrl}/risk`, { signal: controller.signal }),
        ]);
        const finalPayload = await finalResponse.json();
        const riskPayload = await riskResponse.json();

        if (!finalResponse.ok) {
          throw new Error(finalPayload?.error || 'Unable to load final.json');
        }
        if (!riskResponse.ok) {
          throw new Error(riskPayload?.error || 'Unable to load risk.json');
        }

        setFinalDocument(finalPayload);
        setRisk(riskPayload);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unable to load timeline data');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => controller.abort();
  }, [apiBaseUrl]);

  const timelineEntries = useMemo(() => buildTimeline(finalDocument, risk), [finalDocument, risk]);
  const addressLabel = finalDocument?.address
    ? [
        finalDocument.address.address,
        finalDocument.address.city,
        finalDocument.address.state,
      ]
        .filter(Boolean)
        .join(' · ')
    : 'Property timeline';

  const criticalCount = timelineEntries.filter((entry) => entry.severity === 'critical').length;
  const claimCount = timelineEntries.filter((entry) => entry.type === 'claim').length;
  const photoCount = timelineEntries.filter((entry) => entry.type === 'photo').length;

  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative mb-12 overflow-hidden border border-red-950/40 bg-gradient-to-br from-red-950/20 via-background to-background p-8 md:p-10">
        <div className="absolute right-0 top-0 h-24 w-24 border-b border-l border-red-800/20" />
        <div className="absolute bottom-0 left-0 h-16 w-16 border-r border-t border-red-800/10" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.008)_3px,rgba(255,255,255,0.008)_4px)] pointer-events-none" />

        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              <p className="font-label text-[10px] uppercase tracking-[0.35em] text-red-400/90">
                Claims, inspections, photos · ordered from intake data
              </p>
            </div>
            <h1 className="mb-4 font-headline text-6xl uppercase tracking-tighter text-on-background md:text-8xl">
              Event <span className="text-red-400">timeline</span>
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-zinc-500 md:text-lg">
              This timeline now uses the uploaded claims, inspection documents, and property photos from your backend.
              It closes with the expected completion point for the highest-priority remediation work.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-2 border border-red-800/30 bg-red-950/30 px-3 py-1.5">
              <MapPin size={10} className="text-red-400" />
              <span className="font-label text-[9px] uppercase tracking-widest text-red-400/80">{addressLabel}</span>
            </div>
            <p className="font-label text-[9px] uppercase tracking-widest text-white/20">
              {risk ? `Current tier · ${risk.riskTier}` : 'Waiting for risk score'}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-2 gap-px border border-outline-variant/15 bg-outline-variant/10 sm:grid-cols-4">
        {[
          { label: 'Tracked entries', value: timelineEntries.length, color: 'text-white', sub: 'timeline items' },
          { label: 'Critical events', value: criticalCount, color: 'text-red-400', sub: 'highest urgency' },
          { label: 'Claim files', value: claimCount, color: 'text-primary', sub: 'dated claim records' },
          { label: 'Photo records', value: photoCount, color: 'text-green-400', sub: 'visual evidence' },
        ].map((card) => (
          <div key={card.label} className="bg-surface-container-low p-5 flex min-h-[88px] flex-col justify-between">
            <p className={`font-headline text-4xl leading-none ${card.color}`}>{loading ? '--' : card.value}</p>
            <div>
              <p className="font-label text-[9px] uppercase tracking-widest text-white/20">{card.sub}</p>
              <p className="font-label text-[9px] uppercase tracking-widest text-white/40 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </section>

      {error && (
        <section className="mb-8 border border-red-700/35 bg-red-950/20 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="font-label text-[10px] uppercase tracking-widest text-red-400">{error}</p>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="relative pl-8">
          <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-red-700/60 via-red-900/30 via-70% to-transparent" />
          {timelineEntries.map((_, i) => (
            <div
              key={i}
              className="absolute left-[10px] h-px w-2 bg-red-800/30"
              style={{ top: `${(i / Math.max(timelineEntries.length, 1)) * 92 + 4}%` }}
            />
          ))}

          <div className="space-y-4">
            {loading ? (
              <div className="border border-outline-variant/20 bg-surface-container-low p-6">
                <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500">Building property timeline...</p>
              </div>
            ) : (
              timelineEntries.map((entry, idx) => {
                const palette = severityTone(entry.severity);
                const Icon = entry.icon;
                return (
                  <article
                    key={entry.id}
                    className={`relative border p-5 transition-all duration-200 hover:brightness-110 ${palette.border} ${palette.bg}`}
                  >
                    <div className="absolute -left-[1.62rem] top-6 flex h-6 w-6 items-center justify-center rounded-full border border-red-900/50 bg-background">
                      <span className={`h-2.5 w-2.5 rounded-full ${palette.dot}`} />
                    </div>

                    <div className="absolute right-4 top-4 font-label text-[9px] text-white/12 tracking-widest">
                      {String(idx + 1).padStart(2, '0')} / {String(timelineEntries.length).padStart(2, '0')}
                    </div>

                    <div className="flex flex-wrap items-start gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center border ${palette.border} bg-background/60`}>
                        <Icon size={18} className={palette.text} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`border px-1.5 py-0.5 font-label text-[8px] uppercase tracking-widest ${palette.badge}`}>
                            {entry.severity}
                          </span>
                          <span className={`font-label text-[9px] uppercase tracking-widest ${palette.text}`}>{entry.displayDate}</span>
                          <span className="font-label text-[9px] uppercase tracking-widest text-white/20">·</span>
                          <span className="font-label text-[9px] uppercase tracking-widest text-white/35">{entry.category}</span>
                        </div>

                        <h2 className="font-headline text-xl uppercase tracking-[0.04em] text-white leading-tight">
                          {entry.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{entry.detail}</p>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {entry.metrics.map((metric) => (
                            <span
                              key={metric}
                              className="border border-outline-variant/20 bg-surface-container-lowest px-2 py-0.5 font-label text-[8px] uppercase tracking-widest text-white/40"
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="mt-4 ml-[-0.5px] flex items-center gap-3 pl-4">
            <div className="h-px flex-1 bg-gradient-to-r from-red-900/30 to-transparent" />
            <span className="font-label text-[8px] uppercase tracking-widest text-white/15">expected completion point</span>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="border border-outline-variant/25 bg-surface-container-high">
            <div className="border-b border-outline-variant/20 px-5 py-3 flex items-center gap-2">
              <Activity size={13} className="text-primary/70" />
              <p className="font-label text-[9px] uppercase tracking-widest text-primary/80">Legend · Data Source</p>
            </div>

            <div className="p-5 space-y-4">
              {[
                { icon: ClipboardList, label: 'Claims', desc: 'Placed by loss or reported date' },
                { icon: ScrollText, label: 'Inspections', desc: 'Kept in uploaded file order when no date is available' },
                { icon: Camera, label: 'Photos', desc: 'Shown in saved upload order from photo extraction' },
                { icon: CheckCircle2, label: 'Completion', desc: 'Projected end-state after top fixes are done' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <Icon size={13} className="text-white/60 mt-0.5" />
                    <div>
                      <p className="font-label text-[9px] uppercase tracking-widest text-white/55">{item.label}</p>
                      <p className="font-label text-[8px] text-white/25 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-outline-variant/25 bg-surface-container-low">
            <div className="border-b border-outline-variant/20 px-5 py-3 flex items-center gap-2">
              <Shield size={13} className="text-red-400/70" />
              <p className="font-label text-[9px] uppercase tracking-widest text-red-400/80">Current Outlook</p>
            </div>
            <div className="p-5 space-y-3">
              <p className="font-headline text-3xl text-white">{risk?.riskTier || '--'}</p>
              <p className="font-label text-[10px] uppercase tracking-widest text-white/30">
                Master score {risk?.masterScore ?? '--'}
              </p>
              {Object.entries(risk?.subscores || {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3 border-t border-outline-variant/10 pt-3">
                    <span className="font-label text-[9px] uppercase tracking-widest text-white/40">
                      {slugToLabel(key)}
                    </span>
                    <span className="font-headline text-sm text-white">{value}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="border border-outline-variant/20 bg-surface-container-high p-5">
            <div className="mb-4 flex items-center gap-2">
              <Wrench size={14} className="text-primary" />
              <p className="font-label text-[9px] uppercase tracking-widest text-primary">Expected Completion</p>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-zinc-500">
              <p>Finish the highest-risk roof, water, and claims-driven remediation items first.</p>
              <p>Once those repairs are documented, regenerate `risk.json` and refresh the underwriting review pages.</p>
            </div>
          </div>

          <div className="border border-red-900/30 bg-red-950/10 p-5">
            <div className="mb-1.5 flex items-center gap-2">
              <Zap size={12} className="text-red-400/70" />
              <p className="font-label text-[9px] uppercase tracking-widest text-red-400/70">Next Step</p>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-zinc-500">
              Review the detailed fix plan or jump back to the score breakdown.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => onNavigate('ARCHIVE', 'push')}
                className="w-full border border-primary/30 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/5 flex items-center justify-center gap-2"
              >
                <Shield size={11} />
                Open Fix Plan
              </button>
              <button
                onClick={() => onNavigate('INQUIRY', 'push')}
                className="w-full border border-outline-variant/20 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:bg-white/5 flex items-center justify-center gap-2"
              >
                <AlertTriangle size={11} />
                Open Risk Score
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
