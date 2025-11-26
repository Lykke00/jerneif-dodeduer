import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  NumberInput,
  Checkbox,
} from '@heroui/react';
import GamePickCard from '../../components/GamePickCard';
import { BiMinus, BiPlus } from 'react-icons/bi';
import { FaXmark } from 'react-icons/fa6';

const PRICING = {
  5: 20,
  6: 40,
  7: 80,
  8: 160,
};

export default function DeadPigeonsGame() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const minSelections = 5;
  const maxSelections = 8;
  const [quantity, setQuantity] = useState(1);
  const MIN = 1;
  const MAX = 20;

  const increment = () => {
    setQuantity((q) => Math.min(q + 1, MAX));
  };

  const decrement = () => {
    setQuantity((q) => Math.max(q - 1, MIN));
  };

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitSuccess(true);
    setTimeout(() => {
      setSelectedNumbers([]);
      setSubmitSuccess(false);
      setIsSubmitting(false);
    }, 2000);
  };

  const canSubmit =
    selectedNumbers.length >= minSelections && selectedNumbers.length <= maxSelections;
  const progress = (selectedNumbers.length / maxSelections) * 100;

  return (
    <div className="h-full bg-linear-to-b pt-2 from-background via-background to-secondary/20 dark:from-background dark:via-background dark:to-secondary/30 flex flex-col items-center justify-start transition-colors duration-300">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 text-center"
        >
          <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
            Døde Duer
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border border-primary/30 shadow-lg backdrop-blur-sm bg-card/80 dark:bg-card/60">
            <CardHeader className="border-b border-primary/10 pb-4">
              <div className="flex w-full text-center flex-col items-center justify-center">
                <div>
                  <p className="text-3xl font-bold text-foreground-800 mb-1">Uge 48</p>
                  <p className="text-sm text-foreground-700">
                    Vælg {minSelections}-{maxSelections} numre fra 1-16
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-6">
              <div className="grid grid-cols-4 gap-3 mb-8">
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

              <div className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {selectedNumbers.length} / {maxSelections} valgt
                    </span>
                  </div>
                  <div className="space-y-1">
                    <motion.div
                      className="relative h-4 bg-secondary/40 dark:bg-secondary/50 rounded-lg overflow-hidden border border-primary/20 dark:border-primary/30 shadow-inner"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-linear-to-r from-primary via-accent to-primary dark:from-primary dark:via-accent dark:to-primary rounded-lg shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      />

                      <motion.div
                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    </motion.div>
                  </div>
                </div>

                {currentPrice && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between pt-2 pb-2 pl-4 pr-4 rounded-lg border border-primary/20 dark:border-primary/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">Antal</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          isIconOnly
                          variant="ghost"
                          className="border border-foreground-200 shadow-sm"
                          onPress={decrement}
                          isDisabled={quantity <= MIN}
                        >
                          <BiMinus className="w-4 h-4" />
                        </Button>
                        <NumberInput
                          hideStepper
                          type="number"
                          min={MIN}
                          max={MAX}
                          size="sm"
                          radius="sm"
                          value={quantity}
                          onValueChange={setQuantity}
                          className="w-20 text-sm"
                          classNames={{
                            inputWrapper:
                              'border border-foreground-200 rounded-md h-8 flex items-center justify-center',
                            input: 'text-center font-semibold',
                          }}
                        />
                        <Button
                          size="sm"
                          isIconOnly
                          variant="ghost"
                          className="border border-foreground-200 shadow-sm"
                          onPress={increment}
                          isDisabled={quantity >= MAX}
                        >
                          <BiPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right flex flex-col">
                      <motion.div
                        key={totalPrice}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-bold text-primary text-base"
                      >
                        {totalPrice} DKK
                      </motion.div>

                      <span className="text-xs text-foreground/60">{currentPrice} DKK / bræt</span>
                    </div>
                  </motion.div>
                )}

                <AnimatePresence>
                  {selectedNumbers.length > 0 && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-wrap gap-2 p-4 bg-linear-to-br from-secondary/40 to-secondary/20 dark:from-secondary/50 dark:to-secondary/30 rounded-lg border border-primary/20 dark:border-primary/30 shadow-md"
                    >
                      {selectedNumbers.map((num) => (
                        <motion.div
                          key={num}
                          layout
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => toggleNumber(num)}
                          className="relative h-9 w-9 cursor-pointer group"
                        >
                          <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-primary to-red-400 dark:from-primary dark:to-red-400 text-primary-foreground rounded-full text-sm font-bold shadow-md">
                            {num}
                          </div>

                          <div
                            className="absolute inset-0 rounded-full flex items-center justify-center 
                          bg-black/60 text-white font-bold opacity-0 
                          group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <FaXmark />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardBody>

            <CardFooter className="border-t border-primary/10 pt-2 flex flex-col">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={!canSubmit || isSubmitting}
                  className="w-full h-12 text-lg font-bold bg-linear-to-r from-primary to-red-400 dark:from-primary dark:to-red-400 hover:from-primary/90 hover:to-red-400/90 text-primary-foreground dark:text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <motion.span key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Køb {quantity > 1 && quantity} bræt
                  </motion.span>
                </Button>
              </motion.div>

              <Checkbox
                className="p-6"
                radius="sm"
                classNames={{
                  wrapper: 'ring-0 focus:ring-0 data-[focus-visible=true]:outline-none',
                  label: 'text-sm text-foreground',
                }}
              >
                Auto-køb ugentligt
              </Checkbox>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
