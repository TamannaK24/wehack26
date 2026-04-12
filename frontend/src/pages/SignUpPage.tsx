import { useState, type FormEvent } from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { loadUser, saveUser } from '../lib/authStorage';
import type { StoredUser } from '../lib/authStorage';

type SignUpPageProps = {
  onGoToLogin: () => void;
  onSuccess: (user: StoredUser) => void;
};

export default function SignUpPage({ onGoToLogin, onSuccess }: SignUpPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for the password.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const existing = loadUser();
    if (existing && existing.email.toLowerCase() === email.trim().toLowerCase()) {
      setError('That email already has an account. Sign in instead.');
      return;
    }
    const user: StoredUser = { email: email.trim(), onboardingComplete: false };
    saveUser(user);
    onSuccess(user);
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
      <div
        className="absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(127, 29, 29, 0.35) 0%, transparent 55%), radial-gradient(circle at 100% 80%, rgba(69, 10, 10, 0.4) 0%, transparent 45%), linear-gradient(180deg, #0a0505 0%, #030203 50%, #020102 100%)',
        }}
      />

      <div className="w-full max-w-md border border-red-950/50 bg-[#0c0a0a]/90 shadow-[inset_0_1px_0_rgba(248,113,113,0.08),0_24px_48px_rgba(0,0,0,0.75)] p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center border border-red-900/50 bg-red-950/30">
            <Shield className="text-red-400" size={26} />
          </div>
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.35em] text-red-400/80">Risk Radar</p>
            <h1 className="font-headline text-2xl uppercase tracking-wide text-white">Sign up</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="font-label text-[11px] uppercase tracking-wider text-red-400 border border-red-900/40 bg-red-950/20 px-3 py-2">
              {error}
            </p>
          )}
          <label className="block space-y-2">
            <span className="font-label text-[10px] uppercase tracking-widest text-red-400/90">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-red-950/40 bg-[#030203] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-800/60 focus:outline-none focus:ring-1 focus:ring-red-900/40"
              placeholder="you@domain.com"
            />
          </label>
          <label className="block space-y-2">
            <span className="font-label text-[10px] uppercase tracking-widest text-red-400/90">Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-red-950/40 bg-[#030203] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-800/60 focus:outline-none focus:ring-1 focus:ring-red-900/40"
              placeholder="Min. 8 characters"
            />
          </label>
          <label className="block space-y-2">
            <span className="font-label text-[10px] uppercase tracking-widest text-red-400/90">Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-red-950/40 bg-[#030203] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-800/60 focus:outline-none focus:ring-1 focus:ring-red-900/40"
              placeholder="Repeat password"
            />
          </label>
          <button
            type="submit"
            className="group mt-2 flex w-full items-center justify-center gap-2 border border-red-800/50 bg-red-950/40 py-3.5 font-label text-[11px] font-bold uppercase tracking-[0.25em] text-red-100 transition hover:bg-red-900/50 hover:border-red-600/50"
          >
            Register
            <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
          </button>
        </form>

        <p className="mt-8 text-center font-label text-[10px] uppercase tracking-widest text-zinc-500">
          Already cleared?{' '}
          <button type="button" onClick={onGoToLogin} className="text-red-400 hover:text-red-300 underline-offset-4 hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
