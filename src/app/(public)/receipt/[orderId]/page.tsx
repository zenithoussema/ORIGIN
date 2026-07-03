'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Receipt,
  CreditCard,
  Banknote,
  Wallet,
  CheckCircle,
  Clock,
  FileText,
  Download,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptData {
  orderNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

const methodIcons: Record<string, typeof CreditCard> = {
  CASH: Banknote,
  CARD: CreditCard,
  WALLET: Wallet,
};

const methodLabels: Record<string, string> = {
  CASH: 'Cash on Delivery',
  CARD: 'Credit/Debit Card',
  WALLET: 'ORIGIN Wallet',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  PAID: { label: 'Paid', color: 'text-sage' },
  UNPAID: { label: 'Pending', color: 'text-caramel' },
  REFUNDED: { label: 'Refunded', color: 'text-blue-500' },
};

export default function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { orderId } = use(params);
  const { orderNumber, total, method, status, txn, date, name } = use(searchParams);

  const paymentMethod = method || 'CASH';
  const paymentStatus = status || 'UNPAID';
  const MethodIcon = methodIcons[paymentMethod] || CreditCard;
  const statusInfo = statusConfig[paymentStatus] || statusConfig.UNPAID;

  const subtotal = total ? parseFloat(total) / 1.15 : 0;
  const tax = subtotal * 0.15;
  const deliveryFee = 0;

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso pt-24 pb-12">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-smoke-300 dark:text-cream/40 hover:text-caramel transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>
          <h1 className="font-heading text-2xl font-bold text-espresso dark:text-cream">
            Payment Receipt
          </h1>
        </motion.div>

        {/* Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 overflow-hidden"
        >
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-espresso to-espresso-400 dark:from-cream dark:to-cream/90 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4"
            >
              <Receipt size={32} className="text-caramel" />
            </motion.div>
            <h2 className="font-heading text-xl font-bold text-cream dark:text-espresso">
              ORIGIN
            </h2>
            <p className="text-sm text-cream/60 dark:text-espresso/60 mt-1">
              Restaurant & Café
            </p>
          </div>

          {/* Order Info */}
          <div className="p-6 border-b border-espresso/5 dark:border-cream/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-smoke-300 dark:text-cream/50">Order Number</span>
              <span className="font-heading font-bold text-caramel">{orderNumber || orderId}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-smoke-300 dark:text-cream/50">Date</span>
              <span className="text-sm text-espresso dark:text-cream">
                {date || new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-smoke-300 dark:text-cream/50">Customer</span>
              <span className="text-sm text-espresso dark:text-cream">
                {name || 'Guest'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="p-6 border-b border-espresso/5 dark:border-cream/5">
            <h3 className="text-sm font-medium text-espresso dark:text-cream mb-4">Items</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-smoke-300 dark:text-cream/40">
                <span>Item</span>
                <div className="flex items-center gap-8">
                  <span>Qty</span>
                  <span>Total</span>
                </div>
              </div>
              <div className="h-px bg-espresso/5 dark:bg-cream/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-espresso dark:text-cream">Order Total</span>
                <span className="text-sm font-medium text-espresso dark:text-cream">
                  {formatPrice(parseFloat(total || '0'))}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-6 border-b border-espresso/5 dark:border-cream/5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-smoke-300 dark:text-cream/50">Subtotal</span>
                <span className="text-espresso dark:text-cream">{formatPrice(subtotal)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-smoke-300 dark:text-cream/50">Delivery Fee</span>
                  <span className="text-espresso dark:text-cream">{formatPrice(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-smoke-300 dark:text-cream/50">Tax (15%)</span>
                <span className="text-espresso dark:text-cream">{formatPrice(tax)}</span>
              </div>
              <div className="h-px bg-espresso/10 dark:bg-cream/10 my-2" />
              <div className="flex justify-between">
                <span className="font-heading font-bold text-espresso dark:text-cream">Total</span>
                <span className="font-heading font-bold text-lg text-caramel">
                  {formatPrice(parseFloat(total || '0'))}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-espresso dark:text-cream mb-4">
              Payment Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-smoke-300 dark:text-cream/50">Method</span>
                <div className="flex items-center gap-2">
                  <MethodIcon size={16} className="text-caramel" />
                  <span className="text-sm text-espresso dark:text-cream">
                    {methodLabels[paymentMethod] || paymentMethod}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-smoke-300 dark:text-cream/50">Status</span>
                <span className={`text-sm font-medium flex items-center gap-1.5 ${statusInfo.color}`}>
                  {paymentStatus === 'PAID' ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                  {statusInfo.label}
                </span>
              </div>
              {txn && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-smoke-300 dark:text-cream/50">Transaction ID</span>
                  <span className="text-xs font-mono text-espresso dark:text-cream bg-espresso/5 dark:bg-cream/5 px-2 py-1 rounded">
                    {txn}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-3"
        >
          <Link
            href={`/order/${orderId}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-caramel py-3.5 text-sm font-semibold text-espresso transition-all hover:bg-caramel-400 shadow-lg shadow-caramel/25"
          >
            <FileText size={16} />
            Track Order
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-espresso/15 dark:border-cream/15 py-3.5 text-sm font-medium text-espresso dark:text-cream transition-colors hover:bg-espresso/5 dark:hover:bg-cream/5"
          >
            <Download size={16} />
            Download Receipt
          </button>
        </motion.div>
      </div>
    </div>
  );
}
