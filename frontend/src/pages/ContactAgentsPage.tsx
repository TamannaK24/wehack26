import { useCallback, useState } from 'react';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import type { CoverageKind } from '../types/navigation';

export type ContactAgentsPageProps = {
  riskScore: number;
  topRiskFactor: string;
  coverageType: CoverageKind;
  onBack: () => void;
};

type AgentProfile = {
  coverage: CoverageKind;
  initials: string;
  name: string;
  specialty: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
};

const AGENTS: AgentProfile[] = [
  {
    coverage: 'auto',
    initials: 'AC',
    name: 'Alex Chen',
    specialty: 'Auto, umbrella & multi-vehicle',
    phoneDisplay: '(833) 555-0140',
    phoneTel: '+18335550140',
    email: 'auto.advisors@coverpath-insurance.com',
  },
  {
    coverage: 'home',
    initials: 'JR',
    name: 'Jordan Reeves',
    specialty: 'Homeowners, dwelling & wind',
    phoneDisplay: '(833) 555-0172',
    phoneTel: '+18335550172',
    email: 'home.advisors@coverpath-insurance.com',
  },
  {
    coverage: 'life',
    initials: 'MB',
    name: 'Morgan Blake',
    specialty: 'Term, whole life & estate planning',
    phoneDisplay: '(833) 555-0191',
    phoneTel: '+18335550191',
    email: 'life.advisors@coverpath-insurance.com',
  },
];

function coverageLabel(c: CoverageKind): string {
  if (c === 'auto') return 'Auto';
  if (c === 'life') return 'Life';
  return 'Home';
}

function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center border border-outline-variant/40 bg-surface-container-high font-label text-sm font-semibold tracking-wide text-primary"
      aria-hidden
    >
      {initials}
    </div>
  );
}

const fieldClass =
  'w-full border border-outline-variant/30 bg-background px-4 py-3 font-body text-sm text-on-surface outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20';

