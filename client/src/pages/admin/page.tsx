import { useState } from 'react';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { PageRoutes } from '../../PageRoutes';

type MenuButton = {
  id: string;
  label: string;
  type: 'button';
  route: string;
};

type MenuLabel = {
  label: string;
  type: 'label';
  children: MenuButton[];
};

type MenuItem = MenuButton | MenuLabel;

const menuItems: MenuItem[] = [
  {
    id: 'users',
    label: '🙍‍♂️ Brugere',
    type: 'button',
    route: PageRoutes.AdminUsers,
  },
  {
    id: 'deposits',
    label: '💵 Indbetalinger',
    type: 'button',
    route: PageRoutes.AdminDeposits,
  },
  {
    label: '🕹 Spil',
    type: 'label',
    children: [
      {
        id: 'game_current',
        label: 'Nuværende',
        type: 'button',
        route: PageRoutes.AdminGame,
      },
      {
        id: 'game_history',
        label: 'Historik',
        type: 'button',
        route: PageRoutes.AdminGameHistory,
      },
    ],
  },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<string>('users');
  const navigate = useNavigate();

  const handleTabChange = (item: MenuItem) => {
    if (item.type !== 'button') return; // ignore labels

    setActiveSection(item.id);
    navigate(item.route);
  };

  return (
    <div className="w-full bg-linear-to-br from-background via-background to-primary/5">
      {/* DESKTOP */}
      <div className="hidden md:flex h-screen">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-54 bg-card border rounded-xl border-primary/20 border-border shadow-lg pr-4 pl-2 sticky top-0 overflow-y-auto"
        >
          <nav className="space-y-2 mt-4">
            {menuItems.map((item) => {
              // Label + Children group
              if (item.type === 'label') {
                return (
                  <div key={item.label}>
                    <div className="px-2 text-sm mb-2 font-bold text-foreground/80">
                      {item.label}
                    </div>

                    {/* SKUB DEM TIL HØJRE HER */}
                    <div className="pl-3 space-y-1">
                      {item.children?.map((child) => (
                        <motion.button
                          key={child.id}
                          onClick={() => handleTabChange(child)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          animate={{ x: activeSection === child.id ? 4 : 0 }}
                          transition={{ duration: 0.1 }}
                          className={`w-full px-4 py-2 rounded-lg text-left transition-all font-medium border border-transparent ${
                            activeSection === child.id
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'text-foreground/90 hover:text-accent-foreground hover:bg-primary/2 hover:border-primary/20'
                          }`}
                        >
                          {child.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              }

              // Normal top-level button
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabChange(item)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ x: activeSection === item.id ? 4 : 0 }}
                  transition={{ duration: 0.1 }}
                  className={`w-full flex items-start px-4 py-2 rounded-lg transition-all font-medium border border-transparent ${
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground/90 hover:bg-accent hover:text-accent-foreground hover:bg-primary/2 hover:border-primary/20'
                  }`}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </nav>
        </motion.aside>

        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pl-4"
          >
            <div className="max-w-6xl">
              <Outlet />
            </div>
          </motion.div>
        </main>
      </div>

      {/* MOBILE */}
      <div className="md:hidden flex flex-col">
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
