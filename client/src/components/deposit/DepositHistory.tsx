import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, CardHeader, Image } from '@heroui/react';
import type { Deposit } from '../../types/Deposit';

interface Props {
  submissions: Deposit[];
}

const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'declined' }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      label: 'Afventer',
    },
    approved: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-200',
      label: 'Godkendt',
    },
    declined: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-200',
      label: 'Afvist',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className="mr-1.5">
        {status === 'approved' && '✓'}
        {status === 'declined' && '✕'}
        {status === 'pending' && '⏱'}
      </span>
      {config.label}
    </span>
  );
};

export default function DepositHistory({ submissions }: Props) {
  if (!submissions.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Ingen indbetalinger endnu. Opret din første indbetaling!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="border border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 flex flex-col">
          <div className="text-xl font-bold text-foreground">Indbetalingshistorik</div>
          <p className="text-sm text-muted-foreground mt-1">
            {submissions.length} indbetaling{submissions.length !== 1 ? 'er' : ''}
          </p>
        </CardHeader>

        <CardBody className="pt-6">
          <AnimatePresence>
            {submissions.map((submission, idx) => (
              <motion.div
                key={`${submission.id}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 last:mb-0 p-4 flex flex-col sm:flex-row sm:items-center gap-4 border border-primary/10 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                {submission.preview && (
                  <div className="flex-shrink-0">
                    <Image
                      src={submission.preview || '/placeholder.svg'}
                      alt="Kvittering"
                      className="w-20 h-20 rounded-lg object-cover border border-primary/10"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                    <div>
                      <div className="text-sm font-bold text-foreground">ID: {submission.id}</div>
                      <div className="text-sm text-muted-foreground">
                        Beløb: {submission.amount.toLocaleString('da-DK')} DKK
                      </div>
                    </div>
                    <StatusBadge status={submission.status} />
                  </div>
                  {submission.date && (
                    <div className="text-xs text-muted-foreground">
                      {submission.date.toLocaleDateString('da-DK', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardBody>
      </Card>
    </motion.div>
  );
}
