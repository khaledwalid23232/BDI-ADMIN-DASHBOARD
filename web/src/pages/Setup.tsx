import { useState, type FormEvent } from 'react';
import { signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useI18n } from '../lib/i18n';
import { createOrganization } from '../data/organizations';
import { Button, ErrorNote, Field, LanguageSwitch } from '../components/ui';

export default function Setup({ user }: { user: User }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setFailed(false);
    try {
      await createOrganization(user, name, lang);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col p-6 md:p-12">
      <div className="flex items-center justify-between">
        <p className="font-semibold tracking-tight text-teal-dd">{t('brand.name')}</p>
        <div className="flex items-center gap-2">
          <LanguageSwitch className="text-teal-dd hover:bg-teal-bg" />
          <Button variant="quiet" onClick={() => signOut(auth)}>
            {t('auth.signOut')}
          </Button>
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <h1 className="text-2xl font-semibold tracking-tight">{t('setup.title')}</h1>
        <p className="mt-3 mb-8 text-muted">{t('setup.body')}</p>
        <form onSubmit={submit} className="space-y-4">
          <Field label={t('setup.orgName')} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required autoFocus />
          {failed && <ErrorNote>{t('setup.err')}</ErrorNote>}
          <Button type="submit" disabled={busy || !name.trim()} className="w-full">
            {busy ? t('auth.working') : t('setup.create')}
          </Button>
        </form>
      </main>
    </div>
  );
}
