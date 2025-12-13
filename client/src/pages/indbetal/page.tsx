import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Pagination, Tab, Tabs } from '@heroui/react';
import type { Deposit } from '../../types/Deposit';
import DepositForm from '../../components/deposit/DepositForm';
import DepositHistory from '../../components/deposit/DepositHistory';
import { useDeposit } from '../../hooks';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';
import type { GetDepositsResponse } from '../../generated-ts-client';

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
  const { deposit, getAll, isLoading } = useDeposit();
  const { showModal } = useModal();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Deposit[]>(FAKE_SUBMISSIONS);

  const [data, setData] = useState<GetDepositsResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<'form' | 'history'>('form');

  useEffect(() => {
    if (tab !== 'history') return;

    getAll(page, pageSize).then((res) => {
      setData(res.items);
      setTotal(res.totalCount);
    });
  }, [page, tab]);

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
    <div className="w-full px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Tabs
          aria-label="Deposit options"
          onSelectionChange={(key) => {
            setTab(key as 'form' | 'history');
          }}
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
            <div className="space-y-6">
              <DepositHistory submissions={data} totalCount={total} />

              {total > 0 && (
                <Pagination
                  total={Math.ceil(total / pageSize)}
                  size="lg"
                  page={page}
                  onChange={setPage}
                  showControls
                  color="primary"
                  className="self-center"
                />
              )}
            </div>
          </Tab>
        </Tabs>
      </motion.div>
    </div>
  );
}
