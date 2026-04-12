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
  great: 'rgb(251 113 133)',
  den: 'rgb(220 38 38)',
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

const CuratorsGallery = ({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) => {
  const [openPin, setOpenPin] = useState<PinId | null>(null);
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
    if (openPin == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPin(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openPin]);

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
        .heist-glow-rose { box-shadow: 0 0 16px 3px rgba(251, 113, 133, 0.45); }
        .heist-glow-red  { box-shadow: 0 0 18px 4px rgba(239, 68, 68, 0.55); }
        .heist-glow-orange { box-shadow: 0 0 14px 3px rgba(251, 146, 60, 0.45); }
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
          className="relative z-10 mx-auto grid w-full max-w-[min(100%,1920px)] grid-cols-12 items-start gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:gap-10 lg:px-8 lg:py-10 xl:px-12"
        >
          {/* Left column: hero + row with gauge + intel side‑by‑side (lg+) so both stay visible */}
          <div className="col-span-12 flex min-h-0 flex-col gap-6 sm:gap-8 lg:col-span-6 xl:col-span-5">
            <section className="shrink-0">
              <h2 className="font-label text-[10px] uppercase tracking-[0.35em] text-white/80 mb-2 sm:mb-3">Crew brief · Run 01</h2>
              <h1 className="font-headline text-5xl font-normal uppercase tracking-[0.02em] text-white leading-[0.95] sm:text-6xl lg:text-7xl">
                Target <br />
                <span className="text-red-400">floor plan</span>
              </h1>
            </section>

            <div className="flex min-h-0 flex-col gap-5 lg:flex-row lg:items-start lg:gap-4">
              {/* Risk score — fixed square; do not stretch with aside height or SVG warps to ellipse */}
              <div className="relative z-20 mx-auto aspect-square w-[11.5rem] shrink-0 self-start sm:w-[12.5rem] lg:mx-0 lg:w-[13rem]">
                {/* viewBox scales the arc with the box; r=110 in 240×240 matches strokeDash math */}
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
                  <span className="font-label text-[9px] uppercase tracking-widest text-white/85 mb-0.5 sm:text-[10px]">Heat index</span>
                  <div className="font-headline text-4xl font-normal text-white sm:text-5xl">84</div>
                  <span className="font-body italic text-white/80 text-xs mt-0.5 sm:text-sm">Elevated</span>
                </div>
              </div>

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
                  {/* Blueprint base */}
                  <div className="absolute inset-0 rounded-sm bg-black/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] shadow-2xl shadow-black/60 backdrop-blur-sm">
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
                      backgroundSize: '30px 30px',
                    }}
                  />
                  </div>

                  {/* SVG + pins: same aspect as viewBox — fills stage, no nested scroll */}
                  <div className="relative h-full w-full p-3 sm:p-5">
                    <div className="relative h-full w-full cursor-default" onClick={() => setOpenPin(null)}>
                  <svg
                    viewBox="0 0 700 520"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 block h-full w-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.22" />
                      </pattern>
                    </defs>

                    <rect width="700" height="520" fill="#080808" rx="4" />
                    <rect width="700" height="520" fill="url(#grid)" rx="4" />

                    {/* Garage */}
                    <polygon points="30,340 160,210 245,295 115,425" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="122" y="330" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7" transform="rotate(-45,122,330)">10&apos; Clg</text>
                    <text x="122" y="342" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.9" transform="rotate(-45,122,342)">Garage</text>
                    <text x="122" y="354" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7" transform="rotate(-45,122,354)">21/7x29/0</text>

                    {/* Master Suite */}
                    <rect x="50" y="60" width="130" height="120" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="115" y="108" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">Vaulted</text>
                    <text x="115" y="122" textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.9">Master Suite</text>
                    <text x="115" y="137" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">14/0x16/0</text>
                    <rect x="56" y="145" width="28" height="28" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.5" />
                    <text x="70" y="163" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="Outfit, system-ui, sans-serif" opacity="0.6">M.B.</text>
                    <rect x="140" y="145" width="30" height="28" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.5" />
                    <text x="155" y="163" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="Outfit, system-ui, sans-serif" opacity="0.6">W/I</text>

                    {/* Dining Room */}
                    <rect x="190" y="60" width="120" height="100" fill="#100a0a" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="250" y="100" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">9&apos; Clg</text>
                    <text x="250" y="114" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.9">Dining Rm</text>
                    <text x="250" y="128" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">13/0x12/0</text>

                    {/* Outdoor Living */}
                    <rect x="320" y="30" width="150" height="105" fill="#0a0808" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="5,3" opacity="0.7" />
                    <text x="395" y="72" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.8">Outdoor</text>
                    <text x="395" y="86" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.8">Living Rm</text>
                    <text x="395" y="100" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.6">20/0x20/4</text>

                    {/* Bed 2 */}
                    <rect x="490" y="45" width="155" height="110" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="568" y="86" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">9&apos; CLG</text>
                    <text x="568" y="100" textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.9">Bed #2</text>
                    <text x="568" y="114" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">17/0x12/0</text>
                    <rect x="492" y="135" width="32" height="24" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.5" />
                    <text x="508" y="151" textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="Outfit, system-ui, sans-serif" opacity="0.5">W/I</text>
                    <rect x="530" y="135" width="28" height="24" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.5" />
                    <text x="544" y="151" textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="Outfit, system-ui, sans-serif" opacity="0.5">B</text>

                    {/* Bed 3 */}
                    <rect x="490" y="175" width="155" height="110" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="568" y="212" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">9&apos; Clg</text>
                    <text x="568" y="226" textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.9">Bed #3</text>
                    <text x="568" y="240" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">13/2x13/0</text>
                    <rect x="492" y="256" width="32" height="24" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.5" />
                    <text x="508" y="272" textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="Outfit, system-ui, sans-serif" opacity="0.5">W/I</text>
                    <rect x="530" y="256" width="28" height="24" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.5" />
                    <text x="544" y="272" textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="Outfit, system-ui, sans-serif" opacity="0.5">B</text>

                    {/* Great Room */}
                    <rect x="310" y="145" width="175" height="175" fill="#100a0a" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
                    <text x="397" y="215" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">10&apos; CLG</text>
                    <text x="397" y="232" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.6">2 Story</text>
                    <text x="397" y="248" textAnchor="middle" fill="#ffffff" fontSize="14" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.95">Great Rm</text>
                    <text x="397" y="264" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">20/0x20/0</text>

                    {/* Kitchen */}
                    <rect x="190" y="168" width="115" height="100" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="247" y="222" textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.9">Kitchen</text>
                    <rect x="220" y="230" width="55" height="28" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.4" />
                    <circle cx="232" cy="244" r="5" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.4" />
                    <circle cx="248" cy="244" r="5" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.4" />
                    <circle cx="263" cy="244" r="5" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.4" />

                    {/* Utility */}
                    <rect x="190" y="275" width="90" height="70" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="235" y="315" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.9">Utility</text>

                    {/* Foyer */}
                    <rect x="290" y="330" width="110" height="85" fill="#100a0a" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="345" y="362" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.6">2 Story</text>
                    <text x="345" y="377" textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.9">Foyer</text>
                    <line x1="300" y1="385" x2="390" y2="385" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
                    <line x1="300" y1="394" x2="390" y2="394" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
                    <line x1="300" y1="403" x2="390" y2="403" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />

                    {/* Powder */}
                    <rect x="410" y="330" width="70" height="55" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="445" y="361" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.8">Powder</text>
                    <ellipse cx="445" cy="373" rx="9" ry="7" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.4" />

                    {/* Den */}
                    <rect x="390" y="395" width="140" height="105" fill="#0f0c0c" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
                    <text x="460" y="432" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">12&apos; CLG</text>
                    <text x="460" y="448" textAnchor="middle" fill="#ffffff" fontSize="13" fontFamily="Outfit, system-ui, sans-serif" fontWeight="bold" opacity="0.9">Den</text>
                    <text x="460" y="463" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.7">12/0x11/6</text>

                    {/* Dimension line */}
                    <line x1="190" y1="510" x2="490" y2="510" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
                    <line x1="190" y1="505" x2="190" y2="515" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
                    <line x1="490" y1="505" x2="490" y2="515" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
                    <text x="340" y="508" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="Outfit, system-ui, sans-serif" opacity="0.5">81/5</text>

                    {/* Crisp white frame on top so grid/rooms do not soften the outline */}
                    <rect width="700" height="520" fill="none" stroke="#ffffff" strokeWidth="2.5" rx="4" opacity="0.98" />
                  </svg>

                  {/* Pin hit targets — detail panel + connector line on selection */}
                  <div className="pointer-events-none absolute inset-0 z-20">
                    <div
                      className="pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(247 / 700) * 100}%`, top: `${(200 / 520) * 100}%` }}
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
                        className={`heist-glow-orange h-3.5 w-3.5 cursor-pointer rounded-full border border-black/50 bg-orange-500 transition-shadow ${
                          openPin === 'master' ? 'ring-2 ring-orange-200 ring-offset-2 ring-offset-[#030203]' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(397 / 700) * 100}%`, top: `${(260 / 520) * 100}%` }}
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
                        className={`heist-glow-rose h-3 w-3 cursor-pointer rounded-full border border-black/60 bg-rose-500 transition-shadow ${
                          openPin === 'great' ? 'ring-2 ring-rose-300 ring-offset-2 ring-offset-[#030203]' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(460 / 700) * 100}%`, top: `${(450 / 520) * 100}%` }}
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
                        className={`h-3 w-3 cursor-pointer rounded-full border border-red-500/50 bg-red-700/90 transition-all hover:bg-red-600 ${
                          openPin === 'den' ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-[#030203]' : ''
                        }`}
                      />
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

          {connector != null && openPin != null && (
            <svg
              className="pointer-events-none absolute inset-0 z-[25] h-full w-full overflow-visible"
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
        </div>
      </div>

      {/* Chatbot FAB */}
      <div className="fixed bottom-10 right-10 z-[60] group">
        <div className="relative">
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap translate-y-2 group-hover:translate-y-0 duration-300">
            <span className="bg-[#140808] text-white px-6 py-3 font-label text-sm border border-red-900/60 shadow-2xl shadow-red-950/50 block">
              Open comms
            </span>
          </div>
          <button
            type="button"
            className="w-16 h-16 bg-[#120606] border-2 border-red-700/70 rounded-sm shadow-[0_0_28px_rgba(220,38,38,0.35)] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-red-400 text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                forum
              </span>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#030203]" />
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