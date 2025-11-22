import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import IndexPage from './pages/index/page';
import { HeroUIProvider } from '@heroui/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <IndexPage />
    </HeroUIProvider>
  </StrictMode>
);
