import { motion } from 'framer-motion';
import { Image } from '@heroui/react';

interface Props {
  preview: string;
}

export default function DepositImagePreview({ preview }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4"
    >
      <div className="text-sm font-semibold text-foreground mb-2">Billede Preview</div>
      <Image
        src={preview || '/placeholder.svg'}
        alt="Receipt preview"
        className="w-full max-w-xs h-auto rounded-lg border border-primary/20 shadow-md"
      />
    </motion.div>
  );
}
