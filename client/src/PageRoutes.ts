import type DepositPage from './pages/indbetal/page';

export const PageRoutes = {
  NotFound: '*',
  Forbidden: '/forbidden',
  Home: '/',
  Login: '/login',
  Verify: '/auth/verify',
  Game: '/spil',
  Deposit: '/indbetal',
  Contact: '/kontakt',
} as const;
