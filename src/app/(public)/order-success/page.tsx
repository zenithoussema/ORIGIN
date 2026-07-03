'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ArrowRight, Package, Receipt, CreditCard, Banknote, Wallet } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const methodIcons: Record<string, typeof CreditCard> = {
  CASH: Banknote,
  CARD: CreditCard,
  WALLET: Wallet,
};

const methodLabels: Record<string, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  WALLET: 'Wallet',
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'ORD-UNKNOWN';
  const total = searchParams.get('total') || '0';
  const estimated = searchParams.get('estimated') || '25-35 min';
  const method = searchParams.get('method') || 'CASH';
  const paymentStatus = searchParams.get('status') || 'UNPAID';
  const orderId = searchParams.get('orderId') || '';

  const MethodIcon = methodIcons[method] || CreditCard;

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md text-center"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-sage/10 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
            >
              <CheckCircle size={48} className="text-sage" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="font-heading text-3xl font-bold text-espresso dark:text-cream mb-2">
            Order Confirmed!
          </h1>
          <p className="text-smoke-300 dark:text-cream/50 mb-8">
            Thank you for your order. We&apos;re preparing it now.
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6 mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package size={20} className="text-caramel" />
            <span className="font-heading font-bold text-xl text-caramel">{orderNumber}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-espresso/5 dark:border-cream/5">
              <div className="flex items-center gap-2 text-sm text-smoke-300 dark:text-cream/50">
                <Clock size={16} />
                Estimated Time
              </div>
              <span className="text-sm font-medium text-espresso dark:text-cream">{estimated}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-espresso/5 dark:border-cream/5">
              <div className="flex items-center gap-2 text-sm text-smoke-300 dark:text-cream/50">
                <MethodIcon size={16} />
                Payment Method
              </div>
              <span className="text-sm font-medium text-espresso dark:text-cream">
                {methodLabels[method] || method}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-smoke-300 dark:text-cream/50">
                <span className="text-lg">💰</span>
                Total
              </div>
              <span className="text-lg font-heading font-bold text-caramel">
                {formatPrice(parseFloat(total))}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6 mb-8"
        >
          <h3 className="text-sm font-medium text-espresso dark:text-cream mb-4">Order Status</h3>
          <div className="flex items-center justify-between">
            {['Confirmed', 'Preparing', 'Ready', 'Delivered'].map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i === 0
                    ? 'bg-caramel text-espresso'
                    : 'bg-espresso/5 dark:bg-cream/5 text-smoke-300 dark:text-cream/30'
                }`}>
                  {i === 0 ? <CheckCircle size={16} /> : <span className="text-xs font-medium">{i + 1}</span>}
                </div>
                <span className={`text-[10px] ${
                  i === 0 ? 'text-caramel font-medium' : 'text-smoke-300 dark:text-cream/30'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          {orderId && (
            <Link
              href={`/receipt/${orderId}?orderNumber=${orderNumber}&total=${total}&method=${method}&status=${paymentStatus}`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-espresso dark:bg-cream py-3.5 text-sm font-semibold text-cream dark:text-espresso transition-all hover:opacity-90 shadow-lg"
            >
              <Receipt size={16} />
              View Receipt
            </Link>
          )}
          <Link
            href={orderId ? `/order/${orderId}` : '/profile'}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-caramel py-3.5 text-sm font-semibold text-espresso transition-all hover:bg-caramel-400 shadow-lg shadow-caramel/25"
          >
            Track Order
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/menu"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-espresso/15 dark:border-cream/15 py-3.5 text-sm font-medium text-espresso dark:text-cream transition-colors hover:bg-espresso/5 dark:hover:bg-cream/5"
          >
            Order More
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
