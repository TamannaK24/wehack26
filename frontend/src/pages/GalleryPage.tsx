import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { NavigateFn } from '../types/navigation';

type PinId = 'kitchen' | 'master' | 'living' | 'dining';

type PinAccent = 'red' | 'amber' | 'gold';

/** Gallery hero always shows this score; chat still uses live `/risk` when available. */
const GALLERY_DISPLAY_SCORE = 67;

const PIN_DETAILS: Record<
  PinId,
  {
    accent: PinAccent;
    exhibitLabel: string;
    title: string;
    reportLabel?: string;
    headline: string;
    body: string;
    actionLabel?: string;
    actionText?: string;
    badge: string;
    badgeIcon: string;
  }
> = {
  kitchen: {
    accent: 'red',
    exhibitLabel: 'Derived from uploaded packet',
    title: 'Inspector narrative + imagery',
    reportLabel: 'Kitchen — inspection report & property photos',
    headline: 'Moisture and heat signals concentrated in this zone',
    body:
      'The inspection summary documents seepage history at the sink cabinet and dishwasher, with grease loading called out on the range hood. Property stills show dense outlet use behind the counter and combustibles near the cooktop. Onboarding quiz entries indicate infrequent exhaust-fan checks and reactive leak handling; combined, those inputs raise water and fire weight for this room relative to the rest of the plan.',
    actionLabel: 'Recommended documentation',
    actionText:
      'Updated tight shots of the under-sink area and backsplash outlets—paired with the report’s written fix list—can be appended to the file for clearer carrier-facing mitigation evidence.',
    badge: 'Review soon',
    badgeIcon: 'priority_high',
  },
  master: {
    accent: 'amber',
    exhibitLabel: 'Narrative vs. stills',
    title: 'Report language + room photos',
    reportLabel: 'Master bedroom — inspection notes & stills',
    headline: 'Imagery consistent with egress and alarm callouts in the PDF',
    body:
      'The inspection narrative cites aging battery smoke alarms and a bedroom window sealed shut at the last visit. Wide-angle room photos still show furniture under that window line. Quiz data flags rare alarm testing; life-safety weighting stays elevated until dated imagery or detector replacement receipts appear in the packet.',
    actionLabel: 'Recommended documentation',
    actionText:
      'Operable-window views with alarms visible in frame, or uploaded invoices for new detectors, align fastest with the written findings and help clear the open alarm/egress items.',
    badge: 'Monitor',
    badgeIcon: 'info',
  },
  living: {
    accent: 'gold',
    exhibitLabel: 'Image review + report table',
    title: 'Low urgency per inspection table',
    headline: 'Living room stills read as maintained vs. narrative',
    body:
      'The inspection summary marks the space generally sound aside from extension cords crossing a walk path. Later property photos show cords rerouted post walkthrough. Quiz entries reference seasonal fireplace use; no new heat-related damage is visible in the stills, so this zone remains contextual support rather than a score spike.',
    actionLabel: 'Recommended documentation',
    actionText:
      'A dated wide-angle photo after each chimney service keeps the visual record aligned with the maintenance section of the inspection report.',
    badge: 'On track',
    badgeIcon: 'check_circle',
  },
  dining: {
    accent: 'gold',
    exhibitLabel: 'Door and floor callouts',
    title: 'Narrative + frame alignment',
    headline: 'Patio door and threshold notes echoed in property photos',
    body:
      'The inspection cites a binding sliding patio door and a slight level change at the dining threshold. Property images show the same door ajar with a thin rug over the transition, matching the narrative description. Quiz responses reference higher guest traffic; slip and glass exposure is flagged as a watch item rather than a new defect beyond the report.',
    actionLabel: 'Recommended documentation',
    actionText:
      'Post-adjustment close-ups from the same camera angle as the prior upload preserve a consistent visual record when rugs or threshold caps are changed.',
    badge: 'On track',
    badgeIcon: 'check_circle',
  },
};

const CONNECTOR_STROKE: Record<PinId, string> = {
  kitchen: 'rgb(248 113 113)',
  master: 'rgb(251 146 60)',
  living: 'rgb(228 228 231)',
  dining: 'rgb(161 161 170)',
};

function panelBorderClass(accent: PinAccent): string {
  if (accent === 'red') return 'border-red-500';
  if (accent === 'amber') return 'border-orange-500';
  return 'border-rose-400/80';
}

function panelIconClass(accent: PinAccent): string {
  if (accent === 'red') return 'text-red-400';
  if (accent === 'amber') return 'text-orange-400';
  return 'text-rose-300';
}

type ChatMessage = { id: string; role: 'user' | 'bot'; text: string };

