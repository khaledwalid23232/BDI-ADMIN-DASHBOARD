import { useState, type FormEvent } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../lib/firebase';
import { useI18n } from '../lib/i18n';
import { ar, en, type MessageKey } from '../lib/dictionary';
import { Button, ErrorNote, Field, LanguageSwitch } from '../components/ui';

function errorKey(e: unknown): MessageKey {
  const code = e instanceof FirebaseError ? e.code : '';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(code)) return 'auth.err.invalid';
  if (code === 'auth/email-already-in-use') return 'auth.err.exists';
  if (code === 'auth/weak-password') return 'auth.err.weak';
  if (code === 'auth/invalid-email' || code === 'auth/missing-email') return 'auth.err.email';
  if (code === 'auth/network-request-failed') return 'auth.err.network';
  return 'auth.err.other';
}

export default function Login() {
  const { t } = useI18n();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'signUp' && password.length < 8) return setError('auth.err.weak');
    setBusy(true);
    try {
      if (mode === 'signIn') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      }
    } catch (err) {
      setError(errorKey(err));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setError(null);
    if (!email.trim()) return setError('auth.err.email');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      setError(errorKey(err));
    }
  }

  return (
    <div className="grid min-h-dvh md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* The product states itself in both languages at once: that is the point of it. */}
      <aside className="flex flex-col justify-between gap-10 bg-teal-dd p-8 text-white md:p-12">
        <p className="font-semibold tracking-tight">{en['brand.name']}</p>
        <div className="space-y-8">
          <p lang="en" dir="ltr" className="max-w-md text-2xl leading-snug font-semibold md:text-3xl">
            {en['brand.line']}
          </p>
          <p
            lang="ar"
            dir="rtl"
            className="max-w-md text-xl leading-relaxed text-white/75 md:text-2xl"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            {ar['brand.line']}
          </p>
        </div>
        <span aria-hidden className="block h-1 w-12 rounded-full bg-amber" />
      </aside>

      <main className="flex flex-col p-6 md:p-12">
        <div className="flex justify-end">
          <LanguageSwitch className="text-teal-dd hover:bg-teal-bg" />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="mb-8 text-2xl font-semibold tracking-tight">
            {mode === 'signIn' ? t('auth.signIn') : t('auth.createAccount')}
          </h1>
          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === 'signUp' && (
              <Field label={t('auth.name')} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            )}
            <Field
              label={t('auth.email')}
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Field
              label={t('auth.password')}
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              hint={mode === 'signUp' ? t('auth.passwordHint') : undefined}
              required
            />
            {error && <ErrorNote>{t(error)}</ErrorNote>}
            {resetSent && <p className="rounded-lg bg-teal-bg px-3 py-2 text-sm text-teal-dd">{t('auth.resetSent')}</p>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? t('auth.working') : mode === 'signIn' ? t('auth.signIn') : t('auth.createAccount')}
            </Button>
          </form>
          <div className="mt-6 flex flex-col items-start gap-3">
            <button
              type="button"
              className="rounded text-sm font-semibold text-teal-dd hover:underline"
              onClick={() => {
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                setError(null);
              }}
            >
              {mode === 'signIn' ? t('auth.toSignUp') : t('auth.toSignIn')}
            </button>
            {mode === 'signIn' && (
              <button type="button" className="rounded text-sm text-muted hover:underline" onClick={reset}>
                {t('auth.forgot')}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
