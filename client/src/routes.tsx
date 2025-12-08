import { Routes, Route } from 'react-router-dom';
import IndexPage from './pages/index/page.tsx';
import { Layout } from './pages/layout.tsx';
import SpilPage from './pages/spil/page.tsx';
import DepositPage from './pages/indbetal/page.tsx';
import ContactPage from './pages/kontakt/page.tsx';
import { AuthVerify } from './pages/auth/page.tsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<IndexPage />} />
        <Route path="/auth/verify" element={<AuthVerify />} />
        <Route path="spil" element={<SpilPage />} />
        <Route path="indbetal" element={<DepositPage />} />
        <Route path="kontakt" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
