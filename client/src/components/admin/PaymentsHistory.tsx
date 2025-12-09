import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import type { Variants } from 'framer-motion';

interface Payment {
  id: string;
  amount: number;
  userEmail: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'declined';
  imageUrl?: string;
}

const STATUS_CONFIG = {
  pending: {
    bg: 'bg-yellow-100/15 dark:bg-yellow-900/10',
    border: 'border-yellow-300/25 dark:border-yellow-700/50',
    text: 'text-yellow-800 dark:text-yellow-200',
    label: 'Afventer',
    icon: '⏱',
  },
  approved: {
    bg: 'bg-green-100/30 dark:bg-green-900/10',
    border: 'border-green-300/50 dark:border-green-700/50',
    text: 'text-green-800 dark:text-green-200',
    label: 'Godkendt',
    icon: '✓',
  },
  declined: {
    bg: 'bg-red-100/30 dark:bg-red-900/10',
    border: 'border-red-300/50 dark:border-red-700/50',
    text: 'text-red-800 dark:text-red-200',
    label: 'Afvist',
    icon: '✕',
  },
};

const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'declined' }) => {
  const cfg = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export default function PaymentsHistoryTab() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'PAY-001',
      amount: 500,
      userEmail: 'john@example.com',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending',
      imageUrl: 'https://via.placeholder.com/200x200.png?text=Receipt+1',
    },
    {
      id: 'PAY-002',
      amount: 1000,
      userEmail: 'jane@example.com',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'pending',
      imageUrl: 'https://via.placeholder.com/200x200.png?text=Receipt+2',
    },
    {
      id: 'PAY-003',
      amount: 750,
      userEmail: 'mike@example.com',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'approved',
      imageUrl: 'https://via.placeholder.com/200x200.png?text=Receipt+3',
    },
  ]);

  const processedPayments = payments.filter((p) => p.status !== 'pending');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {processedPayments.length > 0 && (
        <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
          <CardHeader className="border-b border-primary/10">
            <div>
              <div className="text-lg font-bold text-foreground">Indbetalningshistorik</div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {processedPayments.length} behandlet indbetaling
                {processedPayments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3"
              >
                {processedPayments.map((payment) => {
                  const cfg = STATUS_CONFIG[payment.status];
                  return (
                    <motion.div
                      key={payment.id}
                      variants={itemVariants}
                      className={`
                        p-4 md:p-5
                        flex items-center justify-between gap-3
                        rounded-xl transition-all
                        border ${cfg.border}
                        ${cfg.bg}
                        hover:brightness-95 dark:hover:brightness-125
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-base md:text-lg font-semibold text-foreground">
                          {payment.amount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'DKK',
                            minimumFractionDigits: 0,
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {payment.userEmail}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {payment.createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <StatusBadge status={payment.status} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </CardBody>
        </Card>
      )}

      {payments.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <p className="text-muted-foreground">Ingen betalinger endnu!</p>
        </motion.div>
      )}
    </motion.div>
  );
}
