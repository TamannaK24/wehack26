import { ClipboardList } from 'lucide-react';
import type { ProtectionQuizAnswers } from './types';
import { PROTECTION_QUIZ_ITEMS } from './quizItems';

export type ProtectionQuizFormProps = {
  value: ProtectionQuizAnswers;
  onChange: (next: ProtectionQuizAnswers) => void;
};

export function emptyProtectionQuizAnswers(): ProtectionQuizAnswers {
  return PROTECTION_QUIZ_ITEMS.reduce(
    (acc, q) => ({ ...acc, [q.id]: null }),
    {} as ProtectionQuizAnswers,
  );
}

export function ProtectionQuizForm({ value, onChange }: ProtectionQuizFormProps) {
  const setAnswer = (id: string, v: 'yes' | 'no') => {
    onChange({ ...value, [id]: v });
  };

  return (
    <section className="border border-red-950/40 bg-[#0c0a0a]/80 p-8 space-y-6">
      <div className="flex items-center gap-3 text-red-400/90">
        <ClipboardList size={22} />
        <div>
          <h2 className="font-headline text-xl uppercase tracking-wide text-white">Protection / prevention</h2>
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
            Optional for now — answer what you can
          </p>
        </div>
      </div>
      <ul className="space-y-4">
        {PROTECTION_QUIZ_ITEMS.map((item) => (
          <li
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-red-950/25 bg-[#030203]/50 px-4 py-3"
          >
            <span className="text-sm text-zinc-300 pr-4">{item.label}</span>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAnswer(item.id, 'yes')}
                className={`min-w-[4.5rem] px-3 py-2 font-label text-[10px] uppercase tracking-wider border transition ${
                  value[item.id] === 'yes'
                    ? 'border-red-500/60 bg-red-950/40 text-red-100'
                    : 'border-red-950/40 text-zinc-500 hover:border-red-900/50 hover:text-zinc-300'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setAnswer(item.id, 'no')}
                className={`min-w-[4.5rem] px-3 py-2 font-label text-[10px] uppercase tracking-wider border transition ${
                  value[item.id] === 'no'
                    ? 'border-red-500/60 bg-red-950/40 text-red-100'
                    : 'border-red-950/40 text-zinc-500 hover:border-red-900/50 hover:text-zinc-300'
                }`}
              >
                No
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
