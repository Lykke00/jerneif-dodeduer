'use client';

import { motion } from 'framer-motion';
import { Button } from '@heroui/react';

interface GamePickCardProps {
  number: number;
  isSelected: boolean;
  onToggle: () => void;
}

export default function GamePickCard({ number, isSelected, onToggle }: GamePickCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="h-full">
      <Button
        onClick={onToggle}
        className={`relative w-full h-20 font-bold text-xl transition-all duration-200 overflow-hidden group ${
          isSelected
            ? 'bg-gradient-to-br from-primary to-red-400 text-primary-foreground dark:from-primary dark:to-red-400 dark:text-primary-foreground shadow-lg border-2 border-accent/50 dark:border-accent/40'
            : 'bg-secondary/40 dark:bg-secondary/50 text-foreground dark:text-foreground hover:bg-secondary/60 dark:hover:bg-secondary/70 border border-primary/20 dark:border-primary/30 hover:border-primary/40 dark:hover:border-primary/50'
        }`}
      >
        <motion.div
          className={`absolute inset-0 opacity-0 ${
            isSelected ? 'bg-white/20' : 'bg-primary/10 dark:bg-primary/20'
          }`}
          animate={isSelected ? { opacity: [0.1, 0.3, 0.1] } : { opacity: 0 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />

        <motion.span className="relative z-10 text-2xl font-black" transition={{ duration: 0.4 }}>
          {number}
        </motion.span>

        <motion.div
          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
             bg-accent/80 dark:bg-accent/70 text-primary-foreground"
          initial={false}
          animate={isSelected ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{
            duration: 0.25,
            type: 'spring',
            stiffness: 400,
            damping: 14,
          }}
        >
          ✓
        </motion.div>
      </Button>
    </motion.div>
  );
}
