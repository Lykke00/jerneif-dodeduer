import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, CardHeader, Image } from '@heroui/react';
import type { GetDepositsResponse } from '../../generated-ts-client';
import type { Variants } from 'framer-motion';
import { ImagePreviewModal } from '../images/ImagePreview';

interface Props {
  submissions: GetDepositsResponse[];
  totalCount: number;
}

function normalizeStatus(status: string): 'pending' | 'approved' | 'declined' {
  const normalized = status.toLowerCase();
  if (normalized === 'approved') return 'approved';
  if (normalized === 'declined') return 'declined';
  return 'pending';
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
      staggerChildren: 0.0,
      delayChildren: 0,
    },
  },
  exit: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0,
      ease: 'easeIn',
    },
  },
};

export default function DepositHistory({ submissions, totalCount }: Props) {
  if (!submissions.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <p className="text-muted-foreground">Ingen indbetalninger endnu!</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="border border-primary/20 shadow-lg bg-card/70 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 flex flex-col gap-1">
          <div className="text-lg md:text-xl font-bold text-foreground">Deposit History</div>
          <p className="text-xs md:text-sm text-muted-foreground">
            {totalCount} Indbetalning{totalCount !== 1 ? 'er' : ''}
          </p>
        </CardHeader>

        <CardBody className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${submissions[0]?.id}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-3"
            >
              {submissions.map((submission) => {
                const status = normalizeStatus(submission.status);
                const cfg = STATUS_CONFIG[status];
                const date = new Date(submission.createdAt);
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();

                const dateDisplay = isToday
                  ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <motion.div
                    key={submission.id}
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
                    {submission.paymentPictureUrl && (
                      <div className="shrink-0 hidden sm:block">
                        <ImagePreviewModal src={submission.paymentPictureUrl} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-base md:text-lg font-semibold text-foreground">
                        {submission.amount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'DKK',
                          minimumFractionDigits: 0,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{dateDisplay}</div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                      <StatusBadge status={status} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </CardBody>
      </Card>
    </motion.div>
  );
}
