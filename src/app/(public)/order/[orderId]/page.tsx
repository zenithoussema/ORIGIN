'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Package } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { OrderTracker } from '@/components/tracking/OrderTracker';

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { data: session, status: authStatus } = useSession();

  const {
    order,
    isLoading,
    error,
    previousStatus,
    statusChanged,
    clearStatusChanged,
    refetch,
  } = useOrderTracking({ orderId, pollingInterval: 5000 });

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-caramel" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="font-heading text-2xl font-bold text-espresso dark:text-cream mb-2">
            Sign in required
          </h1>
          <p className="text-smoke-300 dark:text-cream/40 mb-6">
            Please sign in to track your order.
          </p>
          <Link
            href={`/login?callbackUrl=/order/${orderId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-caramel px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-caramel-400"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso pt-24 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-caramel mx-auto mb-4" />
              <p className="text-sm text-smoke-300 dark:text-cream/40">Loading order...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso pt-24 pb-12">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
            <h1 className="font-heading text-2xl font-bold text-espresso dark:text-cream mb-2">
              {error || 'Order not found'}
            </h1>
            <p className="text-smoke-300 dark:text-cream/40 mb-6">
              We couldn&apos;t find this order. Please check your order number.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 rounded-xl border border-espresso/15 dark:border-cream/15 px-5 py-2.5 text-sm font-medium text-espresso dark:text-cream transition-colors hover:bg-espresso/5 dark:hover:bg-cream/5"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-caramel px-5 py-2.5 text-sm font-semibold text-espresso transition-colors hover:bg-caramel-400"
              >
                <ArrowLeft size={16} />
                Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-espresso dark:text-cream">
                Track Order
              </h1>
              <p className="text-sm text-caramel font-medium mt-0.5">
                {order.orderNumber}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-caramel/10 flex items-center justify-center">
              <Package size={20} className="text-caramel" />
            </div>
          </div>
        </motion.div>

        {/* Tracker */}
        <OrderTracker
          order={order}
          statusChanged={statusChanged}
          previousStatus={previousStatus}
          onClearStatusChanged={clearStatusChanged}
        />
      </div>
    </div>
  );
}
