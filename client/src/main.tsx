import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { ModalProvider } from './contexts/ModalContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <BrowserRouter>
        <ModalProvider>
          <ToastProvider placement={'top-right'} toastOffset={75} />
          <AppRoutes />
        </ModalProvider>
      </BrowserRouter>
    </HeroUIProvider>
  </StrictMode>
);
