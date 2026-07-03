'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface CartFeedbackProps {
  show: boolean;
  itemName: string;
  onComplete: () => void;
}

export function CartFeedback({ show, itemName, onComplete }: CartFeedbackProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 1800);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-3 rounded-xl bg-espresso px-5 py-3 shadow-2xl dark:bg-cream"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sage">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-cream dark:text-espresso">
            Added to cart
          </span>
          <span className="max-w-[150px] truncate text-sm text-cream/60 dark:text-espresso/60">
            {itemName}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useCartFeedback() {
  const [show, setShow] = useState(false);
  const [itemName, setItemName] = useState('');

  const trigger = useCallback((name: string) => {
    setItemName(name);
    setShow(true);
  }, []);

  const dismiss = useCallback(() => {
    setShow(false);
    setItemName('');
  }, []);

  return { show, itemName, trigger, dismiss };
}
