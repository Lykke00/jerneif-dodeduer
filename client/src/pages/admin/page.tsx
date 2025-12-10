import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiMenu } from 'react-icons/bi';

import GameTab from '../../components/admin/GameTab';
import UsersTab from '../../components/admin/UsersTab';
import PaymentsTab from '../../components/admin/PaymentsTab';
import PaymentsHistoryTab from '../../components/admin/PaymentsHistory';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { PageRoutes } from '../../PageRoutes';

const GameHistoryTab = () => <div>Game History</div>;
const PaymentsPending = () => <PaymentsTab />;
const PaymentsHistory = () => <PaymentsHistoryTab />;

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (item: MenuItem) => {
    if (item.type !== 'button') return; // ignore labels

    setActiveSection(item.id);
    navigate(item.route);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersTab />;
      case 'game_current':
        return <GameTab />;
      case 'game_history':
        return <GameHistoryTab />;

      case 'payments_pending':
        return <PaymentsPending />;
      case 'payments_history':
        return <PaymentsHistory />;

      default:
        return <UsersTab />;
    }
  };

  const handleMobileMenuClick = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5">
      {/* DESKTOP */}
      <div className="hidden md:flex h-screen">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-54 bg-card border-r border-l border-primary/20 border-border shadow-lg pr-4 pl-2 sticky top-0 overflow-y-auto"
        >
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-card-foreground">Admin</h2>
          </div>

          <nav className="space-y-2">
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

        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-2 pl-4 "
          >
            <div className="max-w-6xl">
              <Outlet />
            </div>
          </motion.div>
        </main>
      </div>

      {/* MOBILE */}
      <div className="md:hidden flex flex-col h-screen">
        <div className="bg-card border-r border-l border-b border-primary/20 shadow-md p-4 flex items-center justify-between sticky top-0 z-50">
          <h2 className="text-xl font-bold text-card-foreground">Admin</h2>

          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-foreground"
          >
            <BiMenu className="w-6 h-6" />
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-primary/20 shadow-lg p-4 space-y-2"
            >
              {menuItems.map((item) => {
                if (item.type === 'label') {
                  return (
                    <div key={item.label}>
                      <div className="px-2 py-1 text-xs uppercase font-bold text-foreground/80">
                        {item.label}
                      </div>

                      <div className="gap-1 flex flex-col">
                        {item.children?.map((child) => (
                          <motion.button
                            key={child.id}
                            onClick={() => handleMobileMenuClick(child.id)}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full px-4 py-2 rounded-lg text-left font-medium ${
                              activeSection === child.id
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'hover:bg-accent text-foreground/90 hover:text-accent-foreground border border-primary/20'
                            }`}
                          >
                            {child.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => item.id && handleMobileMenuClick(item.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-start px-4 py-2 rounded-lg font-semibold ${
                      activeSection === item.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-accent text-foreground/90 hover:text-accent-foreground border border-primary/20'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
