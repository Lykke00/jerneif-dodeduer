import { Outlet } from 'react-router-dom';
import Navigation from '../components/navigation/Navigation';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
