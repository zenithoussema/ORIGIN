'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { computeTotals, getCartItemName, findCartItem, type CartItem as CartItemType } from '@/lib/cart-utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { formatPrice } from '@/lib/utils';
import { CartItem } from '@/components/cart/CartItem';
import { useIsMounted } from '@/hooks/useIsMounted';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { y: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, clearCart } = useCartStore();
  const { t, locale } = useLanguage();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const hasMounted = useIsMounted();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });
  const prevItemCountRef = useRef(items.length);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (items.length > prevItemCountRef.current) {
      const lastItem = items[items.length - 1];
      if (lastItem) {
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate highlight-on-add pattern
        setHighlightedId(lastItem.id);
        highlightTimerRef.current = setTimeout(() => {
          setHighlightedId(null);
          highlightTimerRef.current = null;
        }, 1500);
      }
    }
    prevItemCountRef.current = items.length;
  }, [items]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const totals = computeTotals(items);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!hasMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {isMobile ? (
            <MobileSheet
              items={items}
              totals={totals}
              highlightedId={highlightedId}
              onClose={handleClose}
              clearCart={clearCart}
              locale={locale}
              t={t}
            />
          ) : (
            <DesktopDrawer
              items={items}
              totals={totals}
              highlightedId={highlightedId}
              onClose={handleClose}
              clearCart={clearCart}
              locale={locale}
              t={t}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

function DesktopDrawer({
  items,
  totals,
  highlightedId,
  onClose,
  clearCart,
  locale,
  t,
}: {
  items: CartItemType[];
  totals: { subtotal: number; itemCount: number; uniqueItems: number };
  highlightedId: string | null;
  onClose: () => void;
  clearCart: () => void;
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      variants={drawerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-espresso"
      role="dialog"
      aria-modal="true"
      aria-label={t('cart.title')}
    >
      <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-4 dark:border-cream/10">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-caramel" />
          <h2 className="text-lg font-semibold text-espresso dark:text-cream">
            {t('cart.title')}
          </h2>
          {totals.itemCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-caramel px-1.5 text-xs font-bold text-espresso">
              {totals.itemCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso/50 transition-colors hover:bg-espresso/5 dark:text-cream/50 dark:hover:bg-cream/5"
          aria-label="Close cart"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <CartContent
        items={items}
        totals={totals}
        highlightedId={highlightedId}
        clearCart={clearCart}
        locale={locale}
        t={t}
        onClose={onClose}
      />
    </motion.div>
  );
}

function MobileSheet({
  items,
  totals,
  highlightedId,
  onClose,
  clearCart,
  locale,
  t,
}: {
  items: CartItemType[];
  totals: { subtotal: number; itemCount: number; uniqueItems: number };
  highlightedId: string | null;
  onClose: () => void;
  clearCart: () => void;
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      variants={sheetVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-x-0 bottom-0 z-[95] flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl dark:bg-espresso"
      role="dialog"
      aria-modal="true"
      aria-label={t('cart.title')}
    >
      <div className="flex items-center justify-between border-b border-espresso/10 px-5 py-4 dark:border-cream/10">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-caramel" />
          <h2 className="text-base font-semibold text-espresso dark:text-cream">
            {t('cart.title')}
          </h2>
          {totals.itemCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel px-1 text-[10px] font-bold text-espresso">
              {totals.itemCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso/5 dark:bg-cream/5 text-espresso/50 dark:text-cream/50"
          aria-label="Close cart"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-espresso/15 dark:bg-cream/15" />
        <CartContent
          items={items}
          totals={totals}
          highlightedId={highlightedId}
          clearCart={clearCart}
          locale={locale}
          t={t}
          onClose={onClose}
        />
      </div>
    </motion.div>
  );
}

function CartContent({
  items,
  totals,
  highlightedId,
  clearCart,
  locale,
  t,
  onClose,
}: {
  items: CartItemType[];
  totals: { subtotal: number; itemCount: number; uniqueItems: number };
  highlightedId: string | null;
  clearCart: () => void;
  locale: string;
  t: (key: string) => string;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleCheckout = useCallback(() => {
    onClose();
    router.push('/checkout');
  }, [onClose, router]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {items.length === 0 ? (
          <EmptyCart locale={locale} t={t} onClose={onClose} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  isHighlighted={item.id === highlightedId}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-espresso/10 p-4 sm:p-6 dark:border-cream/10">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm text-espresso/50 dark:text-cream/50">
              Subtotal ({totals.itemCount} items)
            </span>
            <span className="text-lg font-heading font-bold text-espresso dark:text-cream">
              {formatPrice(totals.subtotal)}
            </span>
          </div>
          <p className="mb-4 text-[10px] text-espresso/30 dark:text-cream/30">
            Tax and delivery calculated at checkout
          </p>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-caramel py-3.5 text-sm font-semibold text-espresso transition-all hover:bg-caramel-400 active:scale-[0.98] shadow-lg shadow-caramel/25"
            onClick={handleCheckout}
          >
            <Sparkles className="h-4 w-4" />
            Continue to Checkout
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={clearCart}
            className="mt-3 w-full text-center text-xs text-espresso/30 transition-colors hover:text-red-500 dark:text-cream/30 dark:hover:text-red-400"
          >
            Clear Cart
          </button>
        </div>
      )}
    </>
  );
}

function EmptyCart({
  locale,
  t,
  onClose,
}: {
  locale: string;
  t: (key: string) => string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-5 rounded-full bg-espresso/5 p-6 dark:bg-cream/5"
      >
        <ShoppingBag className="h-12 w-12 text-espresso/15 dark:text-cream/15" />
      </motion.div>
      <p className="mb-1 text-base font-medium text-espresso dark:text-cream">
        {t('cart.empty')}
      </p>
      <p className="mb-6 text-sm text-espresso/40 dark:text-cream/40">
        Add items to get started
      </p>
      <button
        onClick={onClose}
        className="rounded-lg border border-espresso/15 px-5 py-2 text-sm font-medium text-espresso transition-colors hover:bg-espresso/5 dark:border-cream/15 dark:text-cream dark:hover:bg-cream/5"
      >
        Browse Menu
      </button>
    </div>
  );
}
export default CartDrawer;
