import { Routes, Route } from 'react-router-dom';
import IndexPage from './pages/index/page.tsx';
import { Layout } from './pages/layout.tsx';
import SpilPage from './pages/spil/page.tsx';
import DepositPage from './pages/indbetal/page.tsx';
import ContactPage from './pages/kontakt/page.tsx';
import { AuthVerify } from './pages/auth/page.tsx';
import { PageRoutes } from './PageRoutes.ts';
import { RequireAuth } from './components/auth/RequireAuth.tsx';
import { AccessLevel } from './helpers/authUtils.ts';
import { useAuth } from './hooks/useAuth.ts';
import { AuthContext } from './contexts/AuthContext.tsx';
import AdminPage from './pages/admin/page.tsx';
import { LoadingOverlay } from './components/common/LoadingOverlay.tsx';
import { FadeContainer } from './components/common/FadeContainer.tsx';

function AppRoutes() {
  const auth = useAuth();
  const { isInitializing } = auth;

  if (isInitializing) {
    // vis spinner hvis vi er ved at indlæse jwt og user
    return <LoadingOverlay />;
  }

  return (
    <AuthContext.Provider value={auth}>
      <FadeContainer>
        <Routes>
          <Route element={<Layout />}>
            <Route
              index
              element={<RequireAuth accessLevel={AccessLevel.Anonymous} element={<IndexPage />} />}
            />
            <Route path={PageRoutes.Verify} element={<AuthVerify />} />
            <Route
              path={PageRoutes.Game}
              element={<RequireAuth accessLevel={AccessLevel.Protected} element={<SpilPage />} />}
            />
            <Route
              path={PageRoutes.Deposit}
              element={
                <RequireAuth accessLevel={AccessLevel.Protected} element={<DepositPage />} />
              }
            />
            <Route
              path={PageRoutes.Admin}
              element={<RequireAuth accessLevel={AccessLevel.Admin} element={<AdminPage />} />}
            />
            <Route path={PageRoutes.Contact} element={<ContactPage />} />
          </Route>
        </Routes>
      </FadeContainer>
    </AuthContext.Provider>
  );
}

export default AppRoutes;
