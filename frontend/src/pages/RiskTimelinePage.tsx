import {
  CloudHail,
  Droplets,
  House,
  MapPinned,
  Shield,
  Tornado,
  Wind,
  Radio,
  Zap,
  AlertTriangle,
  Flame,
  Eye,
  MapPin,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavigateFn } from '../types/navigation';

type TimelineEvent = {
  id: string;
  period: string;
  address: string;
  severity: 'critical' | 'elevated' | 'moderate';
  category: string;
  score: number;
  damage: string;
  detail: string;
  metrics: string[];
  icon: LucideIcon;
};

type AreaEvent = {
  id: string;
  date: string;
  title: string;
  location: string;
  type: 'storm' | 'flood' | 'wind' | 'crime' | 'fire';
  intensity: 'high' | 'medium' | 'low';
};

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'timeline-1',
    period: 'Q1 2026',
    address: '2005 NORTH CLIFFE · Dallas, TX',
    severity: 'critical',
    category: 'Compound Storm Exposure',
    score: 115.0,
    damage: '$10.45M combined losses',
    detail:
      'This parcel leads the current report set, combining repeated hail, flood, and high-wind exposure across the rolling five-year risk window.',
    metrics: ['27 hail events', '12 wind events', '5 flash floods'],
    icon: Tornado,
  },
  {
    id: 'timeline-2',
    period: 'Q4 2025',
    address: '914 FAIR OAKS DR · Dallas, TX',
    severity: 'critical',
    category: 'Tornado and Hail Escalation',
    score: 106.0,
    damage: '$10.32M storm-related damage',
    detail:
      'This property stands out for combining tornado activity with severe hail concentration, making it one of the strongest structural-loss signals in the dataset.',
    metrics: ['24 hail events', '2 tornado events', '5 flash floods'],
    icon: CloudHail,
  },
  {
    id: 'timeline-3',
    period: 'Q2 2025',
    address: '2055 ARAPAHO RD · Garland, TX',
    severity: 'elevated',
    category: 'Flood and Wind Pressure',
    score: 105.5,
    damage: '$1.31M weather losses',
    detail:
      'Flood activity is highest here among the top-risk addresses, with wind and hail stacking into a sustained seasonal pressure profile.',
    metrics: ['6 flash floods', '9 wind events', '24 hail events'],
    icon: Droplets,
  },
  {
    id: 'timeline-4',
    period: 'Q4 2024',
    address: '1707 CAMPBELL TRL · Garland, TX',
    severity: 'elevated',
    category: 'Wind Corridor Stress',
    score: 101.5,
    damage: '$243K severe weather losses',
    detail:
      'The report cluster around this address is driven by wind repetition rather than a single catastrophic event, which makes it a persistent-loss profile.',
    metrics: ['11 wind events', '23 hail events', '6 flash floods'],
    icon: Wind,
  },
  {
    id: 'timeline-5',
    period: 'Q2 2024',
    address: '671 E MUIRFIELD RD · Garland, TX',
    severity: 'elevated',
    category: 'High-Value Single-Family Loss',
    score: 81.0,
    damage: '$10.43M aggregate damage',
    detail:
      'Repeated severe hail and a tornado-linked damage total make this one of the most financially exposed single-family records in the report set.',
    metrics: ['21 hail events', '1 tornado event', '4 extreme hail events'],
    icon: House,
  },
  {
    id: 'timeline-6',
    period: 'Q4 2023',
    address: '5252 RAVINE DR · Dallas, TX',
    severity: 'moderate',
    category: 'Historic Asset Watch',
    score: 46.5,
    damage: '$293K mixed-event exposure',
    detail:
      'This older residential asset shows less storm volume than the top cohort, but its age, flood activity, and recorded property crime make it operationally sensitive.',
    metrics: ['Built 1935', '1 property crime', '4 flash floods'],
    icon: MapPinned,
  },
];

const AREA_EVENTS: AreaEvent[] = [
  {
    id: 'ae-1',
    date: 'APR 10',
    title: 'Severe hail advisory issued',
    location: 'North Dallas corridor',
    type: 'storm',
    intensity: 'high',
  },
  {
    id: 'ae-2',
    date: 'APR 07',
    title: 'Flash flood watch lifted',
    location: 'Garland / Rowlett basin',
    type: 'flood',
    intensity: 'medium',
  },
  {
    id: 'ae-3',
    date: 'APR 03',
    title: 'Sustained 60mph wind event',
    location: 'East Dallas, I-635 belt',
    type: 'wind',
    intensity: 'high',
  },
  {
    id: 'ae-4',
    date: 'MAR 28',
    title: 'Structure fire — 3-alarm response',
    location: 'South Garland residential',
    type: 'fire',
    intensity: 'high',
  },
  {
    id: 'ae-5',
    date: 'MAR 22',
    title: 'Tornado watch — no touchdown confirmed',
    location: 'Dallas County wide',
    type: 'storm',
    intensity: 'medium',
  },
  {
    id: 'ae-6',
    date: 'MAR 15',
    title: 'Elevated property crime cluster',
    location: 'Cliffview / Northcliffe zone',
    type: 'crime',
    intensity: 'medium',
  },
];

