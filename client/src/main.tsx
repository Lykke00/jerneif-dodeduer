import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { HeroUIProvider } from '@heroui/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HeroUIProvider>
  </StrictMode>
);
