'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/lib/user-store';
import { useCartStore } from '@/lib/cart-store';

type PaymentStatus = 'processing' | 'success' | 'failed' | 'error';

export default function StripePaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const cancelled = searchParams.get('cancelled');

  const [status, setStatus] = useState<PaymentStatus>(() => {
    if (cancelled) return 'failed';
    if (!sessionId && !orderId) return 'error';
    return 'processing';
  });
  const [errorMessage, setErrorMessage] = useState(() => {
    if (cancelled) return 'Payment was cancelled.';
    if (!sessionId && !orderId) return 'Invalid payment parameters.';
    return '';
  });

  const clearCart = useCartStore((s) => s.clearCart);
  const setActiveTab = useUserStore((s) => s.setActiveTab);

  useEffect(() => {
    if (status !== 'processing') return;
    if (!orderId && !sessionId) return;

    const timeout = setTimeout(() => {
      clearCart();
      setStatus('success');
      setTimeout(() => {
        setActiveTab('orders');
        router.push('/profile');
      }, 2000);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [status, sessionId, orderId, router, clearCart, setActiveTab]);

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="mb-6">
                <Loader2 size={48} className="mx-auto animate-spin text-caramel" />
              </div>
              <h1 className="font-heading text-xl font-bold text-espresso dark:text-cream mb-2">
                Confirming Payment
              </h1>
              <p className="text-sm text-smoke-300 dark:text-cream/50 mb-4">
                Please wait while we confirm your payment with Stripe...
              </p>
              {orderNumber && (
                <p className="text-xs text-smoke-300/60 dark:text-cream/30">
                  Order: {orderNumber}
                </p>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-6">
                <CheckCircle2 size={48} className="mx-auto text-green-500" />
              </div>
              <h1 className="font-heading text-xl font-bold text-espresso dark:text-cream mb-2">
                Payment Successful
              </h1>
              <p className="text-sm text-smoke-300 dark:text-cream/50 mb-4">
                Redirecting you to your orders...
              </p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mb-6">
                <XCircle size={48} className="mx-auto text-red-500" />
              </div>
              <h1 className="font-heading text-xl font-bold text-espresso dark:text-cream mb-2">
                Payment Failed
              </h1>
              <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 text-sm text-caramel hover:underline"
              >
                <ArrowLeft size={16} />
                Back to Checkout
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-6">
                <XCircle size={48} className="mx-auto text-red-500" />
              </div>
              <h1 className="font-heading text-xl font-bold text-espresso dark:text-cream mb-2">
                Payment Error
              </h1>
              <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 text-sm text-caramel hover:underline"
              >
                <ArrowLeft size={16} />
                Back to Checkout
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
