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
  kitchen: 'rgb(185 28 28)',
  master: 'rgb(217 119 6)',
  great: 'rgb(233 195 73)',
  den: 'rgb(233 195 73)',
};

function panelBorderClass(accent: PinAccent): string {
  if (accent === 'red') return 'border-red-700';
  if (accent === 'amber') return 'border-amber-700';
  return 'border-primary';
}

function panelIconClass(accent: PinAccent): string {
  if (accent === 'red') return 'text-red-700';
  if (accent === 'amber') return 'text-amber-700';
  return 'text-primary';
}

const CuratorsGallery = ({ onNavigate: _onNavigate }: { onNavigate: NavigateFn }) => {
  const [openPin, setOpenPin] = useState<PinId | null>(null);
  const [connector, setConnector] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const sidePanelRef = useRef<HTMLElement | null>(null);
  const pinDotRefs = useRef<Partial<Record<PinId, HTMLDivElement | null>>>({});
  useEffect(() => {
    const link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href =
      'https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Manrope:wght@300;400;600&family=Public+Sans:wght@300;400;600&display=swap';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(link2);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
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
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 overflow-x-hidden dark">
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        .parchment-texture {
          background-color: #f4e4bc;
          background-image: radial-gradient(#dcc99e 1px, transparent 0);
          background-size: 20px 20px;
        }
        .gold-glow { box-shadow: 0 0 15px 2px rgba(233, 195, 73, 0.4); }
        .red-glow  { box-shadow: 0 0 15px 2px rgba(239, 68, 68, 0.5); }
        .amber-glow { box-shadow: 0 0 15px 2px rgba(245, 158, 11, 0.5); }
        .museum-spotlight {
          background: radial-gradient(circle at center, rgba(51,53,57,0.4) 0%, rgba(17,19,23,1) 70%);
        }
        .isometric-view {
          transform: perspective(1000px) rotateX(45deg) rotateZ(-45deg) translateX(-3%);
          transform-origin: center center;
        }
        .blueprint-stage {
          overscroll-behavior: none;
          touch-action: manipulation;
          /* Room for 3D transform — avoids clipping corners (do not use overflow-hidden here) */
          padding-block: clamp(1.5rem, 6vw, 3.5rem);
          padding-inline: clamp(0.5rem, 3vw, 1.5rem);
        }
      `}</style>

      {/* Canvas (nested inside App <main> — avoid duplicate main landmark) */}
      <div className="museum-spotlight relative pb-12 pt-4 sm:pt-6">
        <div
          ref={bridgeRef}
          className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-4 py-10 sm:px-6 lg:py-12 xl:gap-10"
        >
          {/* Left Column: Header, Score Gauge, Exhibit detail (was static alert) */}
          <div className="col-span-12 flex flex-col gap-10 lg:col-span-5 xl:col-span-4">

            <section>
              <h2 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-2">Exhibit 01</h2>
              <h1 className="font-headline text-5xl font-light text-on-surface leading-tight">
                Residence <br />
                <span className="italic text-primary">Master Plan</span>
              </h1>
            </section>

            {/* Risk Score Gauge */}
            <div className="relative w-60 h-60 mx-auto lg:mx-0">
              <div className="absolute inset-0 border-[10px] border-surface-container-high rounded-full" />
              <div className="absolute -inset-2 border border-primary/30 rounded-full" />
              <div className="absolute inset-4 border-2 border-primary rounded-full flex flex-col items-center justify-center bg-surface-container-low shadow-2xl">
                <span className="font-label text-[10px] uppercase tracking-widest text-primary/70 mb-1">Safety Rating</span>
                <div className="font-headline text-6xl font-bold text-primary">84</div>
                <span className="font-serif italic text-on-surface-variant text-sm mt-1">High Security</span>
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  className="text-primary"
                  cx="50%"
                  cy="50%"
                  fill="transparent"
                  r="110"
                  stroke="currentColor"
                  strokeDasharray="691"
                  strokeDashoffset="110"
                  strokeLinecap="square"
                  strokeWidth="10"
                />
              </svg>
            </div>

            {openDetail != null && (
              <aside
                ref={sidePanelRef}
                className={`parchment-texture relative z-30 w-full border-l-4 p-8 pr-12 shadow-2xl ${panelBorderClass(openDetail.accent)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-sm p-1.5 text-surface/70 transition-colors hover:bg-black/10 hover:text-surface"
                  aria-label="Close exhibit detail"
                  onClick={() => setOpenPin(null)}
                >
                  <span className="material-symbols-outlined text-xl leading-none">close</span>
                </button>
                <div className="mb-4 flex items-start gap-2 border-b border-surface/10 pb-2 pr-8">
                  <span className={`material-symbols-outlined mt-0.5 text-lg ${panelIconClass(openDetail.accent)}`}>
                    {openDetail.badgeIcon}
                  </span>
                  <h3 className="font-headline text-xl font-bold italic leading-snug text-surface">{openDetail.title}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-label mb-1 text-[10px] font-bold uppercase tracking-widest text-surface/80">
                      {openDetail.exhibitLabel}
                    </p>
                    {openDetail.reportLabel != null && (
                      <p className="font-label mb-1 text-[9px] uppercase tracking-wider text-surface/60">
                        {openDetail.reportLabel}
                      </p>
                    )}
                    <h4 className="font-serif text-lg font-semibold italic leading-tight text-surface">
                      {openDetail.headline}
                    </h4>
                  </div>
                  <p className="font-body text-xs italic leading-relaxed text-surface/90">{openDetail.body}</p>
                  {openDetail.actionLabel != null && openDetail.actionText != null && (
                    <div
                      className={`border p-3 ${
                        openDetail.accent === 'red'
                          ? 'border-red-700/25 bg-white/30'
                          : openDetail.accent === 'amber'
                            ? 'border-amber-700/25 bg-white/25'
                            : 'border-primary/20 bg-white/20'
                      }`}
                    >
                      <p className="font-label mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-surface">
                        {openDetail.actionLabel}
                      </p>
                      <p className="font-body text-[11px] font-medium italic text-surface">{openDetail.actionText}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-surface/10 pt-3">
                    <span
                      className={`font-label text-[9px] font-bold uppercase tracking-widest ${panelIconClass(openDetail.accent)}`}
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

          {/* Right Column: Isometric blueprint (overflow visible so 3D tilt is not cropped) */}
          <div className="blueprint-stage relative col-span-12 w-full min-w-0 overflow-visible lg:col-span-7 xl:col-span-8">
            <div className="relative mx-auto w-full max-w-xl lg:max-w-2xl">
              <div className="relative aspect-[700/520] w-full overflow-visible rounded-sm">
                <div className="absolute inset-0 isometric-view transition-transform duration-1000 hover:scale-[1.02]">
                  {/* Blueprint base */}
                  <div className="absolute inset-0 rounded-sm border border-primary/10 bg-surface-container-low/10 shadow-2xl backdrop-blur-sm">
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage:
                        'linear-gradient(#e9c349 1px, transparent 1px), linear-gradient(90deg, #e9c349 1px, transparent 1px)',
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
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e9c349" strokeWidth="0.3" opacity="0.25" />
                      </pattern>
                    </defs>

                    <rect width="700" height="520" fill="#111317" rx="4" />
                    <rect width="700" height="520" fill="url(#grid)" rx="4" />

                    {/* Garage */}
                    <polygon points="30,340 160,210 245,295 115,425" fill="#1a1d22" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="122" y="330" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7" transform="rotate(-45,122,330)">10&apos; Clg</text>
                    <text x="122" y="342" textAnchor="middle" fill="#e9c349" fontSize="11" fontFamily="serif" fontWeight="bold" opacity="0.9" transform="rotate(-45,122,342)">Garage</text>
                    <text x="122" y="354" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7" transform="rotate(-45,122,354)">21/7x29/0</text>

                    {/* Master Suite */}
                    <rect x="50" y="60" width="130" height="120" fill="#1a1d22" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="115" y="108" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">Vaulted</text>
                    <text x="115" y="122" textAnchor="middle" fill="#e9c349" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.9">Master Suite</text>
                    <text x="115" y="137" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">14/0x16/0</text>
                    <rect x="56" y="145" width="28" height="28" fill="none" stroke="#e9c349" strokeWidth="0.8" opacity="0.5" />
                    <text x="70" y="163" textAnchor="middle" fill="#e9c349" fontSize="8" fontFamily="serif" opacity="0.6">M.B.</text>
                    <rect x="140" y="145" width="30" height="28" fill="none" stroke="#e9c349" strokeWidth="0.8" opacity="0.5" />
                    <text x="155" y="163" textAnchor="middle" fill="#e9c349" fontSize="8" fontFamily="serif" opacity="0.6">W/I</text>

                    {/* Dining Room */}
                    <rect x="190" y="60" width="120" height="100" fill="#1e2028" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="250" y="100" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">9&apos; Clg</text>
                    <text x="250" y="114" textAnchor="middle" fill="#e9c349" fontSize="11" fontFamily="serif" fontWeight="bold" opacity="0.9">Dining Rm</text>
                    <text x="250" y="128" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">13/0x12/0</text>

                    {/* Outdoor Living */}
                    <rect x="320" y="30" width="150" height="105" fill="#16191e" stroke="#e9c349" strokeWidth="1.2" strokeDasharray="5,3" opacity="0.7" />
                    <text x="395" y="72" textAnchor="middle" fill="#e9c349" fontSize="11" fontFamily="serif" fontWeight="bold" opacity="0.8">Outdoor</text>
                    <text x="395" y="86" textAnchor="middle" fill="#e9c349" fontSize="11" fontFamily="serif" fontWeight="bold" opacity="0.8">Living Rm</text>
                    <text x="395" y="100" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.6">20/0x20/4</text>

                    {/* Bed 2 */}
                    <rect x="490" y="45" width="155" height="110" fill="#1a1d22" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="568" y="86" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">9&apos; CLG</text>
                    <text x="568" y="100" textAnchor="middle" fill="#e9c349" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.9">Bed #2</text>
                    <text x="568" y="114" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">17/0x12/0</text>
                    <rect x="492" y="135" width="32" height="24" fill="none" stroke="#e9c349" strokeWidth="0.7" opacity="0.5" />
                    <text x="508" y="151" textAnchor="middle" fill="#e9c349" fontSize="7" opacity="0.5">W/I</text>
                    <rect x="530" y="135" width="28" height="24" fill="none" stroke="#e9c349" strokeWidth="0.7" opacity="0.5" />
                    <text x="544" y="151" textAnchor="middle" fill="#e9c349" fontSize="7" opacity="0.5">B</text>

                    {/* Bed 3 */}
                    <rect x="490" y="175" width="155" height="110" fill="#1a1d22" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="568" y="212" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">9&apos; Clg</text>
                    <text x="568" y="226" textAnchor="middle" fill="#e9c349" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.9">Bed #3</text>
                    <text x="568" y="240" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">13/2x13/0</text>
                    <rect x="492" y="256" width="32" height="24" fill="none" stroke="#e9c349" strokeWidth="0.7" opacity="0.5" />
                    <text x="508" y="272" textAnchor="middle" fill="#e9c349" fontSize="7" opacity="0.5">W/I</text>
                    <rect x="530" y="256" width="28" height="24" fill="none" stroke="#e9c349" strokeWidth="0.7" opacity="0.5" />
                    <text x="544" y="272" textAnchor="middle" fill="#e9c349" fontSize="7" opacity="0.5">B</text>

                    {/* Great Room */}
                    <rect x="310" y="145" width="175" height="175" fill="#1e2028" stroke="#e9c349" strokeWidth="1.5" opacity="0.9" />
                    <text x="397" y="215" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">10&apos; CLG</text>
                    <text x="397" y="232" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.6">2 Story</text>
                    <text x="397" y="248" textAnchor="middle" fill="#e9c349" fontSize="14" fontFamily="serif" fontWeight="bold" opacity="0.95">Great Rm</text>
                    <text x="397" y="264" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">20/0x20/0</text>

                    {/* Kitchen */}
                    <rect x="190" y="168" width="115" height="100" fill="#1a1d22" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="247" y="222" textAnchor="middle" fill="#e9c349" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.9">Kitchen</text>
                    <rect x="220" y="230" width="55" height="28" fill="none" stroke="#e9c349" strokeWidth="0.7" opacity="0.4" />
                    <circle cx="232" cy="244" r="5" fill="none" stroke="#e9c349" strokeWidth="0.7" opacity="0.4" />
                    <circle cx="248" cy="244" r="5" fill="none" stroke="#e9c349" strokeWidth="0.7" opacity="0.4" />
                    <circle cx="263" cy="244" r="5" fill="none" stroke="#e9c349" strokeWidth="0.7" opacity="0.4" />

                    {/* Utility */}
                    <rect x="190" y="275" width="90" height="70" fill="#1a1d22" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="235" y="315" textAnchor="middle" fill="#e9c349" fontSize="11" fontFamily="serif" fontWeight="bold" opacity="0.9">Utility</text>

                    {/* Foyer */}
                    <rect x="290" y="330" width="110" height="85" fill="#1e2028" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="345" y="362" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.6">2 Story</text>
                    <text x="345" y="377" textAnchor="middle" fill="#e9c349" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.9">Foyer</text>
                    <line x1="300" y1="385" x2="390" y2="385" stroke="#e9c349" strokeWidth="0.5" opacity="0.3" />
                    <line x1="300" y1="394" x2="390" y2="394" stroke="#e9c349" strokeWidth="0.5" opacity="0.3" />
                    <line x1="300" y1="403" x2="390" y2="403" stroke="#e9c349" strokeWidth="0.5" opacity="0.3" />

                    {/* Powder */}
                    <rect x="410" y="330" width="70" height="55" fill="#1a1d22" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="445" y="361" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" fontWeight="bold" opacity="0.8">Powder</text>
                    <ellipse cx="445" cy="373" rx="9" ry="7" fill="none" stroke="#e9c349" strokeWidth="0.6" opacity="0.4" />

                    {/* Den */}
                    <rect x="390" y="395" width="140" height="105" fill="#1a1d22" stroke="#e9c349" strokeWidth="1.2" opacity="0.85" />
                    <text x="460" y="432" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">12&apos; CLG</text>
                    <text x="460" y="448" textAnchor="middle" fill="#e9c349" fontSize="13" fontFamily="serif" fontWeight="bold" opacity="0.9">Den</text>
                    <text x="460" y="463" textAnchor="middle" fill="#e9c349" fontSize="9" fontFamily="serif" opacity="0.7">12/0x11/6</text>

                    {/* Dimension line */}
                    <line x1="190" y1="510" x2="490" y2="510" stroke="#e9c349" strokeWidth="0.8" opacity="0.4" />
                    <line x1="190" y1="505" x2="190" y2="515" stroke="#e9c349" strokeWidth="0.8" opacity="0.4" />
                    <line x1="490" y1="505" x2="490" y2="515" stroke="#e9c349" strokeWidth="0.8" opacity="0.4" />
                    <text x="340" y="508" textAnchor="middle" fill="#e9c349" fontSize="9" opacity="0.5">81/5</text>
                  </svg>

                  {/* Pin hit targets — detail panel + connector line on selection */}
                  <div className="pointer-events-none absolute inset-0 z-20">
                    <div
                      className="pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(247 / 700) * 100}%`, top: `${(200 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'kitchen'}
                      aria-label="Primary Kitchen — open exhibit detail"
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
                        className={`red-glow h-5 w-5 cursor-pointer rounded-full border-2 border-white/20 bg-red-500 animate-pulse transition-shadow ${
                          openPin === 'kitchen' ? 'ring-2 ring-white/90 ring-offset-2 ring-offset-transparent' : ''
                        }`}
                      />
                      <div className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-full border border-white bg-red-700" />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(115 / 700) * 100}%`, top: `${(100 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'master'}
                      aria-label="Master Suite — open exhibit detail"
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
                        className={`amber-glow h-3.5 w-3.5 cursor-pointer rounded-full border border-background bg-amber-500 transition-shadow ${
                          openPin === 'master' ? 'ring-2 ring-amber-200 ring-offset-2 ring-offset-transparent' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(397 / 700) * 100}%`, top: `${(260 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'great'}
                      aria-label="Great Room — open exhibit detail"
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
                        className={`gold-glow h-3 w-3 cursor-pointer rounded-full border border-background bg-primary transition-shadow ${
                          openPin === 'great' ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent' : ''
                        }`}
                      />
                    </div>

                    <div
                      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(460 / 700) * 100}%`, top: `${(450 / 520) * 100}%` }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openPin === 'den'}
                      aria-label="Den — open exhibit detail"
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
                        className={`h-3 w-3 cursor-pointer rounded-full border border-primary/40 bg-primary/80 transition-all hover:bg-primary ${
                          openPin === 'den' ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent' : ''
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
            <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] z-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
            <div className="pointer-events-none absolute left-[-5%] top-[-5%] z-0 h-72 w-72 rounded-full bg-primary/5 blur-[100px]" />
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
                strokeOpacity={0.72}
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
            <span className="bg-surface-container-high text-primary px-6 py-3 font-serif italic text-base border border-primary/20 shadow-2xl block">
              Inquire with the Assistant
            </span>
          </div>
          <button className="w-16 h-16 bg-surface-container-high border-2 border-primary rounded-sm shadow-[0_0_30px_rgba(233,195,73,0.3)] flex items-center justify-center transition-all hover:scale-105 active:scale-95">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                history_edu
              </span>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background" />
            </div>
          </button>
        </div>
      </div>

      {/* Background Vignette */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_250px_rgba(0,0,0,0.9)] z-0" />
    </div>
  );
};

export default CuratorsGallery;