import '@lingcootech/frame-design-tokens/base.css';
import '@lingcootech/frame-design-tokens/public.css';
import '@lingcootech/frame-ui/styles.css';
import '@lingcootech/frame-web/styles.css';
import '@lingcootech/frame-cms/styles.css';

import { ToastProvider } from '@lingcootech/frame-ui/toast';
import { PublicErrorBoundary } from '@lingcootech/frame-web/system-states';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <PublicErrorBoundary>
        <App />
      </PublicErrorBoundary>
    </ToastProvider>
  </StrictMode>,
);
