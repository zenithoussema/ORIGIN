'use client';

import { memo, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { getCartItemName, type CartItem as CartItemType } from '@/lib/cart-utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { formatPrice } from '@/lib/utils';

const itemVariants = {
  initial: { opacity: 0, x: 30, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.2 } },
};

interface CartItemProps {
  item: CartItemType;
  isHighlighted?: boolean;
}

export const CartItem = memo(function CartItem({ item, isHighlighted }: CartItemProps) {
  const { removeItem, incrementItem, decrementItem } = useCartStore();
  const { locale } = useLanguage();
  const name = getCartItemName(item, locale);

  const handleIncrement = useCallback(() => incrementItem(item.id), [incrementItem, item.id]);
  const handleDecrement = useCallback(() => decrementItem(item.id), [decrementItem, item.id]);
  const handleRemove = useCallback(() => removeItem(item.id), [removeItem, item.id]);

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex gap-3 rounded-xl border p-3 transition-colors ${
        isHighlighted
          ? 'border-caramel/50 bg-caramel/5'
          : 'border-espresso/10 dark:border-cream/10'
      }`}
    >
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-espresso/5 dark:bg-cream/5">
        <Image
          src={item.image}
          alt={name}
          width={64}
          height={64}
          sizes="64px"
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'absolute inset-0 flex items-center justify-center text-2xl';
              fallback.innerHTML = '☕';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-espresso dark:text-cream truncate">
            {name}
          </h4>
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 text-espresso/30 transition-colors hover:text-red-500 dark:text-cream/30 dark:hover:text-red-400"
            aria-label={`Remove ${name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="text-xs text-espresso/50 dark:text-cream/50">
          {formatPrice(item.price)}
        </p>

        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center rounded-lg border border-espresso/15 dark:border-cream/15">
            <button
              onClick={handleDecrement}
              className="flex h-7 w-7 items-center justify-center text-espresso/60 transition-colors hover:bg-espresso/5 dark:text-cream/60 dark:hover:bg-cream/5"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <motion.span
              key={item.quantity}
              initial={{ scale: 1.3, color: 'var(--color-caramel)' }}
              animate={{ scale: 1, color: 'inherit' }}
              className="w-7 text-center text-xs font-semibold text-espresso dark:text-cream"
            >
              {item.quantity}
            </motion.span>
            <button
              onClick={handleIncrement}
              className="flex h-7 w-7 items-center justify-center text-espresso/60 transition-colors hover:bg-espresso/5 dark:text-cream/60 dark:hover:bg-cream/5"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="text-sm font-semibold text-espresso dark:text-cream">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  );
});
