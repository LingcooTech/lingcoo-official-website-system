import '@lingcootech/frame-design-tokens/base.css';
import '@lingcootech/frame-design-tokens/admin.css';
import '@lingcootech/frame-ui/styles.css';
import '@lingcootech/frame-admin/styles.css';
import '@lingcootech/frame-cms/styles.css';

import { ConfirmProvider } from '@lingcootech/frame-admin/shared';
import { ToastProvider } from '@lingcootech/frame-ui/toast';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>,
);
