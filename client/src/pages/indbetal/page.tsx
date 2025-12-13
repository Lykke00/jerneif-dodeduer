import { Tabs, Tab } from '@heroui/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageRoutes } from '../../PageRoutes';

export default function DepositLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.endsWith('/indbetal') ? 'form' : 'history';

  return (
    <div className="w-full bg-linear-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Tabs
          selectedKey={selectedKey}
          onSelectionChange={(key) => {
            if (key === 'form') navigate(PageRoutes.Deposit);
            if (key === 'history') navigate(PageRoutes.DepositHistory);
          }}
          classNames={{
            base: 'w-full',
            tabList: 'w-full bg-secondary/30 rounded-lg p-1',
            tab: 'w-full text-base font-semibold py-4',
            cursor: 'bg-primary',
            tabContent: 'group-data-[selected=true]:text-white',
          }}
        >
          <Tab key="form" title="Ny Indbetaling" />
          <Tab key="history" title="Historik" />
        </Tabs>

        <div className="mt-4">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
