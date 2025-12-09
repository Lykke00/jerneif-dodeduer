import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Tab, Tabs } from '@heroui/react';
import type { Deposit } from '../../types/Deposit';
import DepositForm from '../../components/deposit/DepositForm';
import DepositHistory from '../../components/deposit/DepositHistory';
import { useDeposit } from '../../hooks';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';

const FAKE_SUBMISSIONS: Deposit[] = [
  {
    id: 'INV-001',
    amount: 500,
    preview: 'https://via.placeholder.com/200x200.png?text=Receipt+1',
    file: undefined,
    status: 'approved',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'INV-002',
    amount: 250,
    preview: 'https://via.placeholder.com/200x200.png?text=Receipt+2',
    file: undefined,
    status: 'declined',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'INV-003',
    amount: 1250,
    preview: 'https://via.placeholder.com/200x200.png?text=Receipt+3',
    file: undefined,
    status: 'pending',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

export default function DepositPage() {
  const { deposit, isLoading } = useDeposit();
  const { showModal } = useModal();

  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Deposit[]>(FAKE_SUBMISSIONS);

  const onSubmit = async (e: FormEvent<HTMLFormElement>, d: Deposit) => {
    e.preventDefault();

    try {
      await deposit(d.amount, d.id, d.file);
      showModal({
        variant: 'success',
        title: 'Indbetaling oprettet',
        description: 'Din indbetaling er blevet oprettet og afventer respons fra en administrator!',
      });
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
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
            <DepositForm onSubmit={onSubmit} submitting={submitting} />
          </Tab>
          <Tab key="history" title="Historik">
            <DepositHistory submissions={submissions} />
          </Tab>
        </Tabs>
      </motion.div>
    </div>
  );
}
