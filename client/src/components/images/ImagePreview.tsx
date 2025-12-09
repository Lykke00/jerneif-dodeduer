import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@heroui/react';

interface Props {
  src: string;
  alt?: string;
  thumbSize?: number;
}

export function ImagePreviewModal({ src, alt = 'Preview', thumbSize = 64 }: Props) {
  const [open, setOpen] = useState(false);

  // LUK på ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        isBlurred
        width={thumbSize}
        height={thumbSize}
        className="rounded-lg object-cover shadow-sm cursor-pointer hover:opacity-90"
        onClick={() => setOpen(true)}
      />

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            >
              <motion.img
                src={src}
                alt={alt}
                className="max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl"
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.85 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
