const USER_KEY = 'nocturne_user';
/** Set after login/sign-up; limits routing to account data in localStorage until user signs in this browser session. */
const SESSION_FLAG = 'nocturne_signed_in';

export type StoredUser = {
  email: string;
  onboardingComplete: boolean;
};

export function loadUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUser;
    if (typeof parsed.email !== 'string') return null;
    return {
      email: parsed.email,
      onboardingComplete: Boolean(parsed.onboardingComplete),
    };
  } catch {
    return null;
  }
}

export function saveUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function hasBrowserSession(): boolean {
  try {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_FLAG) === '1';
  } catch {
    return false;
  }
}

/** Call when login or sign-up succeeds so routing can use saved user / onboarding state. */
export function setBrowserSession(): void {
  try {
    sessionStorage.setItem(SESSION_FLAG, '1');
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearBrowserSession(): void {
  try {
    sessionStorage.removeItem(SESSION_FLAG);
  } catch {
    /* ignore */
  }
}
