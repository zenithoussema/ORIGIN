'use client';

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useIsMounted } from '@/hooks/useIsMounted';

export const CartBadge = memo(function CartBadge({ onClick }: { onClick: () => void }) {
  const mounted = useIsMounted();
  const items = useCartStore((s) => s.items);

  const totalQuantity = useMemo(() => {
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      count += items[i].quantity;
    }
    return count;
  }, [items]);

  return (
    <button
      onClick={onClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg text-espresso transition-colors hover:bg-espresso/5 dark:text-cream dark:hover:bg-cream/5"
      aria-label={`Shopping bag, ${totalQuantity} items`}
    >
      <ShoppingBag size={20} />
      <AnimatePresence>
        {mounted && totalQuantity > 0 && (
          <motion.span
            key={totalQuantity}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel px-1 text-[10px] font-bold text-espresso"
          >
            {totalQuantity > 99 ? '99+' : totalQuantity}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
});
