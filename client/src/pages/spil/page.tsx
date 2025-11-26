'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardBody, CardFooter, Button } from '@heroui/react';
import GamePickCard from '../../components/GamePickCard';

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
  const [minSelections] = useState(5);
  const [maxSelections] = useState(8);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const currentPrice = useMemo(() => {
    if (selectedNumbers.length >= minSelections && selectedNumbers.length <= maxSelections) {
      return PRICING[selectedNumbers.length as keyof typeof PRICING];
    }
    return null;
  }, [selectedNumbers.length, minSelections, maxSelections]);

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 dark:from-background dark:via-background dark:to-secondary/30 flex flex-col items-center justify-center p-4 md:p-6 transition-colors duration-300">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-black text-primary dark:text-primary mb-2"
            animate={{
              textShadow: [
                '0px 0px 0px rgba(220, 38, 38, 0)',
                '0px 0px 20px rgba(220, 38, 38, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
          >
            Dead Pigeons
          </motion.h1>
          <p className="text-muted-foreground text-lg font-medium">
            Pick your winning sequence for Jerne IF
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border border-primary/30 shadow-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm">
            <CardHeader className="border-b border-primary/10 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary dark:text-primary mb-1">Week 48</p>
                  <p className="text-sm text-muted-foreground">
                    Select {minSelections}-{maxSelections} numbers from 1-16
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  className="text-5xl"
                >
                  🕊
                </motion.div>
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {selectedNumbers.length} / {maxSelections} selected
                    </span>
                    {currentPrice && (
                      <motion.span
                        key={selectedNumbers.length}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-sm font-bold text-primary dark:text-primary"
                      >
                        {currentPrice} DKK
                      </motion.span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <motion.div
                      className="relative h-4 bg-secondary/40 dark:bg-secondary/50 rounded-lg overflow-hidden border border-primary/20 dark:border-primary/30 shadow-inner"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary via-accent to-primary dark:from-primary dark:via-accent dark:to-primary rounded-lg shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedNumbers.length > 0 && (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-wrap gap-2 p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 dark:from-secondary/50 dark:to-secondary/30 rounded-lg border border-primary/20 dark:border-primary/30 shadow-md"
                    >
                      {selectedNumbers.map((num) => (
                        <motion.span
                          key={num}
                          layout
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.15 }}
                          className="px-4 py-2 bg-linear-to-br from-primary to-red-400 dark:from-primary dark:to-red-400 text-primary-foreground rounded-full text-sm font-bold shadow-md"
                        >
                          {num}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardBody>

            <CardFooter className="border-t border-primary/10 pt-6 flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-red-400 dark:from-primary dark:to-red-400 hover:from-primary/90 hover:to-red-400/90 text-primary-foreground dark:text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <AnimatePresence mode="wait">
                    {submitSuccess ? (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        ✓ Board Purchased!
                      </motion.span>
                    ) : isSubmitting ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                          }}
                        >
                          ⚙️
                        </motion.span>
                        Processing...
                      </motion.span>
                    ) : (
                      <motion.span key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Purchase Board
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-secondary/20 dark:hover:bg-secondary/30 transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-primary accent-primary dark:accent-primary"
                />
                <span className="text-sm text-muted-foreground">Auto-subscribe weekly</span>
              </label>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          <p>Support Jerne IF • 70% to prize pool, 30% to the club</p>
        </motion.div>
      </div>
    </div>
  );
}
