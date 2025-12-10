import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
} from '@heroui/react';
import type { Variants } from 'framer-motion';
import { useDeposit, type DepositStatus } from '../../hooks';
import type { GetDepositsResponse } from '../../generated-ts-client';
import { useModal } from '../../contexts/ModalContext';
import { errorToMessage } from '../../helpers/errorToMessage';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export default function PaymentsTab() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DepositStatus>('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allDeposits, setAllDeposits] = useState<GetDepositsResponse[]>([]);
  const { showModal } = useModal();

  const pageSize = 5;
  const totalPages = Math.ceil(totalCount / pageSize);

  const { adminGetAll, adminUpdateStatus } = useDeposit();

  useEffect(() => {
    let isActive = true;

    (async () => {
      const res = await adminGetAll(search, status, page, pageSize);
      if (!isActive) return;
      setAllDeposits(res.items);
      setTotalCount(res.totalCount);
    })();

    return () => {
      isActive = false;
    };
  }, [page, search, status]);

  const updateStatus = async (id: string, status: DepositStatus) => {
    try {
      var updated = await adminUpdateStatus(id, status);

      setAllDeposits((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      showModal({
        variant: 'error',
        title: 'En fejl opstod',
        description: errorToMessage(e),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <Card className="border border-yellow-300/30 shadow-lg bg-card/70 backdrop-blur-sm">
        <CardHeader className="border-b border-yellow-300/20">
          <div className="flex items-center gap-2">
            <div>
              <div className="text-lg font-bold text-foreground">Indbetalinger</div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalCount} indbetaling{totalCount !== 1 ? 'er' : ''} ialt
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-4 md:p-6 space-y-4 overflow-visible">
          {/* FILTERS */}
          <div className="flex flex-row justify-between gap-4 w-full">
            <Input
              className="max-w-2xs"
              placeholder="Søg..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <Select
              className="max-w-2/10"
              selectedKeys={new Set([status])}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] ?? '';
                setStatus(value as DepositStatus);
                setPage(1);
              }}
            >
              <SelectItem key="">Alle</SelectItem>
              <SelectItem key="pending">Afventer</SelectItem>
              <SelectItem key="approved">Godkendt</SelectItem>
              <SelectItem key="declined">Afvist</SelectItem>
            </Select>
          </div>

          {/* LIST */}
          <div className="relative">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={`${page}-${status}-${search}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3"
              >
                {allDeposits.map((payment) => {
                  const status = payment.status.toLowerCase();
                  const isPending = status === 'pending';
                  const isApproved = status === 'approved';
                  const isDeclined = status === 'declined';

                  const bgClass = isPending
                    ? 'bg-yellow-100/15 dark:bg-yellow-900/10'
                    : isApproved
                    ? 'bg-green-100/30 dark:bg-green-900/10'
                    : 'bg-red-100/30 dark:bg-red-900/10';

                  const borderClass = isPending
                    ? 'border-yellow-300/25 dark:border-yellow-700/50'
                    : isApproved
                    ? 'border-green-300/50 dark:border-green-700/50'
                    : 'border-red-300/50 dark:border-red-700/50';

                  const statusIcon = isPending ? '⏱' : isApproved ? '✓' : '✕';
                  const statusLabel = isPending ? 'Afventer' : isApproved ? 'Godkendt' : 'Afvist';
                  const statusTextClass = isPending
                    ? 'text-yellow-800 dark:text-yellow-200'
                    : isApproved
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200';

                  return (
                    <motion.div
                      key={payment.id}
                      variants={itemVariants}
                      className={`p-4 md:p-5 relative rounded-xl border ${borderClass} ${bgClass} hover:brightness-95 dark:hover:brightness-125 transition-all`}
                    >
                      {/* Status Badge - Top Right */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgClass} ${statusTextClass}`}
                        >
                          <span>{statusIcon}</span>
                          <span>{statusLabel}</span>
                        </span>
                      </div>

                      {/* Content */}
                      <div className="pr-24">
                        <div className="flex items-center gap-2">
                          <div className="text-base font-semibold">
                            {payment.amount.toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'DKK',
                              minimumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{payment.user?.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(payment.createdAt).toLocaleTimeString('da-DK', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {/* Buttons - Bottom Right */}
                      {isPending && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            onPress={() => updateStatus(payment.id, 'declined')}
                            size="sm"
                            className="bg-red-600 text-white font-semibold"
                          >
                            Afvis
                          </Button>
                          <Button
                            onPress={() => updateStatus(payment.id, 'approved')}
                            size="sm"
                            className="bg-green-600 text-white font-semibold"
                          >
                            Godkend
                          </Button>
                        </div>
                      )}

                      {payment.status == 'declined' && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            onPress={() => updateStatus(payment.id, 'approved')}
                            size="sm"
                            className="bg-green-600 text-white font-semibold"
                          >
                            Godkend
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* PAGINATION */}
          <Pagination showControls page={page} total={totalPages} onChange={setPage} size="md" />
        </CardBody>
      </Card>
    </motion.div>
  );
}
