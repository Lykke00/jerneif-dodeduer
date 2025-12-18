import { useMemo, useState } from 'react';
import { Form, Button, NumberInput, Checkbox } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import GamePickCard from '../GamePickCard';
import { BiMinus, BiPlus } from 'react-icons/bi';
import { FaXmark } from 'react-icons/fa6';

const PRICING = {
  5: 20,
  6: 40,
  7: 80,
  8: 160,
};

type GameFormProps = {
  minSelections?: number;
  maxSelections?: number;
  maxAmount?: number;
  isLoading: boolean;
  onSubmit: (data: {
    amount: number;
    numbers: number[];
    autoBuyEnabled: boolean;
    repeatCount: number;
  }) => Promise<boolean>;
};

export default function GameForm({
  minSelections = 5,
  maxSelections = 8,
  maxAmount = 20,
  isLoading,
  onSubmit,
}: GameFormProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);
  const [autoBuyEnabled, setAutoBuyEnabled] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);

  const currentPrice = useMemo(() => {
    if (selectedNumbers.length >= minSelections && selectedNumbers.length <= maxSelections) {
      return PRICING[selectedNumbers.length as keyof typeof PRICING];
    }
    return null;
  }, [selectedNumbers.length, minSelections, maxSelections]);

  const totalPrice = useMemo(() => {
    if (!currentPrice) return null;
    return currentPrice * quantity;
  }, [currentPrice, quantity]);

  const canSubmit =
    selectedNumbers.length >= minSelections && selectedNumbers.length <= maxSelections;

  const progress = (selectedNumbers.length / maxSelections) * 100;

  const toggleNumber = (num: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length < maxSelections) {
        return [...prev, num].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  const increment = () => {
    setQuantity((q) => Math.min(q + 1, maxAmount));
  };

  const decrement = () => {
    setQuantity((q) => Math.max(q - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const ok = await onSubmit({
      amount: quantity,
      numbers: selectedNumbers,
      autoBuyEnabled,
      repeatCount,
    });

    if (ok) {
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setSelectedNumbers([]);
        setQuantity(1);
        setAutoBuyEnabled(false);
      }, 1500);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="w-full h-full p-4">
      {/* NUMMER GRID */}
      <div className="grid grid-cols-4 gap-3 mb-8 w-full h-full">
        <AnimatePresence>
          {Array.from({ length: 16 }, (_, i) => i + 1).map((num, idx) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
            >
              <GamePickCard
                number={num}
                isSelected={selectedNumbers.includes(num)}
                onToggle={() => toggleNumber(num)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PROGRESS */}
      <div className="space-y-2 mb-4 w-full">
        <div className="flex justify-between text-sm font-semibold">
          {selectedNumbers.length} / {maxSelections} valgt
        </div>

        <motion.div className="relative h-4 bg-secondary/40 rounded-lg overflow-hidden border border-primary/20 shadow-inner">
          <motion.div
            className="h-full bg-linear-to-r from-primary via-accent to-primary rounded-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* ANTAL + PRIS */}
      {currentPrice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between p-4 rounded-lg border border-primary/20 w-full"
        >
          <div className="flex items-center gap-3">
            <span className="text-md font-semibold">Antal</span>
            <div className="inline-flex items-center rounded-md border border-foreground-200 bg-background shadow-sm">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={decrement}
                className="rounded-none rounded-l-md h-9 w-9"
                isDisabled={quantity <= 1}
              >
                <BiMinus className="w-4 h-4" />
              </Button>

              <div className="h-9 w-16 flex items-center justify-center border-x border-foreground-200">
                <NumberInput
                  value={quantity}
                  minValue={1}
                  maxValue={maxAmount}
                  hideStepper
                  onValueChange={(value) => {
                    if (value === null) {
                      setQuantity(1); // fallback
                      return;
                    }
                    setQuantity(value);
                  }}
                  className="w-full"
                  classNames={{
                    inputWrapper: 'border-0 rounded-none shadow-none h-full',
                    input: 'text-center font-semibold text-sm',
                  }}
                />
              </div>

              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={increment}
                className="rounded-none rounded-r-md h-9 w-9"
                isDisabled={quantity >= maxAmount}
              >
                <BiPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-right">
            <div className="font-bold text-primary">{totalPrice} DKK</div>
            <div className="text-xs">{currentPrice} DKK / bræt</div>
          </div>
        </motion.div>
      )}

      {/* VALGTE NUMRE */}
      <AnimatePresence>
        {selectedNumbers.length > 0 && (
          <motion.div
            layout
            className="flex flex-wrap w-full gap-2 py-2 px-4 rounded-lg border border-primary/20 mb-2"
          >
            {selectedNumbers.map((num) => (
              <motion.div
                key={num}
                layout
                onClick={() => toggleNumber(num)}
                className="relative h-9 w-9 cursor-pointer group"
              >
                <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-primary to-red-400 text-white rounded-full font-bold">
                  {num}
                </div>
                <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100">
                  <FaXmark />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col justify-center items-center w-full h-full gap-2">
        {/* SUBMIT */}
        <Button
          type="submit"
          isLoading={isLoading}
          isDisabled={!canSubmit}
          className="w-full max-w-xs h-12 flex items-center justify-center  text-lg font-bold bg-linear-to-r from-primary to-red-400 text-white"
        >
          {success ? 'Købt ✓' : `Køb ${quantity > 1 ? quantity : ''} bræt`}
        </Button>
        <Checkbox isSelected={autoBuyEnabled} onValueChange={setAutoBuyEnabled}>
          Auto-køb ugentligt
        </Checkbox>
        <AnimatePresence>
          {autoBuyEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-xs"
            >
              <NumberInput
                label="Gentag i uger"
                minValue={1}
                value={repeatCount}
                onValueChange={(v) => v && setRepeatCount(v)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Form>
  );
}
