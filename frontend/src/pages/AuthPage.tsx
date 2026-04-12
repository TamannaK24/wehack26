import { useState } from 'react';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import type { StoredUser } from '../lib/authStorage';

/**
 * Single auth entry: always mounts with **Sign in** first. Sign up is only shown after the user chooses it.
 */
export default function AuthPage({ onSuccess }: { onSuccess: (user: StoredUser) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  if (mode === 'signup') {
    return <SignUpPage onGoToLogin={() => setMode('login')} onSuccess={onSuccess} />;
  }

  return <LoginPage onGoToSignUp={() => setMode('signup')} onSuccess={onSuccess} />;
}
