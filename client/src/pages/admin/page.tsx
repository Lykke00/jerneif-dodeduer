'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameTab from '../../components/admin/GameTab';
import UsersTab from '../../components/admin/UsersTab';
import PaymentsTab from '../../components/admin/PaymentsTab';

const menuItems = [
  { id: 'game', label: 'Spil', icon: '🎮' },
  { id: 'users', label: 'Brugere', icon: '👥' },
  { id: 'payments', label: 'Indbetalninger', icon: '💳' },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('game');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'game':
        return <GameTab />;
      case 'users':
        return <UsersTab />;
      case 'payments':
        return <PaymentsTab />;
      default:
        return <GameTab />;
    }
  };

  const handleMobileMenuClick = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-60 bg-secondary/20 border-r border-secondary/40 p-6 sticky top-0 overflow-y-auto"
        >
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">Admin</h2>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  x: activeSection === item.id ? 4 : 0,
                }}
                transition={{ duration: 0.1 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                  activeSection === item.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </motion.aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            <div className="max-w-6xl">{renderContent()}</div>
          </motion.div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <div className="bg-secondary/20 border-b border-secondary/40 p-4 flex items-center justify-between sticky top-0 z-50">
          <div>
            <h2 className="text-xl font-bold text-foreground">Admin</h2>
          </div>
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-secondary/30 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12M6 12l12-12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-secondary/20 border-b border-secondary/40 p-4 space-y-2"
            >
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleMobileMenuClick(item.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                    activeSection === item.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4"
          >
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                  {menuItems.find((m) => m.id === activeSection)?.label}
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {activeSection === 'game' && 'Manage the current game and view winners'}
                  {activeSection === 'users' && 'View and manage all registered users'}
                  {activeSection === 'payments' && 'Process and track user payments'}
                </p>
              </div>

              {renderContent()}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