function tone(severity: TimelineEvent['severity']) {
  if (severity === 'critical')
    return {
      text: 'text-red-400',
      dot: 'bg-red-500',
      border: 'border-red-700/40',
      bg: 'bg-red-950/20',
      glow: 'shadow-[0_0_12px_rgba(239,68,68,0.12)]',
      badge: 'bg-red-950/60 text-red-400 border-red-700/50',
    };
  if (severity === 'elevated')
    return {
      text: 'text-orange-300',
      dot: 'bg-orange-400',
      border: 'border-orange-700/35',
      bg: 'bg-orange-950/10',
      glow: 'shadow-[0_0_12px_rgba(251,146,60,0.08)]',
      badge: 'bg-orange-950/50 text-orange-300 border-orange-700/40',
    };
  return {
    text: 'text-zinc-300',
    dot: 'bg-zinc-400',
    border: 'border-zinc-700/35',
    bg: 'bg-zinc-900/25',
    glow: '',
    badge: 'bg-zinc-900/60 text-zinc-400 border-zinc-700/40',
  };
}

function areaEventStyle(type: AreaEvent['type'], intensity: AreaEvent['intensity']) {
  const typeMap: Record<AreaEvent['type'], { icon: LucideIcon; color: string; label: string }> = {
    storm: { icon: CloudHail, color: 'text-sky-400', label: 'STORM' },
    flood: { icon: Droplets, color: 'text-blue-400', label: 'FLOOD' },
    wind: { icon: Wind, color: 'text-cyan-300', label: 'WIND' },
    fire: { icon: Flame, color: 'text-orange-400', label: 'FIRE' },
    crime: { icon: Eye, color: 'text-purple-400', label: 'CRIME' },
  };
  const intensityDot: Record<AreaEvent['intensity'], string> = {
    high: 'bg-red-500',
    medium: 'bg-orange-400',
    low: 'bg-zinc-500',
  };
  return { ...typeMap[type], dot: intensityDot[intensity] };
}

const LEGEND_SEVERITY = [
  {
    label: 'Critical',
    dot: 'bg-red-500',
    text: 'text-red-400',
    desc: 'Score ≥ 100 · Compound multi-event loss',
  },
  {
    label: 'Elevated',
    dot: 'bg-orange-400',
    text: 'text-orange-300',
    desc: 'Score 70–99 · Persistent pattern risk',
  },
  {
    label: 'Moderate',
    dot: 'bg-zinc-400',
    text: 'text-zinc-300',
    desc: 'Score < 70 · Watch-list sensitivity',
  },
];

const LEGEND_TYPES = [
  { icon: Tornado, label: 'Tornado / Compound', color: 'text-red-400' },
  { icon: CloudHail, label: 'Hail Escalation', color: 'text-sky-300' },
  { icon: Droplets, label: 'Flood / Water', color: 'text-blue-400' },
  { icon: Wind, label: 'Wind Corridor', color: 'text-cyan-300' },
  { icon: House, label: 'High-Value Single-Family', color: 'text-amber-300' },
  { icon: MapPinned, label: 'Historic Asset', color: 'text-zinc-400' },
];

