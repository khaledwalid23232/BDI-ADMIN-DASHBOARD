import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { useI18n } from '../lib/i18n';

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'quiet' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';
  const look =
    variant === 'primary'
      ? 'bg-teal text-white hover:bg-teal-d'
      : 'text-teal-dd hover:bg-teal-bg';
  return <button className={`${base} ${look} ${className}`} {...props} />;
}

export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-subtle focus:border-teal"
        {...props}
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-red-bg px-3 py-2 text-sm text-red">
      {children}
    </p>
  );
}

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      lang={lang === 'ar' ? 'en' : 'ar'}
      className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${className}`}
    >
      {t('nav.language')}
    </button>
  );
}

export function FullPageMessage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-muted" role="status">
      {children}
    </div>
  );
}
