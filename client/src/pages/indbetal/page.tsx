import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab, Tabs } from '@heroui/react';
import type { Deposit } from '../../types/Deposit';
import DepositForm from '../../components/deposit/DepositForm';
import DepositHistory from '../../components/deposit/DepositHistory';

const FAKE_SUBMISSIONS: Deposit[] = [
  {
    id: 'INV-001',
    amount: 500,
    preview: 'https://via.placeholder.com/200x200.png?text=Receipt+1',
    status: 'approved',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'INV-002',
    amount: 250,
    preview: 'https://via.placeholder.com/200x200.png?text=Receipt+2',
    status: 'declined',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'INV-003',
    amount: 1250,
    preview: 'https://via.placeholder.com/200x200.png?text=Receipt+3',
    status: 'pending',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

export default function DepositPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Deposit[]>(FAKE_SUBMISSIONS);

  const handleSubmit = async (entry: Deposit) => {
    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 1000));
    setSubmissions((prev) => [entry, ...prev]);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full py-4 px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Tabs
          aria-label="Deposit options"
          classNames={{
            tabList: 'w-full bg-secondary/30 rounded-lg p-1',
            tab: 'w-full text-base font-semibold py-4 px-4 min-w-[200px] sm:min-w-[275px] md:min-w-[325px]',
            cursor: 'w-full bg-primary ',
            tabContent: 'group-data-[selected=true]:text-white',
          }}
        >
          <Tab key="form" title="Ny Indbetaling">
            <DepositForm onSubmit={handleSubmit} submitting={submitting} />
          </Tab>
          <Tab key="history" title="Historik">
            <DepositHistory submissions={submissions} />
          </Tab>
        </Tabs>
      </motion.div>
    </div>
  );
}