const RiskTimelinePage = ({ onNavigate }: { onNavigate: NavigateFn }) => (
  <div className="mx-auto max-w-7xl">

    {/* ── Header ── */}
    <section className="relative mb-12 overflow-hidden border border-red-950/40 bg-gradient-to-br from-red-950/20 via-background to-background p-8 md:p-10">
      {/* Corner accent */}
      <div className="absolute right-0 top-0 h-24 w-24 border-b border-l border-red-800/20" />
      <div className="absolute bottom-0 left-0 h-16 w-16 border-r border-t border-red-800/10" />

      {/* Scan-line decorative element */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.008)_3px,rgba(255,255,255,0.008)_4px)] pointer-events-none" />

      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            <p className="font-label text-[10px] uppercase tracking-[0.35em] text-red-400/90">
              Risk reports · Five-year reconstruction
            </p>
          </div>
          <h1 className="mb-4 font-headline text-6xl uppercase tracking-tighter text-on-background md:text-8xl">
            Event <span className="text-red-400">timeline</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-500 md:text-lg">
            Report-first reconstruction of major property risk events from the Dallas dataset.
            Highest compound-loss addresses surface first.
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-2 border border-red-800/30 bg-red-950/30 px-3 py-1.5">
            <Radio size={10} className="animate-pulse text-red-400" />
            <span className="font-label text-[9px] uppercase tracking-widest text-red-400/80">Live feed active</span>
          </div>
          <p className="font-label text-[9px] uppercase tracking-widest text-white/20">Dallas / Garland metro · TX</p>
        </div>
      </div>
    </section>

    {/* ── Stats bar ── */}
    <section className="mb-10 grid grid-cols-2 gap-px sm:grid-cols-4 border border-outline-variant/15 bg-outline-variant/10">
      {[
        { label: 'Tracked entries', value: TIMELINE_EVENTS.length, color: 'text-white', sub: 'in dataset' },
        { label: 'Critical parcels', value: TIMELINE_EVENTS.filter((e) => e.severity === 'critical').length, color: 'text-red-400', sub: 'immediate review' },
        { label: 'Avg risk score', value: 92, color: 'text-primary', sub: 'compound index' },
        { label: 'Data window', value: '5yr', color: 'text-green-400', sub: 'rolling period' },
      ].map((card) => (
        <div key={card.label} className="bg-surface-container-low p-5 flex flex-col justify-between min-h-[88px]">
          <p className={`font-headline text-4xl leading-none ${card.color}`}>{card.value}</p>
          <div>
            <p className="font-label text-[9px] uppercase tracking-widest text-white/20">{card.sub}</p>
            <p className="font-label text-[9px] uppercase tracking-widest text-white/40 mt-0.5">{card.label}</p>
          </div>
        </div>
      ))}
    </section>

    {/* ── Main grid: timeline + sidebar ── */}
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">

      {/* ── Timeline column ── */}
      <div className="relative pl-8">
        {/* Vertical rail */}
        <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-red-700/60 via-red-900/30 via-70% to-transparent" />
        {/* Rail tick marks */}
        {TIMELINE_EVENTS.map((_, i) => (
          <div
            key={i}
            className="absolute left-[10px] h-px w-2 bg-red-800/30"
            style={{ top: `${(i / TIMELINE_EVENTS.length) * 92 + 4}%` }}
          />
        ))}

        <div className="space-y-4">
          {TIMELINE_EVENTS.map((event, idx) => {
            const palette = tone(event.severity);
            const Icon = event.icon;
            return (
              <article
                key={event.id}
                className={`relative border p-5 transition-all duration-200 hover:brightness-110 ${palette.border} ${palette.bg} ${palette.glow}`}
              >
                {/* Timeline node */}
                <div className="absolute -left-[1.62rem] top-6 flex h-6 w-6 items-center justify-center rounded-full border border-red-900/50 bg-background">
                  <span className={`h-2.5 w-2.5 rounded-full ${palette.dot} shadow-[0_0_6px_currentColor]`} />
                </div>

                {/* Entry number */}
                <div className="absolute right-4 top-4 font-label text-[9px] text-white/12 tracking-widest">
                  {String(idx + 1).padStart(2, '0')} / {String(TIMELINE_EVENTS.length).padStart(2, '0')}
                </div>

                <div className="flex flex-wrap items-start gap-4">
                  {/* Icon block */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center border ${palette.border} bg-background/60`}>
                    <Icon size={18} className={palette.text} />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Meta row */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`border px-1.5 py-0.5 font-label text-[8px] uppercase tracking-widest ${palette.badge}`}>
                        {event.severity}
                      </span>
                      <span className={`font-label text-[9px] uppercase tracking-widest ${palette.text}`}>{event.period}</span>
                      <span className="font-label text-[9px] uppercase tracking-widest text-white/20">·</span>
                      <span className="font-label text-[9px] uppercase tracking-widest text-white/35">{event.category}</span>
                      <span className="ml-auto font-mono text-[10px] text-white/25">
                        <span className="text-white/15">SCORE </span>{event.score}
                      </span>
                    </div>

                    {/* Address */}
                    <h2 className="font-headline text-xl uppercase tracking-[0.04em] text-white leading-tight">
                      {event.address}
                    </h2>

                    {/* Detail */}
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">{event.detail}</p>

                    {/* Metrics + damage row */}
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {event.metrics.map((metric) => (
                          <span
                            key={metric}
                            className="border border-outline-variant/20 bg-surface-container-lowest px-2 py-0.5 font-label text-[8px] uppercase tracking-widest text-white/40"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                      <div className="shrink-0 border border-outline-variant/20 bg-background/60 px-3 py-1.5 text-right">
                        <p className="font-label text-[7px] uppercase tracking-widest text-white/20">Est. damage</p>
                        <p className="font-headline text-sm leading-tight text-white">{event.damage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Timeline end cap */}
        <div className="mt-4 ml-[-0.5px] flex items-center gap-3 pl-4">
          <div className="h-px flex-1 bg-gradient-to-r from-red-900/30 to-transparent" />
          <span className="font-label text-[8px] uppercase tracking-widest text-white/15">end of reconstruction window</span>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className="space-y-5">

        {/* ── Legend / Key ── */}
        <div className="border border-outline-variant/25 bg-surface-container-high">
          <div className="border-b border-outline-variant/20 px-5 py-3 flex items-center gap-2">
            <Activity size={13} className="text-primary/70" />
            <p className="font-label text-[9px] uppercase tracking-widest text-primary/80">Legend · Key</p>
          </div>

          <div className="p-5 space-y-5">
            {/* Severity levels */}
            <div>
              <p className="mb-3 font-label text-[8px] uppercase tracking-widest text-white/25">Severity Levels</p>
              <div className="space-y-2.5">
                {LEGEND_SEVERITY.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
                    <div>
                      <p className={`font-label text-[9px] uppercase tracking-widest ${item.text}`}>{item.label}</p>
                      <p className="font-label text-[8px] text-white/25 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-outline-variant/15" />

            {/* Event type icons */}
            <div>
              <p className="mb-3 font-label text-[8px] uppercase tracking-widest text-white/25">Event Categories</p>
              <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                {LEGEND_TYPES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2">
                      <Icon size={12} className={item.color} />
                      <span className="font-label text-[8px] uppercase tracking-wider text-white/35 leading-tight">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-outline-variant/15" />

            {/* Risk score scale */}
            <div>
              <p className="mb-3 font-label text-[8px] uppercase tracking-widest text-white/25">Risk Score Scale</p>
              <div className="relative h-3 rounded-none overflow-hidden border border-outline-variant/20">
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/60 via-orange-900/60 to-red-900/80" />
              </div>
              <div className="mt-1.5 flex justify-between">
                <span className="font-label text-[7px] text-green-500/70 uppercase tracking-widest">0 · Low</span>
                <span className="font-label text-[7px] text-orange-400/70 uppercase tracking-widest">70 · Elev.</span>
                <span className="font-label text-[7px] text-red-400/70 uppercase tracking-widest">100+ · Crit.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent area events ── */}
        <div className="border border-outline-variant/25 bg-surface-container-low">
          <div className="border-b border-outline-variant/20 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-red-400/70" />
              <p className="font-label text-[9px] uppercase tracking-widest text-red-400/80">Recent · Area Events</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-label text-[8px] uppercase tracking-widest text-white/20">Last 30 days</span>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/10">
            {AREA_EVENTS.map((ae) => {
              const style = areaEventStyle(ae.type, ae.intensity);
              const Icon = style.icon;
              return (
                <div key={ae.id} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-container/50 transition-colors">
                  <div className="flex flex-col items-center gap-1.5 pt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    <Icon size={10} className={style.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-label text-[9px] uppercase tracking-wider text-white/70 leading-tight">{ae.title}</p>
                      <span className="shrink-0 font-label text-[8px] uppercase tracking-widest text-white/20">{ae.date}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className={`font-label text-[7px] uppercase tracking-widest ${style.color} opacity-70`}>{style.label}</span>
                      <span className="font-label text-[7px] text-white/15">·</span>
                      <span className="font-label text-[7px] uppercase tracking-widest text-white/25 truncate">{ae.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-outline-variant/15 px-5 py-3">
            <p className="font-label text-[8px] uppercase tracking-widest text-white/15 text-center">
              Dallas · Garland metro · All categories
            </p>
          </div>
        </div>

        {/* ── Notes + CTA ── */}
        <div className="border border-outline-variant/20 bg-surface-container-high p-5">
          <div className="mb-4 flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            <p className="font-label text-[9px] uppercase tracking-widest text-primary">Methodology</p>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-zinc-500">
            <p>Entries reconstructed from rolling five-year report metrics, not exact incident timestamps.</p>
            <p>Sequence prioritizes highest compound-storm signatures and reported damage totals.</p>
          </div>
        </div>

        <div className="border border-red-900/30 bg-red-950/10 p-5">
          <div className="mb-1.5 flex items-center gap-2">
            <Zap size={12} className="text-red-400/70" />
            <p className="font-label text-[9px] uppercase tracking-widest text-red-400/70">Next Step</p>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-zinc-500">
            Run a live stress test against any of these addresses or a new property.
          </p>
          <button
            onClick={() => onNavigate('INQUIRY', 'push')}
            className="w-full border border-primary/30 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/5 flex items-center justify-center gap-2"
          >
            <AlertTriangle size={11} />
            Open Simulator
          </button>
        </div>

      </aside>
    </section>
  </div>
);

export default RiskTimelinePage;