export default function ContactAgentsPage({
  riskScore,
  topRiskFactor,
  coverageType,
  onBack,
}: ContactAgentsPageProps) {
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [discussion, setDiscussion] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sent'>('idle');

  const handleRequestCallback = useCallback(() => {
    setSubmitStatus('idle');
    const el = document.getElementById('callback-section');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSubmitCallback = useCallback(() => {
    setSubmitStatus('sent');
  }, []);

  return (
    <div className="relative mx-auto max-w-5xl pb-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 font-label text-[11px] uppercase tracking-widest text-zinc-400 transition hover:border-primary/40 hover:text-primary"
      >
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
        Back to risk dashboard
      </button>

      <p className="mb-3 font-label text-[10px] uppercase tracking-[0.2em] text-primary/80">Next step</p>
      <h1 className="mb-10 font-headline text-4xl uppercase tracking-tight text-white sm:text-5xl">
        Connect with an <span className="text-primary">agent</span>
      </h1>

      {/* Results summary — fades in on mount */}
      <div
        className="animate-contact-summary-fade-in mb-12 border border-outline-variant/25 bg-surface-container-low px-6 py-5 sm:px-8 sm:py-6"
        role="region"
        aria-label="Your results summary"
      >
        <p className="mb-4 font-label text-[10px] uppercase tracking-widest text-zinc-500">Your results summary</p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div>
            <p className="mb-1 font-label text-[10px] uppercase tracking-widest text-zinc-500">Risk score</p>
            <p className="font-headline text-5xl leading-none text-primary">{Math.round(riskScore)}</p>
            <p className="mt-1 font-body text-sm text-zinc-500">out of 100 composite</p>
          </div>
          <div className="min-w-0 flex-1 sm:max-w-md">
            <p className="mb-1 font-label text-[10px] uppercase tracking-widest text-zinc-500">Top risk factor</p>
            <p className="font-body text-base leading-relaxed text-on-surface/90">{topRiskFactor}</p>
          </div>
          <div className="shrink-0">
            <p className="mb-1 font-label text-[10px] uppercase tracking-widest text-zinc-500">Coverage focus</p>
            <p className="font-headline text-2xl uppercase tracking-wide text-white">{coverageLabel(coverageType)}</p>
          </div>
        </div>
      </div>

      <p className="mb-6 font-body text-base leading-relaxed text-zinc-400">
        Choose a specialist below. Same-day callbacks when you request before 3 p.m. ET on business days.
      </p>

      {/* Agent cards */}
      <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5">
        {AGENTS.map((agent) => (
          <div
            key={agent.coverage}
            className="flex flex-col border border-outline-variant/25 bg-surface-container-low p-6 sm:p-7"
          >
            <div className="mb-5 flex items-start gap-4">
              <InitialsAvatar initials={agent.initials} />
              <div className="min-w-0">
                <p className="font-headline text-xl uppercase tracking-wide text-white">{agent.name}</p>
                <p className="mt-1 font-label text-[10px] uppercase tracking-wider text-zinc-500">{agent.specialty}</p>
                <p className="mt-2 inline-block border border-outline-variant/35 bg-surface-container-high px-2 py-0.5 font-label text-[9px] uppercase tracking-widest text-zinc-400">
                  {coverageLabel(agent.coverage)}
                </p>
              </div>
            </div>
            <div className="mb-4 space-y-3 font-body text-sm text-on-surface/90">
              <a
                href={`tel:${agent.phoneTel}`}
                className="flex items-center gap-2 text-primary underline-offset-2 hover:text-primary/90 hover:underline"
              >
                <Phone size={16} className="shrink-0 text-primary/70" strokeWidth={1.5} aria-hidden />
                {agent.phoneDisplay}
              </a>
              <a
                href={`mailto:${agent.email}?subject=Coverage%20question%20%E2%80%94%20${encodeURIComponent(coverageLabel(agent.coverage))}`}
                className="flex min-w-0 items-center gap-2 break-all text-primary underline-offset-2 hover:text-primary/90 hover:underline"
              >
                <Mail size={16} className="shrink-0 text-primary/70" strokeWidth={1.5} aria-hidden />
                {agent.email}
              </a>
            </div>
            <button
              type="button"
              onClick={handleRequestCallback}
              className="mt-auto w-full border border-primary/50 bg-primary/15 py-3 font-label text-[10px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary/25"
            >
              Request callback
            </button>
          </div>
        ))}
      </div>

      {/* Callback block — no <form> */}
      <div
        id="callback-section"
        className="mb-12 border border-outline-variant/25 bg-surface-container-low px-6 py-8 sm:px-10 sm:py-10"
      >
        <h2 className="mb-2 font-headline text-2xl uppercase tracking-wide text-white">
          Request a <span className="text-primary">callback</span>
        </h2>
        <p className="mb-8 font-body text-sm text-zinc-400">
          Tell us how to reach you. An agent will return your call — no automated menus during business hours.
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="cb-name" className="block font-label text-[10px] uppercase tracking-widest text-zinc-500">
              Name
            </label>
            <input
              id="cb-name"
              type="text"
              autoComplete="name"
              value={callbackName}
              onChange={(e) => setCallbackName(e.target.value)}
              className={fieldClass}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cb-phone" className="block font-label text-[10px] uppercase tracking-widest text-zinc-500">
              Phone
            </label>
            <input
              id="cb-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={callbackPhone}
              onChange={(e) => setCallbackPhone(e.target.value)}
              className={fieldClass}
              placeholder="(555) 000-0000"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cb-time" className="block font-label text-[10px] uppercase tracking-widest text-zinc-500">
              Preferred time
            </label>
            <select
              id="cb-time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value as typeof preferredTime)}
              className={`${fieldClass} max-w-xs`}
            >
              <option value="morning">Morning (8 a.m. – noon)</option>
              <option value="afternoon">Afternoon (noon – 5 p.m.)</option>
              <option value="evening">Evening (5 p.m. – 8 p.m.)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="cb-notes" className="block font-label text-[10px] uppercase tracking-widest text-zinc-500">
              What would you like to discuss?
            </label>
            <textarea
              id="cb-notes"
              value={discussion}
              onChange={(e) => setDiscussion(e.target.value)}
              rows={4}
              className={fieldClass}
              placeholder="e.g. Compare quotes for wind coverage, bundle auto + home, or review your risk score line by line."
            />
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmitCallback}
              className="border border-primary/60 bg-primary/20 px-8 py-3.5 font-label text-[10px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary/30"
            >
              Submit callback request
            </button>
          </div>
          {submitStatus === 'sent' ? (
            <p className="font-body text-sm text-zinc-300" role="status">
              Thanks — we&apos;ve logged your request. Expect a call within two business hours at the number you
              provided. (Demo: connect your API here.)
            </p>
          ) : null}
        </div>
      </div>

      <p className="border-t border-outline-variant/25 pt-8 text-center font-body text-sm leading-relaxed text-zinc-500">
        We respond within 2 business hours · Your data is never sold · No obligation
      </p>
    </div>
  );
}
