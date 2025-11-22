import { Routes, Route } from 'react-router-dom';
import { routes } from './routes.ts';

function AppRoutes() {
  return (
    <Routes>
      {routes.map((route) => {
        const Component = route.component;
        return (
          <Route key={route.path} path={route.path} element={<Component {...route.props} />} />
        );
      })}
    </Routes>
  );
}

export default AppRoutes;
