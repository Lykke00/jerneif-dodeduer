import { Routes, Route } from 'react-router-dom';
import IndexPage from './pages/index/page.tsx';
import { Layout } from './pages/layout.tsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<IndexPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
