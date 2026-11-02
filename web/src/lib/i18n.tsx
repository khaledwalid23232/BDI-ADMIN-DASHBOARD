import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Bi, Lang } from '@bdi/shared';
import { ar, en, type MessageKey } from './dictionary';

interface I18n {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  /** Picks the right half of an [English, Arabic] pair. */
  bi: (pair: Bi) => string;
  formatDate: (d: Date) => string;
}

const I18nContext = createContext<I18n | null>(null);
const LANG_KEY = 'bdi:lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'ar') return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language.startsWith('ar') ? 'ar' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang, dir]);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      let s: string = (lang === 'ar' ? ar : en)[key];
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    },
    [lang],
  );

  const value = useMemo<I18n>(
    () => ({
      lang,
      dir,
      setLang: setLangState,
      t,
      bi: (pair) => (lang === 'ar' ? pair[1] : pair[0]),
      formatDate: (d) =>
        new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d),
    }),
    [lang, dir, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
