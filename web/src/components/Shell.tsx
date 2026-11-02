import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useI18n } from '../lib/i18n';
import { useReadySession } from '../lib/session';
import type { MessageKey } from '../lib/dictionary';
import { LanguageSwitch } from './ui';

const NAV: { to: string | null; key: MessageKey }[] = [
  { to: '/', key: 'nav.pipeline' },
  { to: null, key: 'nav.opportunities' },
  { to: null, key: 'nav.profile' },
];

export default function Shell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { org, user } = useReadySession();

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6 bg-teal-dd px-4 py-5 text-white md:sticky md:top-0 md:h-dvh">
        <div className="px-2">
          <p className="text-sm font-semibold tracking-tight">{t('brand.name')}</p>
          <p className="mt-1 truncate text-sm text-white/65" title={org.name}>
            {org.name}
          </p>
        </div>

        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Main">
          {NAV.map((item) =>
            item.to ? (
              <NavLink
                key={item.key}
                to={item.to}
                end
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'bg-white text-teal-dd' : 'text-white/85 hover:bg-white/10'
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ) : (
              <span
                key={item.key}
                className="cursor-default rounded-lg px-3 py-2 text-sm whitespace-nowrap text-white/45"
                title={t('nav.soon')}
                aria-disabled="true"
              >
                {t(item.key)}
              </span>
            ),
          )}
        </nav>

        <div className="mt-auto hidden flex-col gap-1 border-t border-white/15 pt-4 md:flex">
          <p className="truncate px-2 text-xs text-white/60" dir="ltr">
            {user.email}
          </p>
          <div className="flex items-center justify-between">
            <LanguageSwitch className="text-white/85 hover:bg-white/10" />
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="rounded-md px-2.5 py-1 text-sm text-white/85 transition-colors hover:bg-white/10"
            >
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile: account controls sit above the content. */}
        <div className="flex items-center justify-end gap-2 border-b border-line px-4 py-2 md:hidden">
          <LanguageSwitch className="text-teal-dd hover:bg-teal-bg" />
          <button type="button" onClick={() => signOut(auth)} className="rounded-md px-2.5 py-1 text-sm text-teal-dd">
            {t('auth.signOut')}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
