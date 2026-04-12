import { ClipboardList } from 'lucide-react';
import type { ProtectionQuizAnswers } from './types';
import { PROTECTION_QUIZ_ITEMS } from './quizItems';

const MAX_COUNT = 999_999;

export type ProtectionQuizFormProps = {
  value: ProtectionQuizAnswers;
  onChange: (next: ProtectionQuizAnswers) => void;
};

export function emptyProtectionQuizAnswers(): ProtectionQuizAnswers {
  return PROTECTION_QUIZ_ITEMS.reduce(
    (acc, q) => ({ ...acc, [q.id]: 0 }),
    {} as ProtectionQuizAnswers,
  );
}

/** Parse user input: leading digits only (so "12.3" → 12); blank → 0 */
function parseCountInput(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === '') return 0;
  const leading = trimmed.match(/^(\d+)/);
  if (!leading) return 0;
  const n = parseInt(leading[1], 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(MAX_COUNT, Math.max(0, n));
}

export function ProtectionQuizForm({ value, onChange }: ProtectionQuizFormProps) {
  const setCount = (id: string, next: number) => {
    onChange({ ...value, [id]: next });
  };

  return (
    <section className="border border-red-950/40 bg-[#0c0a0a]/80 p-8 space-y-6">
      <div className="flex items-center gap-3 text-red-400/90">
        <ClipboardList size={22} />
        <div>
          <h2 className="font-headline text-xl uppercase tracking-wide text-white">Protection / prevention</h2>
          <p className="font-label text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
            Optional for now — enter whole numbers (0 = you don&apos;t have that feature)
          </p>
        </div>
      </div>
      <ul className="space-y-4">
        {PROTECTION_QUIZ_ITEMS.map((item) => {
          const count = typeof value[item.id] === 'number' ? value[item.id] : 0;
          const safe = Number.isFinite(count) && count >= 0 ? Math.floor(Math.min(MAX_COUNT, count)) : 0;

          return (
            <li
              key={item.id}
              className="flex flex-col gap-3 border border-red-950/25 bg-[#030203]/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <label
                htmlFor={`quiz-${item.id}`}
                className="pr-2 font-body text-base leading-snug text-zinc-200 sm:max-w-[min(100%,32rem)] sm:text-lg sm:leading-relaxed"
              >
                {item.label}
              </label>
              <input
                id={`quiz-${item.id}`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                name={item.id}
                className="w-full max-w-[8rem] shrink-0 border border-red-950/40 bg-[#0a0808] px-3 py-2.5 font-label text-base tabular-nums text-white outline-none transition focus:border-red-800/60 focus:ring-1 focus:ring-red-900/40 sm:w-[8rem]"
                value={String(safe)}
                onChange={(e) => {
                  setCount(item.id, parseCountInput(e.target.value));
                }}
                onBlur={(e) => {
                  const n = parseCountInput(e.target.value);
                  setCount(item.id, n);
                }}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                    e.preventDefault();
                  }
                }}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