type RiskResponse = {
  masterScore: number;
  riskTier: string;
  subscores: {
    roofWeatherScore: number;
    waterPlumbingScore: number;
    fireElectricalScore: number;
    securityScore: number;
    structuralScore: number;
    claimsHistoryScore: number;
  };
  details?: Record<string, Array<{ reason: string; value: number }>>;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function buildPropertyContext(risk: RiskResponse | null) {
  if (!risk) {
    return {
      final_score: null,
      label: 'Unknown',
      categories: {},
      top_drivers: [],
      weight_source: 'backend/risk.json',
    };
  }

  const top_drivers = Object.values(risk.details ?? {})
    .flat()
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((item) => ({ reason: item.reason, value: item.value }));

  return {
    final_score: risk.masterScore,
    label: risk.riskTier,
    categories: {
      roof_weather: risk.subscores.roofWeatherScore,
      water_plumbing: risk.subscores.waterPlumbingScore,
      fire_electrical: risk.subscores.fireElectricalScore,
      security_theft: risk.subscores.securityScore,
      structural_foundation: risk.subscores.structuralScore,
      claims_history: risk.subscores.claimsHistoryScore,
    },
    top_drivers,
    weight_source: 'backend/risk.json',
  };
}

const CuratorsGallery = ({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) => {
  const [openPin, setOpenPin] = useState<PinId | null>(null);
  const [commsOpen, setCommsOpen] = useState(false);
  const [riskContext, setRiskContext] = useState<RiskResponse | null>(null);
  const [chatPending, setChatPending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      text:
        'Hi — I am here to explain your home risk score using inspection findings and your onboarding quiz. Ask how to prevent water, fire, or weather losses, or what to fix first for insurance peace of mind.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [blueprintLockedFlat, setBlueprintLockedFlat] = useState(false);
  const [connector, setConnector] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const sidePanelRef = useRef<HTMLElement | null>(null);
  const pinDotRefs = useRef<Partial<Record<PinId, HTMLDivElement | null>>>({});
  useEffect(() => {
    const link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(link1);

    return () => {
      document.head.removeChild(link1);
    };
  }, []);

  useEffect(() => {
    if (openPin == null && !commsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (commsOpen) setCommsOpen(false);
        else setOpenPin(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openPin, commsOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, commsOpen]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRiskContext() {
      try {
        const response = await fetch(`${API_BASE_URL}/risk`, { signal: controller.signal });
        const payload = (await response.json()) as RiskResponse | { error?: string };

        if (!response.ok) {
          throw new Error('Unable to load risk context for chat.');
        }

        setRiskContext(payload as RiskResponse);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Unable to load gallery chat risk context', error);
      }
    }

    void loadRiskContext();
    return () => controller.abort();
  }, []);

  const sendChatMessage = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatPending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatPending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          property_context: buildPropertyContext(riskContext),
        }),
      });

      const data = (await response.json()) as { response?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Could not connect to server.');
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: data.response || 'No response received.',
        },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: error instanceof Error ? error.message : 'Could not connect to server.',
        },
      ]);
    } finally {
      setChatPending(false);
    }
  }, [chatInput, chatPending, riskContext]);

  const updateConnector = useCallback(() => {
    if (openPin == null) {
      setConnector(null);
      return;
    }
    const bridge = bridgeRef.current;
    const panel = sidePanelRef.current;
    const dot = pinDotRefs.current[openPin];
    if (!bridge || !panel || !dot) {
      setConnector(null);
      return;
    }
    const br = bridge.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const dr = dot.getBoundingClientRect();
    const pcx = pr.left + pr.width / 2;
    const pcy = pr.top + pr.height / 2;
    const dcx = dr.left + dr.width / 2;
    const dcy = dr.top + dr.height / 2;
    let x1 = pr.right - br.left;
    let y1 = pcy - br.top;
    const x2 = dcx - br.left;
    const y2 = dcy - br.top;
    if (pr.right <= dcx - 4) {
      x1 = pr.right - br.left;
      y1 = pcy - br.top;
    } else if (pr.left >= dcx + 4) {
      x1 = pr.left - br.left;
      y1 = pcy - br.top;
    } else if (pr.bottom <= dcy - 4) {
      x1 = pcx - br.left;
      y1 = pr.bottom - br.top;
    } else {
      x1 = pcx - br.left;
      y1 = pr.top - br.top;
    }
    setConnector({ x1, y1, x2, y2 });
  }, [openPin]);

  useLayoutEffect(() => {
    updateConnector();
    const id = requestAnimationFrame(() => updateConnector());
    return () => cancelAnimationFrame(id);
  }, [openPin, updateConnector]);

  useEffect(() => {
    const bridge = bridgeRef.current;
    if (!bridge) return;
    const ro = new ResizeObserver(() => updateConnector());
    ro.observe(bridge);
    window.addEventListener('scroll', updateConnector, true);
    window.addEventListener('resize', updateConnector);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', updateConnector, true);
      window.removeEventListener('resize', updateConnector);
    };
  }, [updateConnector]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const openDetail = openPin == null ? null : PIN_DETAILS[openPin];
  const riskRingCircumference = 2 * Math.PI * 110;
  const riskScoreForRing = GALLERY_DISPLAY_SCORE;
  const galleryRiskTier = riskContext?.riskTier ?? 'Elevated risk';

  return (
    <div className="heist-gallery relative overflow-x-hidden bg-[#030203] text-white antialiased selection:bg-red-600/35 selection:text-white">
      <style>{`
        /* Scoped theme: home risk radar — dark red surfaces aligned with gallery */
        .heist-gallery {
          --font-headline: "Bebas Neue", ui-sans-serif, system-ui, sans-serif;
          --font-body: "Outfit", ui-sans-serif, system-ui, sans-serif;
          --font-label: "JetBrains Mono", ui-monospace, monospace;
          --color-primary: #f87171;
          --color-primary-container: #dc2626;
          --color-on-primary: #fff1f2;
          --color-background: #030203;
          --color-surface: #0c0a0a;
          --color-surface-container: #141010;
          --color-surface-container-low: #0a0808;
          --color-surface-container-high: #1a1212;
          --color-outline: #7f1d1d;
          --color-outline-variant: #3f1515;
        }
        .heist-gallery .font-serif {
          font-family: "Outfit", ui-sans-serif, system-ui, sans-serif;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        .heist-panel {
          background: linear-gradient(165deg, rgba(28, 6, 8, 0.98) 0%, rgba(6, 4, 5, 0.99) 100%);
          box-shadow:
            inset 0 1px 0 rgba(248, 113, 113, 0.12),
            0 0 0 1px rgba(127, 29, 29, 0.45),
            0 24px 48px rgba(0, 0, 0, 0.75);
        }
        .heist-glow-red { box-shadow: 0 0 18px 4px rgba(239, 68, 68, 0.55); }
        .heist-glow-orange {
          box-shadow: 0 0 14px 3px rgba(251, 146, 60, 0.48);
        }
        .heist-glow-white {
          box-shadow:
            0 0 12px 2px rgba(255, 255, 255, 0.35),
            0 0 4px 1px rgba(255, 255, 255, 0.22);
        }
        .heist-glow-neutral {
          box-shadow: 0 0 10px 2px rgba(228, 228, 231, 0.2);
        }
        .heist-spotlight {
          background:
            radial-gradient(ellipse 90% 55% at 50% -15%, rgba(127, 29, 29, 0.35) 0%, transparent 55%),
            radial-gradient(circle at 100% 80%, rgba(69, 10, 10, 0.5) 0%, transparent 45%),
            linear-gradient(180deg, #0a0505 0%, #030203 50%, #020102 100%);
        }
        .blueprint-tilt {
          perspective: 1200px;
          transform-style: preserve-3d;
        }
        .blueprint-tilt .isometric-view {
          transform: perspective(1000px) rotateX(28deg) rotateZ(-28deg) translateX(-1.5%);
          transform-origin: center center;
          transform-style: preserve-3d;
          transition: transform 1.15s cubic-bezier(0.25, 0.85, 0.35, 1);
          will-change: transform;
        }
        /* After first pointer hover, stays page-aligned (see blueprintLockedFlat state) */
        .blueprint-tilt--locked-flat .isometric-view {
          transform: perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(0, 0, 0) scale(1.02);
        }
        @media (prefers-reduced-motion: reduce) {
          .blueprint-tilt .isometric-view {
            transition-duration: 0.01ms;
          }
        }
        .blueprint-floorplan text {
          font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif;
        }
        .blueprint-floorplan .bp-serif {
          font-family: Georgia, 'Palatino Linotype', 'Times New Roman', serif;
        }
        .blueprint-stage {
          overscroll-behavior: none;
          touch-action: manipulation;
          padding-block: clamp(1rem, 4vw, 2.5rem);
          padding-inline: clamp(0.25rem, 2vw, 1rem);
        }
      `}</style>

      {/* Canvas (nested inside App <main> — avoid duplicate main landmark) */}
      <div className="heist-spotlight relative min-h-[calc(100vh-3rem)] pb-10 pt-5 sm:min-h-[calc(100vh-4rem)] sm:pt-8">
        <div
          ref={bridgeRef}
          className="relative z-10 mx-auto w-full max-w-[min(100%,1920px)] px-0 sm:px-2 lg:px-4"
        >
          {/* Pin↔panel connector: overlay on bridge (not a grid row — avoids breaking the 12-col layout) */}
          {connector != null && openPin != null && (
            <svg
              className="pointer-events-none absolute inset-0 z-[25] h-full min-h-[320px] w-full overflow-visible"
              aria-hidden
            >
              <line
                x1={connector.x1}
                y1={connector.y1}
                x2={connector.x2}
                y2={connector.y2}
                stroke={CONNECTOR_STROKE[openPin]}
                strokeWidth={2}
                strokeOpacity={0.88}
                strokeLinecap="round"
              />
              <circle
                cx={connector.x2}
                cy={connector.y2}
                r={5}
                fill={CONNECTOR_STROKE[openPin]}
                fillOpacity={0.92}
              />
            </svg>
          )}

          <div className="relative z-10 grid w-full grid-cols-12 items-start gap-6 py-6 sm:gap-8 sm:py-8 lg:gap-10 lg:py-10">
          {/* Left column: hero + row with gauge + risk detail side-by-side (lg+) */}
          <div className="col-span-12 flex min-h-0 w-full min-w-0 flex-col gap-6 sm:gap-8 lg:col-span-6 xl:col-span-5">
            <section className="shrink-0">
              <h2 className="font-label text-[10px] uppercase tracking-[0.35em] text-white/80 mb-3 sm:mb-4">
                Home protection · Inspection &amp; quiz
              </h2>
              <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:gap-10">
                <h1 className="min-w-0 flex-1 font-headline text-5xl font-normal uppercase tracking-[0.02em] text-white leading-[0.95] sm:text-6xl lg:text-7xl">
                  Mission <br />
                  <span className="text-red-400">beat the claim</span>
                </h1>
                {/* Risk score — aligned with title row; uses /risk when loaded */}
                <div
                  className="relative z-20 mx-auto aspect-square w-[10rem] shrink-0 sm:mx-0 sm:w-[11.25rem] lg:w-[12rem]"
                  aria-label={`Home risk score ${GALLERY_DISPLAY_SCORE}, ${galleryRiskTier}`}
                >
                  <svg
                    className="absolute inset-0 h-full w-full overflow-visible -rotate-90"
                    viewBox="0 0 240 240"
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden
                  >
                    <circle
                      className="text-red-500/90"
                      cx="120"
                      cy="120"
                      r="110"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={riskRingCircumference}
                      strokeDashoffset={riskRingCircumference * (1 - riskScoreForRing / 100)}
                      strokeLinecap="round"
                      strokeWidth="10"
                    />
                  </svg>
                  <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-[#0a0506] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    <span className="font-label text-[8px] uppercase tracking-widest text-white/85 mb-0.5 sm:text-[9px]">Risk score</span>
                    <div className="font-headline text-3xl font-normal text-white sm:text-4xl">{GALLERY_DISPLAY_SCORE}</div>
                    <span className="font-body italic text-white/80 text-[11px] mt-0.5 sm:text-xs text-center leading-tight px-1">
                      {galleryRiskTier}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex min-h-0 w-full flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-5">
              {openDetail != null && (
                <aside
                  ref={sidePanelRef}
                  className={`heist-panel relative z-30 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain rounded-sm border-l-4 p-5 pr-9 sm:p-6 sm:pr-11 lg:max-h-[min(72vh,560px)] ${panelBorderClass(openDetail.accent)}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-sm p-1.5 text-white/55 transition-colors hover:bg-red-950/50 hover:text-white"
                    aria-label="Close risk details"
                    onClick={() => setOpenPin(null)}
                  >
                    <span className="material-symbols-outlined text-xl leading-none">close</span>
                  </button>
                  <div className="mb-3 flex items-start gap-2 border-b border-red-950/50 pb-2 pr-8">
                    <span className={`material-symbols-outlined mt-0.5 shrink-0 text-lg ${panelIconClass(openDetail.accent)}`}>
                      {openDetail.badgeIcon}
                    </span>
                    <h3 className="font-headline text-lg font-normal uppercase tracking-wide leading-snug text-white sm:text-xl">
                      {openDetail.title}
                    </h3>
                  </div>
                  <div className="min-h-0 flex-1 space-y-3">
                    <div>
                      <p className="font-label mb-1 text-[10px] font-medium uppercase tracking-widest text-white/85">
                        {openDetail.exhibitLabel}
                      </p>
                      {openDetail.reportLabel != null && (
                        <p className="font-label mb-1 text-[9px] uppercase tracking-wider text-white/65">
                          {openDetail.reportLabel}
                        </p>
                      )}
                      <h4 className="font-body text-base font-semibold leading-tight text-white sm:text-lg">{openDetail.headline}</h4>
                    </div>
                    <p className="font-body text-[11px] leading-relaxed text-white/92 sm:text-xs">{openDetail.body}</p>
                    {openDetail.actionLabel != null && openDetail.actionText != null && (
                      <div
                        className={`border p-2.5 sm:p-3 ${
                          openDetail.accent === 'red'
                            ? 'border-red-800/50 bg-red-950/35'
                            : openDetail.accent === 'amber'
                              ? 'border-orange-900/50 bg-orange-950/30'
                              : 'border-rose-900/45 bg-rose-950/25'
                        }`}
                      >
                        <p className="font-label mb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-white/90">
                          {openDetail.actionLabel}
                        </p>
                        <p className="font-body text-[11px] font-medium text-white/95">{openDetail.actionText}</p>
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-red-950/40 pt-2">
                      <span
                        className={`font-label text-[9px] font-medium uppercase tracking-widest ${panelIconClass(openDetail.accent)}`}
                      >
                        {openDetail.badge}
                      </span>
                      <span className={`material-symbols-outlined text-lg ${panelIconClass(openDetail.accent)}`}>
                        {openDetail.badgeIcon}
                      </span>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>

          {/* Right column: blueprint — slightly smaller max width */}
          <div className="blueprint-stage relative col-span-12 flex min-h-0 w-full min-w-0 flex-col justify-center overflow-visible lg:col-span-6 lg:min-h-[min(85vh,960px)] xl:col-span-7">
            <div className="relative mx-auto w-full max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
              <div
                className={`blueprint-tilt relative aspect-[700/520] w-full overflow-visible rounded-sm ${blueprintLockedFlat ? 'blueprint-tilt--locked-flat' : ''}`}
                onPointerEnter={() => setBlueprintLockedFlat(true)}
              >
                <div className="absolute inset-0 isometric-view">
                  {/* Dark blueprint field + faint grid */}
                  <div className="absolute inset-0 rounded-sm bg-[#0c0a0a] shadow-[inset_0_0_0_1px_rgba(127,29,29,0.45)] shadow-2xl shadow-black/60 backdrop-blur-sm">
                    <div
                      className="absolute inset-0 opacity-[0.14]"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(248, 113, 113, 0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(248, 113, 113, 0.11) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                      }}
                    />

                  {/* SVG + pins: same aspect as viewBox — fills stage, no nested scroll */}
                  <div className="relative h-full w-full p-3 sm:p-5">
                    <div className="relative h-full w-full cursor-default" onClick={() => setOpenPin(null)}>
                  <svg
                    viewBox="0 0 700 520"
                    xmlns="http://www.w3.org/2000/svg"
                    className="blueprint-floorplan absolute inset-0 block h-full w-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <pattern id="bp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#fca5a5" strokeWidth="0.35" opacity="0.14" />
                      </pattern>
                      <marker id="bp-dim-arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                        <path d="M0,0 L5,2.5 L0,5 Z" fill="#fca5a5" />
                      </marker>
                    </defs>

                    <rect width="700" height="520" fill="#0a0808" rx="2" />
                    <rect width="700" height="520" fill="url(#bp-grid)" rx="2" opacity="0.85" />

                    <text
                      x="350"
                      y="28"
                      textAnchor="middle"
                      fill="#f87171"
                      className="bp-serif"
                      fontSize="14"
                      letterSpacing="0.12em"
                    >
                      YOUR HOME FLOOR PLAN
                    </text>
                    <text x="350" y="44" textAnchor="middle" fill="#d4d4d8" fontSize="7.5" letterSpacing="0.14em" opacity="0.78">
                      INSPECTION NOTES · QUIZ RESPONSES · RISK ZONES
                    </text>

                    <rect x="14" y="14" width="672" height="492" fill="none" stroke="#fca5a5" strokeWidth="1.8" rx="1" opacity="0.92" />
                    <rect x="28" y="56" width="644" height="408" fill="none" stroke="#fca5a5" strokeWidth="1" opacity="0.55" />

                    <line x1="244" y1="56" x2="244" y2="464" stroke="#fca5a5" strokeWidth="1.15" opacity="0.88" />
                    <line x1="456" y1="56" x2="456" y2="464" stroke="#fca5a5" strokeWidth="1.15" opacity="0.88" />
                    <line x1="28" y1="278" x2="672" y2="278" stroke="#fca5a5" strokeWidth="1.15" opacity="0.88" />
                    <line x1="456" y1="388" x2="672" y2="388" stroke="#fca5a5" strokeWidth="0.9" opacity="0.72" />

                    {/* Living room — col 1 top */}
                    <text x="36" y="72" fill="#fca5a5" fontSize="7" opacity="0.78">
                      22&apos; × 18&apos;
                    </text>
                    <line x1="40" y1="84" x2="228" y2="84" stroke="#fca5a5" strokeWidth="0.45" opacity="0.35" />
                    <text x="138" y="102" textAnchor="middle" fill="#fca5a5" fontSize="6.5" opacity="0.72">
                      EXPOSED BEAM
                    </text>
                    <text x="138" y="124" textAnchor="middle" fill="#f4f4f5" className="bp-serif" fontSize="11" fontWeight="bold">
                      LIVING ROOM
                    </text>
                    <rect x="52" y="198" width="78" height="22" rx="2" fill="none" stroke="#fca5a5" strokeWidth="0.75" opacity="0.88" />
                    <rect x="146" y="188" width="20" height="18" rx="1" fill="none" stroke="#fca5a5" strokeWidth="0.7" opacity="0.82" />
                    <rect x="90" y="168" width="38" height="16" rx="1" fill="none" stroke="#fca5a5" strokeWidth="0.65" opacity="0.8" />
                    <rect x="218" y="142" width="14" height="44" fill="#1a1010" stroke="#fca5a5" strokeWidth="0.75" opacity="0.95" />
                    <text x="225" y="170" textAnchor="middle" fill="#fca5a5" fontSize="6.5" opacity="0.85">
                      FP
                    </text>
                    <path d="M 244 248 Q 200 256 170 268" fill="none" stroke="#fca5a5" strokeWidth="0.55" strokeDasharray="3 2" opacity="0.55" />
                    <text x="138" y="262" textAnchor="middle" fill="#fca5a5" fontSize="6.5" opacity="0.68">
                      ARCH
                    </text>

                    {/* Master bedroom — col 2 top */}
                    <text x="252" y="72" fill="#fca5a5" fontSize="7" opacity="0.78">
                      16&apos; × 14&apos;
                    </text>
                    <line x1="252" y1="88" x2="268" y2="88" stroke="#fca5a5" strokeWidth="0.65" opacity="0.75" />
                    <line x1="252" y1="88" x2="252" y2="200" stroke="#fca5a5" strokeWidth="0.65" opacity="0.75" />
                    <text x="258" y="148" fill="#fca5a5" fontSize="6" opacity="0.7" transform="rotate(-90 258 148)">
                      W.I.C.
                    </text>
                    <text x="350" y="124" textAnchor="middle" fill="#f4f4f5" className="bp-serif" fontSize="11" fontWeight="bold">
                      MASTER BEDROOM
                    </text>
                    <text x="350" y="138" textAnchor="middle" fill="#fca5a5" fontSize="6.5" opacity="0.72">
                      KING BED
                    </text>
                    <rect x="310" y="155" width="52" height="36" rx="2" fill="none" stroke="#fca5a5" strokeWidth="0.7" opacity="0.85" />
                    <rect x="380" y="168" width="28" height="20" rx="1" fill="none" stroke="#fca5a5" strokeWidth="0.65" opacity="0.75" />

                    {/* Bath — col 3 top */}
                    <text x="464" y="72" fill="#fca5a5" fontSize="7" opacity="0.78">
                      10&apos; × 12&apos;
                    </text>
                    <text x="562" y="118" textAnchor="middle" fill="#f4f4f5" className="bp-serif" fontSize="10" fontWeight="bold">
                      BATH
                    </text>
                    <rect x="472" y="128" width="36" height="36" fill="none" stroke="#fca5a5" strokeWidth="0.65" opacity="0.8" />
                    <text x="490" y="150" textAnchor="middle" fill="#fca5a5" fontSize="5.5" opacity="0.7">
                      SHOWER
                    </text>
                    <ellipse cx="548" cy="158" rx="22" ry="14" fill="none" stroke="#fca5a5" strokeWidth="0.65" opacity="0.78" />
                    <text x="548" y="160" textAnchor="middle" fill="#fca5a5" fontSize="5.5" opacity="0.72">
                      TUB
                    </text>
                    <rect x="612" y="140" width="48" height="22" fill="none" stroke="#fca5a5" strokeWidth="0.65" opacity="0.78" />
                    <text x="636" y="154" textAnchor="middle" fill="#fca5a5" fontSize="5.5" opacity="0.72">
                      VANITY
                    </text>

                    {/* Kitchen — col 1 bottom */}
                    <text x="138" y="296" textAnchor="middle" fill="#f4f4f5" className="bp-serif" fontSize="10" fontWeight="bold">
                      KITCHEN
                    </text>
                    <text x="138" y="312" textAnchor="middle" fill="#fca5a5" fontSize="6" opacity="0.72">
                      WALNUT UPPER CABS · STONE HOOD · FRIDGE
                    </text>
                    <rect x="88" y="330" width="100" height="34" rx="2" fill="none" stroke="#fca5a5" strokeWidth="0.75" opacity="0.88" />
                    <text x="138" y="350" textAnchor="middle" fill="#fca5a5" fontSize="6" opacity="0.78">
                      GRANITE ISLAND · SINK · SEATING
                    </text>
                    <circle cx="118" cy="392" r="5" fill="none" stroke="#fca5a5" strokeWidth="0.55" opacity="0.65" />
                    <circle cx="138" cy="392" r="5" fill="none" stroke="#fca5a5" strokeWidth="0.55" opacity="0.65" />
                    <circle cx="158" cy="392" r="5" fill="none" stroke="#fca5a5" strokeWidth="0.55" opacity="0.65" />
                    <text x="138" y="410" textAnchor="middle" fill="#fca5a5" fontSize="6" opacity="0.7">
                      LEATHER BARSTOOLS · ENTRY
                    </text>

                    {/* Dining — col 2 bottom */}
                    <text x="350" y="296" textAnchor="middle" fill="#fca5a5" fontSize="7" opacity="0.78">
                      18&apos; × 16&apos;
                    </text>
                    <text x="350" y="318" textAnchor="middle" fill="#f4f4f5" className="bp-serif" fontSize="10" fontWeight="bold">
                      DINING ROOM
                    </text>
                    <text x="350" y="332" textAnchor="middle" fill="#fca5a5" fontSize="6" opacity="0.72">
                      FARMHOUSE TABLE · SEATS 10
                    </text>
                    <polygon
                      points="350,345 310,395 390,395"
                      fill="none"
                      stroke="#fca5a5"
                      strokeWidth="0.55"
                      opacity="0.45"
                    />
                    <text x="350" y="378" textAnchor="middle" fill="#fca5a5" fontSize="6" opacity="0.68">
                      CRYSTAL CHANDELIER
                    </text>
                    <line x1="268" y1="420" x2="432" y2="420" stroke="#fca5a5" strokeWidth="1.2" opacity="0.55" />
                    <text x="350" y="436" textAnchor="middle" fill="#fca5a5" fontSize="6" opacity="0.7">
                      FRENCH DOORS · LINEN DRAPES
                    </text>

                    {/* Bedroom 2 — col 3 mid-bottom */}
                    <text x="562" y="296" textAnchor="middle" fill="#fca5a5" fontSize="7" opacity="0.78">
                      14&apos; × 12&apos;
                    </text>
                    <text x="562" y="318" textAnchor="middle" fill="#f4f4f5" className="bp-serif" fontSize="10" fontWeight="bold">
                      BEDROOM 2
                    </text>
                    <rect x="508" y="330" width="44" height="34" rx="2" fill="none" stroke="#fca5a5" strokeWidth="0.7" opacity="0.82" />
                    <text x="530" y="350" textAnchor="middle" fill="#fca5a5" fontSize="6" opacity="0.72">
                      QUEEN
                    </text>
                    <rect x="580" y="340" width="56" height="28" rx="2" fill="none" stroke="#fca5a5" strokeWidth="0.55" strokeDasharray="4 2" opacity="0.55" />
                    <text x="608" y="356" textAnchor="middle" fill="#fca5a5" fontSize="5.5" opacity="0.65">
                      AREA RUG
                    </text>

                    {/* Utility */}
                    <text x="562" y="408" textAnchor="middle" fill="#f4f4f5" className="bp-serif" fontSize="9" fontWeight="bold">
                      UTILITY
                    </text>
                    <rect x="500" y="416" width="36" height="30" fill="none" stroke="#fca5a5" strokeWidth="0.65" opacity="0.78" />
                    <rect x="548" y="416" width="36" height="30" fill="none" stroke="#fca5a5" strokeWidth="0.65" opacity="0.78" />
                    <text x="518" y="434" textAnchor="middle" fill="#fca5a5" fontSize="6.5" opacity="0.75">
                      W
                    </text>
                    <text x="566" y="434" textAnchor="middle" fill="#fca5a5" fontSize="6.5" opacity="0.75">
                      D
                    </text>

                    {/* ELEC panel icon */}
                    <rect x="36" y="472" width="22" height="18" fill="none" stroke="#fca5a5" strokeWidth="0.6" opacity="0.7" />
                    <text x="47" y="484" textAnchor="middle" fill="#fca5a5" fontSize="5" opacity="0.65">
                      ELEC
                    </text>

                    {/* Material legend */}
                    <text x="72" y="478" fill="#fca5a5" fontSize="6" opacity="0.75">
                      LEGEND
                    </text>
                    <rect x="72" y="484" width="8" height="8" fill="#2a1212" stroke="#fca5a5" strokeWidth="0.4" />
                    <text x="84" y="491" fill="#fca5a5" fontSize="5.5" opacity="0.65">
                      Walnut
                    </text>
                    <rect x="130" y="484" width="8" height="8" fill="#6b2a2a" stroke="#fca5a5" strokeWidth="0.35" opacity="0.75" />
                    <text x="142" y="491" fill="#fca5a5" fontSize="5.5" opacity="0.65">
                      Granite
                    </text>
                    <rect x="188" y="484" width="8" height="8" fill="#4a3030" stroke="#fca5a5" strokeWidth="0.4" />
                    <text x="200" y="491" fill="#fca5a5" fontSize="5.5" opacity="0.65">
                      Stone
                    </text>
                    <rect x="240" y="484" width="8" height="8" fill="#2e1818" stroke="#fca5a5" strokeWidth="0.4" />
                    <text x="252" y="491" fill="#fca5a5" fontSize="5.5" opacity="0.65">
                      Wood flr
                    </text>

                    {/* North arrow */}
                    <g transform="translate(628, 478)" opacity="0.85">
                      <circle r="18" fill="none" stroke="#fca5a5" strokeWidth="0.7" />
                      <path d="M 0 -12 L 4 8 L 0 4 L -4 8 Z" fill="#fca5a5" opacity="0.9" />
                      <text x="0" y="22" textAnchor="middle" fill="#fca5a5" fontSize="7" fontWeight="bold">
                        N
                      </text>
                    </g>

                    <line
                      x1="120"
                      y1="502"
                      x2="580"
                      y2="502"
                      stroke="#fca5a5"
                      strokeWidth="0.5"
                      opacity="0.4"
                      markerStart="url(#bp-dim-arrow)"
                      markerEnd="url(#bp-dim-arrow)"
                    />
                    <text x="350" y="500" textAnchor="middle" fill="#fca5a5" fontSize="7" opacity="0.55">
                      PREVENT LOSSES — INSPECTION + QUIZ INFORMED COVERAGE
                    </text>

                    <rect width="700" height="520" fill="none" stroke="#fca5a5" strokeWidth="2" rx="2" opacity="0.95" />
                  </svg>

                  {/* Pin hit targets — detail panel + connector line on selection */}
                  <div className="pointer-events-none absolute inset-0 z-20">
                    <div
                      className="pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(138 / 700) * 100}%`, top: `${(360 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'kitchen'}
                      aria-label="Kitchen — open risk details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPin((p) => (p === 'kitchen' ? null : 'kitchen'));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenPin((p) => (p === 'kitchen' ? null : 'kitchen'));
                        }
                      }}
                    >
                      <div
                        ref={(el) => {
                          pinDotRefs.current.kitchen = el;
                        }}
                        className={`heist-glow-red h-5 w-5 cursor-pointer rounded-full border-2 border-red-200/30 bg-red-600 animate-pulse transition-shadow ${
                          openPin === 'kitchen' ? 'ring-2 ring-red-200/90 ring-offset-2 ring-offset-[#0a0808]' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(350 / 700) * 100}%`, top: `${(165 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'master'}
                      aria-label="Master bedroom — open risk details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPin((p) => (p === 'master' ? null : 'master'));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenPin((p) => (p === 'master' ? null : 'master'));
                        }
                      }}
                    >
                      <div
                        ref={(el) => {
                          pinDotRefs.current.master = el;
                        }}
                        className={`heist-glow-orange h-3.5 w-3.5 cursor-pointer rounded-full border border-orange-400/40 bg-orange-500 transition-shadow hover:bg-orange-400 ${
                          openPin === 'master' ? 'ring-2 ring-orange-200 ring-offset-2 ring-offset-[#0a0808]' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(138 / 700) * 100}%`, top: `${(165 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'living'}
                      aria-label="Living room — open risk details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPin((p) => (p === 'living' ? null : 'living'));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenPin((p) => (p === 'living' ? null : 'living'));
                        }
                      }}
                    >
                      <div
                        ref={(el) => {
                          pinDotRefs.current.living = el;
                        }}
                        className={`heist-glow-white h-3 w-3 cursor-pointer rounded-full border border-zinc-400/70 bg-zinc-600 transition-shadow hover:bg-zinc-500 ${
                          openPin === 'living' ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#0a0808]' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(350 / 700) * 100}%`, top: `${(360 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'dining'}
                      aria-label="Dining room — open risk details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPin((p) => (p === 'dining' ? null : 'dining'));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenPin((p) => (p === 'dining' ? null : 'dining'));
                        }
                      }}
                    >
                      <div
                        ref={(el) => {
                          pinDotRefs.current.dining = el;
                        }}
                        className={`heist-glow-neutral h-3 w-3 cursor-pointer rounded-full border border-zinc-500/70 bg-zinc-600 transition-all hover:bg-zinc-500 ${
                          openPin === 'dining' ? 'ring-2 ring-zinc-300 ring-offset-2 ring-offset-[#0a0808]' : ''
                        }`}
                      />
                    </div>
                  </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Ambient glows (positioned to blueprint column) */}
            <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] z-0 h-96 w-96 rounded-full bg-red-900/15 blur-[120px]" />
            <div className="pointer-events-none absolute left-[-5%] top-[-5%] z-0 h-72 w-72 rounded-full bg-red-950/25 blur-[100px]" />
          </div>

          </div>
        </div>
      </div>

      {/* Chatbot FAB + popup */}
      {commsOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[55] cursor-default bg-black/55 backdrop-blur-[2px]"
          aria-label="Close assistant"
          onClick={() => setCommsOpen(false)}
        />
      )}
      {commsOpen && (
        <div
          id="comms-chat-panel"
          className="fixed bottom-28 right-4 z-[60] flex max-h-[min(72vh,520px)] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-sm border border-red-900/50 bg-[#0a0606] shadow-[0_24px_64px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(248,113,113,0.08)] sm:right-10 sm:bottom-32"
          role="dialog"
          aria-modal="true"
          aria-labelledby="comms-panel-title"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-red-950/50 bg-[#120808] px-4 py-3">
            <div>
              <p id="comms-panel-title" className="font-headline text-sm uppercase tracking-wide text-white">
                Home risk assistant
              </p>
              <p className="font-label text-[9px] uppercase tracking-widest text-red-400/70">Inspection &amp; quiz aware</p>
            </div>
            <button
              type="button"
              className="rounded-sm p-2 text-white/60 transition-colors hover:bg-red-950/50 hover:text-white"
              aria-label="Close assistant"
              onClick={() => setCommsOpen(false)}
            >
              <span className="material-symbols-outlined text-xl leading-none">close</span>
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-sm px-3 py-2 font-body text-xs leading-relaxed sm:text-sm ${
                    m.role === 'user'
                      ? 'bg-red-950/50 text-white/95 border border-red-900/40'
                      : 'bg-[#141010] text-white/90 border border-red-950/35'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form
            className="shrink-0 border-t border-red-950/45 bg-[#080505] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendChatMessage();
            }}
          >
            <div className="flex gap-2">
              <label htmlFor="comms-input" className="sr-only">
                Message
              </label>
              <input
                id="comms-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about coverage, prevention, or your score…"
                className="min-w-0 flex-1 border border-red-950/40 bg-[#030203] px-3 py-2.5 font-body text-sm text-white placeholder:text-zinc-600 focus:border-red-800/50 focus:outline-none focus:ring-1 focus:ring-red-900/40"
                autoComplete="off"
              />
              <button
                type="submit"
                className="shrink-0 border border-red-800/50 bg-red-950/50 px-4 py-2 font-label text-[10px] font-bold uppercase tracking-wider text-red-100 transition hover:bg-red-900/60"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="fixed bottom-10 right-4 z-[60] sm:right-10">
        <div className="group relative">
          {!commsOpen && (
            <div className="pointer-events-none absolute bottom-full right-0 mb-3 hidden opacity-0 transition-opacity group-hover:opacity-100 sm:block">
              <span className="bg-[#140808] px-4 py-2 font-label text-xs text-white/90 shadow-lg shadow-black/50 ring-1 ring-red-900/50">
                Open assistant
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCommsOpen((o) => !o)}
            className={`group flex h-16 w-16 items-center justify-center rounded-sm border-2 shadow-[0_0_28px_rgba(220,38,38,0.35)] transition hover:scale-105 active:scale-95 ${
              commsOpen
                ? 'border-red-500/80 bg-red-950/60 ring-2 ring-red-500/30'
                : 'border-red-700/70 bg-[#120606]'
            }`}
            aria-expanded={commsOpen}
            aria-controls="comms-chat-panel"
            aria-label={commsOpen ? 'Close home risk chat' : 'Open home risk chat'}
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              <span
                className="material-symbols-outlined text-3xl text-red-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {commsOpen ? 'chat' : 'forum'}
              </span>
              {!commsOpen && (
                <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#030203]" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Background Vignette */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_220px_rgba(0,0,0,0.92)] z-0" />
    </div>
  );
};

export default CuratorsGallery;
