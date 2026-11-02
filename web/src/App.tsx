import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useSession } from './lib/session';
import { useI18n } from './lib/i18n';
import { FullPageMessage } from './components/ui';
import Shell from './components/Shell';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Pipeline from './pages/Pipeline';

export default function App() {
  const session = useSession();
  const { t } = useI18n();

  if (session.status === 'loading') return <FullPageMessage>{t('common.loading')}</FullPageMessage>;
  if (session.status === 'signedOut') return <Login />;
  if (session.status === 'noOrg') return <Setup user={session.user} />;

  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Pipeline />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
