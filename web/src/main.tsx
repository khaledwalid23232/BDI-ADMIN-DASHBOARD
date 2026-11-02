import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { I18nProvider } from './lib/i18n';
import { SessionProvider } from './lib/session';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </I18nProvider>
  </StrictMode>,
);
