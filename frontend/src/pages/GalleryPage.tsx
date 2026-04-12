import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { NavigateFn } from '../types/navigation';

type PinId = 'kitchen' | 'master' | 'great' | 'den';

type PinAccent = 'red' | 'amber' | 'gold';

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
    exhibitLabel: 'Incident Report 402-A',
    title: 'Archival Alert: High-Priority Risk',
    reportLabel: 'Zone 3 — Primary Kitchen',
    headline: 'Thermal Spike: East Wing Kitchen',
    body:
      'Sensors in the Primary Kitchen have registered unprecedented thermal fluctuations exceeding standard archival safety thresholds. This suggests a potential failure in the automated climate suppression system.',
    actionLabel: 'Recommended Action',
    actionText:
      'Execute immediate vault-lock override and dispatch a physical appraisal team to recalibrate primary thermal sensors.',
    badge: 'Critical Alert',
    badgeIcon: 'priority_high',
  },
  master: {
    accent: 'amber',
    exhibitLabel: 'Vault access log',
    title: 'Inquiry: Unusual timing',
    headline: 'Master Suite',
    body:
      'Vault entry log shows unusual activity timing. Cross-reference with resident schedules and perimeter sensors.',
    actionLabel: 'Recommended Action',
    actionText: 'Schedule a discreet review of suite access windows and backup authentication logs.',
    badge: 'Inquiry Required',
    badgeIcon: 'info',
  },
  great: {
    accent: 'gold',
    exhibitLabel: 'Ambient monitoring',
    title: 'Routine status',
    headline: 'Great Room',
    body: 'Ambient monitoring is nominal across all channels. No intervention required at this time.',
    badge: 'Low Priority',
    badgeIcon: 'check_circle',
  },
  den: {
    accent: 'gold',
    exhibitLabel: 'Scheduled review',
    title: 'Routine status',
    headline: 'Den',
    body: 'Quarterly walkthrough is the only pending item; environment and access logs are clear.',
    badge: 'Low Priority',
    badgeIcon: 'check_circle',
  },
};

