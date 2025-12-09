import type React from 'react';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import DepositImagePreview from './DepositImagePreview';
import { Button, Card, CardBody, CardFooter, CardHeader, Form, Input } from '@heroui/react';
import type { Deposit } from '../../types/Deposit';

interface Props {
  onSubmit: (e: FormEvent<HTMLFormElement>, deposit: Deposit) => void;
  submitting: boolean;
}

export default function DepositForm({ onSubmit, submitting }: Props) {
  const [amount, setAmount] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState({});

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const amountValue = (form.elements.namedItem('amount') as HTMLInputElement)?.value;
    const receiptIdValue = (form.elements.namedItem('receiptId') as HTMLInputElement)?.value;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const fileValue = fileInput?.files?.[0];

    onSubmit(e, {
      id: receiptIdValue,
      amount: Number(amountValue),
      preview,
      file: fileValue,
      status: 'pending',
      date: new Date(),
    });

    form.reset();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="border border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-primary/10 flex flex-col">
          <div className="text-xl font-bold text-foreground">Indbetal Beløb</div>
          <p className="text-sm text-muted-foreground mt-1">
            Upload kvittering og beløb for godkendelse
          </p>
        </CardHeader>

        <Form validationErrors={errors} onSubmit={handleSubmit}>
          <CardBody className="space-y-5 pt-6">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                Beløb (DKK)
              </label>
              <Input
                required
                name="amount"
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
                isRequired={file == null}
                name="receiptId"
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
              <Input
                isRequired={receiptId == null}
                name="file"
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="h-11"
              />
              {preview && <DepositImagePreview preview={preview} />}
            </div>
          </CardBody>

          <CardFooter className="border-t border-primary/10 pt-6">
            <Button
              type="submit"
              isLoading={submitting}
              className="w-full h-11 font-semibold text-base bg-gradient-to-r from-primary to-primary/80 transition-shadow text-white"
            >
              {submitting ? 'Sender...' : 'Afsend Indbetaling'}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </motion.div>
  );
}
