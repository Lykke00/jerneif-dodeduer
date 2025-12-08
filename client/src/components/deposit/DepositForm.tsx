import type React from 'react';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DepositImagePreview from './DepositImagePreview';
import { Button, Card, CardBody, CardFooter, CardHeader, Input } from '@heroui/react';
import type { Deposit } from '../../types/Deposit';

interface Props {
  onSubmit: (entry: Deposit) => void;
  submitting: boolean;
}

export default function DepositForm({ onSubmit, submitting }: Props) {
  const [amount, setAmount] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    if (!file || !amount || !receiptId) return;

    onSubmit({
      id: receiptId,
      amount: Number(amount),
      preview,
      status: 'pending',
      date: new Date(),
    });

    setAmount('');
    setReceiptId('');
    setFile(null);
    setPreview(null);
  };

  const canSubmit = amount && receiptId && file;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="border border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 flex flex-col">
          <div className="text-xl font-bold text-foreground">Indbetal Beløb</div>
          <p className="text-sm text-muted-foreground mt-1">
            Upload kvittering og beløb for godkendelse
          </p>
        </CardHeader>

        <CardBody className="space-y-5 pt-6">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Beløb (DKK)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Fx 500"
              className="h-11"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Kvittering ID
            </label>
            <Input
              type="text"
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
              placeholder="Fx ABC123"
              className="h-11"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Vedhæft Billede
            </label>
            <Input type="file" accept="image/*" onChange={handleFile} className="h-11" />
            {preview && <DepositImagePreview preview={preview} />}
          </div>
        </CardBody>

        <CardFooter className="border-t border-primary/10 pt-6">
          <Button
            disabled={!canSubmit || submitting}
            isLoading={submitting}
            className="w-full h-11 font-semibold text-base bg-gradient-to-r from-primary to-primary/80 transition-shadow text-white"
            onPress={handleSubmit}
          >
            {submitting ? 'Sender...' : 'Afsend Indbetaling'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