const CONNECTOR_STROKE: Record<PinId, string> = {
  kitchen: 'rgb(248 113 113)',
  master: 'rgb(251 146 60)',
  great: 'rgb(228 228 231)',
  den: 'rgb(161 161 170)',
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

const CuratorsGallery = ({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) => {
  const [openPin, setOpenPin] = useState<PinId | null>(null);
  const [commsOpen, setCommsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Risk Radar comms online. Ask about the floor plan, zones, or vault status.',
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

  const sendChatMessage = useCallback(() => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    window.setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text:
            'Message received. Field routing is simulated for this demo — connect your API to enable live intel.',
        },
      ]);
    }, 600);
  }, [chatInput]);

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

  return (
    <div className="heist-gallery relative overflow-x-hidden bg-[#030203] text-white antialiased selection:bg-red-600/35 selection:text-white">
      <style>{`
        /* Scoped theme: red/black heist — avoids clashing with museum shell tokens */
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
          {/* Left column: hero + row with gauge + intel side‑by‑side (lg+) so both stay visible */}
          <div className="col-span-12 flex min-h-0 w-full min-w-0 flex-col gap-6 sm:gap-8 lg:col-span-6 xl:col-span-5">
            <section className="shrink-0">
              <h2 className="font-label text-[10px] uppercase tracking-[0.35em] text-white/80 mb-3 sm:mb-4">Crew brief · Run 01</h2>
              <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:gap-10">
                <h1 className="min-w-0 flex-1 font-headline text-5xl font-normal uppercase tracking-[0.02em] text-white leading-[0.95] sm:text-6xl lg:text-7xl">
                  Target <br />
                  <span className="text-red-400">floor plan</span>
                </h1>
                {/* Risk score — aligned with title row */}
                <div
                  className="relative z-20 mx-auto aspect-square w-[10rem] shrink-0 sm:mx-0 sm:w-[11.25rem] lg:w-[12rem]"
                  aria-label="Heat index 84, elevated"
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
                      strokeDasharray="691"
                      strokeDashoffset="110"
                      strokeLinecap="round"
                      strokeWidth="10"
                    />
                  </svg>
                  <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-[#0a0506] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    <span className="font-label text-[8px] uppercase tracking-widest text-white/85 mb-0.5 sm:text-[9px]">Heat index</span>
                    <div className="font-headline text-3xl font-normal text-white sm:text-4xl">84</div>
                    <span className="font-body italic text-white/80 text-[11px] mt-0.5 sm:text-xs">Elevated</span>
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
                    aria-label="Close intel panel"
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
                  <div className="absolute inset-0 rounded-sm bg-black/45 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] shadow-2xl shadow-black/60 backdrop-blur-sm">
                    <div
                      className="absolute inset-0 opacity-[0.08]"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
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
                      <pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.2" />
                      </pattern>
                      <marker id="bp-dim-arrow" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                        <path d="M0,0 L5,2.5 L0,5 Z" fill="#e5e5e5" />
                      </marker>
                    </defs>

                    <rect width="700" height="520" fill="#080808" rx="4" />
                    <rect width="700" height="520" fill="url(#bp-grid)" rx="4" />

                    {/*
                      Angled wing: garage (grey) + utility; junction at kitchen corner (190, 268).
                    */}
                    <g transform="translate(166, 340) rotate(-45)">
                      <rect
                        x="-92"
                        y="-34"
                        width="100"
                        height="68"
                        fill="#161616"
                        stroke="#ffffff"
                        strokeWidth="1.8"
                      />
                      <line x1="-88" y1="-28" x2="-4" y2="28" stroke="#ffffff" strokeWidth="0.65" opacity="0.28" />
                      <line x1="-4" y1="-28" x2="-88" y2="28" stroke="#ffffff" strokeWidth="0.65" opacity="0.28" />
                      <rect
                        x="8"
                        y="-34"
                        width="60"
                        height="68"
                        fill="#0f0c0c"
                        stroke="#ffffff"
                        strokeWidth="1.8"
                      />
                      <g transform="rotate(45)">
                        <text x="-42" y="-6" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.85">
                          10&apos; Clg
                        </text>
                        <text x="-42" y="8" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" opacity="0.95">
                          Garage
                        </text>
                        <text x="-42" y="22" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.8">
                          21/7x29/0
                        </text>
                        <text x="40" y="8" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" opacity="0.92">
                          Utility
                        </text>
                      </g>
                    </g>

                    {/* Master Suite */}
                    <rect x="50" y="60" width="130" height="120" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.8" />
                    <text x="115" y="108" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.85">
                      Vaulted
                    </text>
                    <text x="115" y="122" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" opacity="0.95">
                      Master Suite
                    </text>
                    <text x="115" y="137" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.8">
                      14/0x16/0
                    </text>
                    <rect x="56" y="145" width="28" height="28" fill="none" stroke="#ffffff" strokeWidth="0.75" opacity="0.65" />
                    <text x="70" y="163" textAnchor="middle" fill="#ffffff" fontSize="7.5" opacity="0.75">
                      M.B.
                    </text>
                    <rect x="140" y="145" width="30" height="28" fill="none" stroke="#ffffff" strokeWidth="0.75" opacity="0.65" />
                    <text x="155" y="163" textAnchor="middle" fill="#ffffff" fontSize="7.5" opacity="0.75">
                      W/I
                    </text>

                    {/* Dining Room */}
                    <rect x="190" y="58" width="115" height="104" fill="#100a0a" stroke="#ffffff" strokeWidth="1.8" />
                    <text x="247" y="98" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.85">
                      9&apos; Clg
                    </text>
                    <text x="247" y="112" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" opacity="0.95">
                      Dining Rm
                    </text>
                    <text x="247" y="126" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.8">
                      13/0x12/0
                    </text>

                    {/* Outdoor Living — grey zone */}
                    <rect x="315" y="30" width="150" height="105" fill="#0a0808" stroke="#ffffff" strokeWidth="1.8" strokeDasharray="4,3" />
                    <text x="390" y="72" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" opacity="0.9">
                      Outdoor
                    </text>
                    <text x="390" y="86" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" opacity="0.9">
                      Living Rm
                    </text>
                    <text x="390" y="100" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.75">
                      20/0x20/4
                    </text>
                    {/* Sliding-door symbol toward great room */}
                    <line x1="315" y1="95" x2="315" y2="98" stroke="#ffffff" strokeWidth="1.2" />
                    <line x1="318" y1="92" x2="318" y2="101" stroke="#ffffff" strokeWidth="0.55" />

                    {/* Bed 2 */}
                    <rect x="490" y="45" width="155" height="110" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.8" />
                    <text x="568" y="86" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.85">
                      9&apos; CLG
                    </text>
                    <text x="568" y="100" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" opacity="0.95">
                      Bed #2
                    </text>
                    <text x="568" y="114" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.8">
                      17/0x12/0
                    </text>
                    <rect x="492" y="135" width="32" height="24" fill="none" stroke="#ffffff" strokeWidth="0.65" opacity="0.6" />
                    <text x="508" y="151" textAnchor="middle" fill="#ffffff" fontSize="7" opacity="0.7">
                      W/I
                    </text>
                    <rect x="530" y="135" width="28" height="24" fill="none" stroke="#ffffff" strokeWidth="0.65" opacity="0.6" />
                    <text x="544" y="151" textAnchor="middle" fill="#ffffff" fontSize="7" opacity="0.7">
                      B
                    </text>

                    {/* Bed 3 */}
                    <rect x="490" y="175" width="155" height="110" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.8" />
                    <text x="568" y="212" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.85">
                      9&apos; Clg
                    </text>
                    <text x="568" y="226" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" opacity="0.95">
                      Bed #3
                    </text>
                    <text x="568" y="240" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.8">
                      13/2x13/0
                    </text>
                    <rect x="492" y="256" width="32" height="24" fill="none" stroke="#ffffff" strokeWidth="0.65" opacity="0.6" />
                    <text x="508" y="272" textAnchor="middle" fill="#ffffff" fontSize="7" opacity="0.7">
                      W/I
                    </text>
                    <rect x="530" y="256" width="28" height="24" fill="none" stroke="#ffffff" strokeWidth="0.65" opacity="0.6" />
                    <text x="544" y="272" textAnchor="middle" fill="#ffffff" fontSize="7" opacity="0.7">
                      B
                    </text>

                    {/* Great Room */}
                    <rect x="305" y="145" width="175" height="175" fill="#100a0a" stroke="#ffffff" strokeWidth="2" />
                    <rect
                      x="311"
                      y="151"
                      width="163"
                      height="163"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.75"
                      strokeDasharray="5,4"
                      opacity="0.38"
                    />
                    <text x="392" y="215" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.85">
                      10&apos; CLG
                    </text>
                    <text x="392" y="232" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.75">
                      2 Story
                    </text>
                    <text x="392" y="248" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold" opacity="0.95">
                      Great Rm
                    </text>
                    <text x="392" y="264" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.8">
                      20/0x20/0
                    </text>
                    {/* Fireplace on right wall */}
                    <rect x="468" y="210" width="10" height="36" fill="#1c1610" stroke="#ffffff" strokeWidth="0.7" />

                    {/* Kitchen */}
                    <rect x="190" y="162" width="115" height="106" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.8" />
                    <line x1="190" y1="162" x2="305" y2="162" stroke="#ffffff" strokeWidth="0.9" opacity="0.35" />
                    <text x="247" y="222" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" opacity="0.95">
                      Kitchen
                    </text>
                    <rect x="220" y="230" width="55" height="28" fill="none" stroke="#ffffff" strokeWidth="0.65" opacity="0.65" />
                    <circle cx="232" cy="244" r="4.5" fill="none" stroke="#ffffff" strokeWidth="0.55" opacity="0.55" />
                    <circle cx="248" cy="244" r="4.5" fill="none" stroke="#ffffff" strokeWidth="0.55" opacity="0.55" />
                    <circle cx="263" cy="244" r="4.5" fill="none" stroke="#ffffff" strokeWidth="0.55" opacity="0.55" />
                    {/* Door swing toward dining */}
                    <path d="M 305 200 A 14 14 0 0 1 291 214" fill="none" stroke="#ffffff" strokeWidth="0.65" />

                    {/* Foyer */}
                    <rect x="290" y="330" width="110" height="85" fill="#100a0a" stroke="#ffffff" strokeWidth="1.8" />
                    <rect
                      x="296"
                      y="336"
                      width="98"
                      height="73"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.75"
                      strokeDasharray="5,4"
                      opacity="0.35"
                    />
                    <text x="345" y="362" textAnchor="middle" fill="#ffffff" fontSize="8" opacity="0.75">
                      2 Story
                    </text>
                    <text x="345" y="377" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" opacity="0.95">
                      Foyer
                    </text>
                    {/* Stair run */}
                    <g stroke="#ffffff" strokeWidth="0.55" opacity="0.7">
                      <line x1="318" y1="388" x2="372" y2="388" />
                      <line x1="318" y1="393" x2="372" y2="393" />
                      <line x1="318" y1="398" x2="372" y2="398" />
                      <line x1="318" y1="403" x2="372" y2="403" />
                      <line x1="318" y1="408" x2="372" y2="408" />
                    </g>
                    <text x="345" y="402" textAnchor="middle" fill="#ffffff" fontSize="7" opacity="0.65">
                      UP
                    </text>

                    {/* Powder */}
                    <rect x="410" y="330" width="70" height="55" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.8" />
                    <text x="445" y="361" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" opacity="0.88">
                      Powder
                    </text>
                    <ellipse cx="445" cy="373" rx="9" ry="7" fill="none" stroke="#ffffff" strokeWidth="0.55" opacity="0.55" />
                    <path d="M 438 365 A 8 8 0 0 1 445 358" fill="none" stroke="#ffffff" strokeWidth="0.55" />

                    {/* Den — compact, stacked under powder (same width) */}
                    <rect x="410" y="388" width="70" height="78" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.8" />
                    <text x="445" y="418" textAnchor="middle" fill="#ffffff" fontSize="7.5" opacity="0.82">
                      12&apos; CLG
                    </text>
                    <text x="445" y="432" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" opacity="0.95">
                      Den
                    </text>
                    <text x="445" y="445" textAnchor="middle" fill="#ffffff" fontSize="7.5" opacity="0.78">
                      10/0x9/0
                    </text>

                    {/* Dimension line with tick arrows */}
                    <line
                      x1="190"
                      y1="508"
                      x2="490"
                      y2="508"
                      stroke="#ffffff"
                      strokeWidth="0.55"
                      opacity="0.45"
                      markerStart="url(#bp-dim-arrow)"
                      markerEnd="url(#bp-dim-arrow)"
                    />
                    <line x1="190" y1="503" x2="190" y2="513" stroke="#ffffff" strokeWidth="0.6" opacity="0.45" />
                    <line x1="490" y1="503" x2="490" y2="513" stroke="#ffffff" strokeWidth="0.6" opacity="0.45" />
                    <text x="340" y="505" textAnchor="middle" fill="#ffffff" fontSize="9" opacity="0.55">
                      81/5
                    </text>

                    {/* Area summary (reference sheet style) — nudged right to clear Den / blueprint */}
                    <text x="492" y="458" textAnchor="start" fill="#ffffff" fontSize="7.5" opacity="0.5">
                      Main Floor: 2,757 Sq. Ft.
                    </text>
                    <text x="492" y="470" textAnchor="start" fill="#ffffff" fontSize="7.5" opacity="0.5">
                      Upper Floor: 554 Sq. Ft.
                    </text>
                    <text x="492" y="482" textAnchor="start" fill="#ffffff" fontSize="7.5" opacity="0.5">
                      Total: 3,311 Sq. Ft.
                    </text>
                    <text x="492" y="494" textAnchor="start" fill="#ffffff" fontSize="7.5" opacity="0.5">
                      + Garage: 659 Sq. Ft.
                    </text>

                    <rect width="700" height="520" fill="none" stroke="#ffffff" strokeWidth="2.5" rx="4" opacity="0.98" />
                  </svg>

                  {/* Pin hit targets — detail panel + connector line on selection */}
                  <div className="pointer-events-none absolute inset-0 z-20">
                    <div
                      className="pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(248 / 700) * 100}%`, top: `${(215 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'kitchen'}
                      aria-label="Primary Kitchen — open intel"
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
                          openPin === 'kitchen' ? 'ring-2 ring-red-200/90 ring-offset-2 ring-offset-[#030203]' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(115 / 700) * 100}%`, top: `${(100 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'master'}
                      aria-label="Master Suite — open intel"
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
                          openPin === 'master' ? 'ring-2 ring-orange-200 ring-offset-2 ring-offset-[#030203]' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(393 / 700) * 100}%`, top: `${(233 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'great'}
                      aria-label="Great Room — open intel"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPin((p) => (p === 'great' ? null : 'great'));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenPin((p) => (p === 'great' ? null : 'great'));
                        }
                      }}
                    >
                      <div
                        ref={(el) => {
                          pinDotRefs.current.great = el;
                        }}
                        className={`heist-glow-white h-3 w-3 cursor-pointer rounded-full border border-zinc-400/70 bg-zinc-600 transition-shadow hover:bg-zinc-500 ${
                          openPin === 'great' ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#030203]' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(445 / 700) * 100}%`, top: `${(427 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'den'}
                      aria-label="Den — open intel"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPin((p) => (p === 'den' ? null : 'den'));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenPin((p) => (p === 'den' ? null : 'den'));
                        }
                      }}
                    >
                      <div
                        ref={(el) => {
                          pinDotRefs.current.den = el;
                        }}
                        className={`heist-glow-neutral h-3 w-3 cursor-pointer rounded-full border border-zinc-500/70 bg-zinc-600 transition-all hover:bg-zinc-500 ${
                          openPin === 'den' ? 'ring-2 ring-zinc-300 ring-offset-2 ring-offset-[#030203]' : ''
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
          aria-label="Close comms"
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
                Field comms
              </p>
              <p className="font-label text-[9px] uppercase tracking-widest text-red-400/70">Encrypted · sim</p>
            </div>
            <button
              type="button"
              className="rounded-sm p-2 text-white/60 transition-colors hover:bg-red-950/50 hover:text-white"
              aria-label="Close chat"
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
                placeholder="Type a message…"
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
                Open comms
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
            aria-label={commsOpen ? 'Close comms chat' : 'Open comms chat'}
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