import { Outlet } from 'react-router-dom';
import Navigation from '../components/navigation/Navigation';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex justify-center p-4">
        <div className="w-full max-w-5xl px-6 mx-auto wrap-break-word">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
