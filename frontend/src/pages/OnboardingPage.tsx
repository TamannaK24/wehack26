import { useState } from 'react';
import { ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { loadUser, saveUser } from '../lib/authStorage';
import {
  PropertyAddressForm,
  DocumentsUploadForm,
  ProtectionQuizForm,
  emptyPropertyAddress,
  emptyDocumentUploads,
  emptyProtectionQuizAnswers,
  buildOnboardingPayload,
  type PropertyAddress,
  type DocumentUploads,
  type ProtectionQuizAnswers,
} from '../components/onboarding';

type Step = 'address' | 'documents' | 'quiz';

type OnboardingPageProps = {
  onComplete: () => void;
};

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<PropertyAddress>(emptyPropertyAddress);
  const [documents, setDocuments] = useState<DocumentUploads>(emptyDocumentUploads);
  const [quiz, setQuiz] = useState<ProtectionQuizAnswers>(() => emptyProtectionQuizAnswers());

  const finish = () => {
    const payload = buildOnboardingPayload(address, documents, quiz);
    // Example — sync to Mongo after you add an API route:
    // await fetch('/api/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    void payload;

    const user = loadUser();
    if (user) {
      saveUser({ ...user, onboardingComplete: true });
    }
    onComplete();
  };

  const stepIndex = step === 'address' ? 0 : step === 'documents' ? 1 : 2;

  return (
    <div className="relative max-w-3xl mx-auto px-4 py-8">
      <div
        className="absolute inset-0 -z-10 rounded-sm opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(127, 29, 29, 0.25) 0%, transparent 50%), linear-gradient(180deg, transparent 0%, #030203 100%)',
        }}
      />

      <header className="mb-10 border-l-2 border-red-800/50 pl-6">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-red-400/90 mb-2">Onboarding</p>
        <h1 className="font-headline text-4xl md:text-5xl uppercase tracking-tight text-white">
          Property <span className="text-red-400">intake</span>
        </h1>
        <p className="mt-3 text-zinc-400 text-sm max-w-xl">
          Confirm the site, file documents, and complete the checklist — you can skip anything for now.
        </p>
        <div className="mt-6 flex gap-2">
          {(['Address', 'Documents', 'Quiz'] as const).map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-2 font-label text-[9px] uppercase tracking-widest px-3 py-1.5 border ${
                i === stepIndex
                  ? 'border-red-500/50 bg-red-950/30 text-red-200'
                  : i < stepIndex
                    ? 'border-red-900/40 text-zinc-500'
                    : 'border-red-950/30 text-zinc-600'
              }`}
            >
              {i < stepIndex ? <CheckCircle2 size={12} className="text-red-400/80" /> : <span className="text-zinc-600">{i + 1}</span>}
              {label}
            </div>
          ))}
        </div>
      </header>

      {step === 'address' && (
        <>
          <PropertyAddressForm value={address} onChange={setAddress} />
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => setStep('documents')}
              className="inline-flex items-center gap-2 border border-red-800/50 bg-red-950/40 px-6 py-3 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-red-100 hover:bg-red-900/50"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}

      {step === 'documents' && (
        <>
          <DocumentsUploadForm value={documents} onChange={setDocuments} />
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep('address')}
              className="inline-flex items-center gap-2 text-zinc-500 font-label text-[10px] uppercase tracking-widest hover:text-red-300"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep('quiz')}
              className="inline-flex items-center gap-2 border border-red-800/50 bg-red-950/40 px-6 py-3 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-red-100 hover:bg-red-900/50"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}

      {step === 'quiz' && (
        <>
          <ProtectionQuizForm value={quiz} onChange={setQuiz} />
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6 pt-4 border-t border-red-950/25">
            <button
              type="button"
              onClick={() => setStep('documents')}
              className="inline-flex items-center gap-2 text-zinc-500 font-label text-[10px] uppercase tracking-widest hover:text-red-300 self-start"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <button
              type="button"
              onClick={finish}
              className="inline-flex items-center justify-center gap-2 border border-red-800/50 bg-red-950/40 px-8 py-3 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-red-100 hover:bg-red-900/50"
            >
              Complete intake
              <CheckCircle2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
