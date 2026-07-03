'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  Utensils,
  Flame,
  ChefHat,
  Package,
  PartyPopper,
  Loader2,
} from 'lucide-react';
import type {
  TrackingOrder,
  OrderStatus,
  TrackingStep,
} from '@/lib/order-tracking';
import {
  TRACKING_STEPS,
  getStepIndex,
  getStepByStatus,
  getStatusColor,
  getEstimatedMinutes,
  formatCountdown,
} from '@/lib/order-tracking';
import { formatPrice } from '@/lib/utils';

interface OrderTrackerProps {
  order: TrackingOrder;
  statusChanged: boolean;
  previousStatus: OrderStatus | null;
  onClearStatusChanged: () => void;
}

const stepIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PREPARING: ChefHat,
  COOKING: Flame,
  READY: Package,
  COMPLETED: PartyPopper,
  CANCELLED: XCircle,
};

export function OrderTracker({
  order,
  statusChanged,
  previousStatus,
  onClearStatusChanged,
}: OrderTrackerProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showStatusToast, setShowStatusToast] = useState(false);

  const currentStep = useMemo(() => getStepByStatus(order.status), [order.status]);
  const currentStepIndex = useMemo(() => getStepIndex(order.status), [order.status]);
  const isCancelled = order.status === 'CANCELLED';
  const isTerminal = order.status === 'COMPLETED' || order.status === 'CANCELLED';

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const [prevOrderStatus, setPrevOrderStatus] = useState(order.status);
  if (prevOrderStatus !== order.status) {
    setPrevOrderStatus(order.status);
    if (isTerminal) {
      setCountdown(null);
    } else {
      const minutes = getEstimatedMinutes(order.status);
      setCountdown(minutes !== null && minutes > 0 ? minutes * 60 : null);
    }
  }

  const [prevStatusChanged, setPrevStatusChanged] = useState(statusChanged);
  if (!prevStatusChanged && statusChanged) {
    setShowStatusToast(true);
  }
  if (prevStatusChanged !== statusChanged) {
    setPrevStatusChanged(statusChanged);
  }

  useEffect(() => {
    if (statusChanged) {
      const timer = setTimeout(() => {
        setShowStatusToast(false);
        onClearStatusChanged();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [statusChanged, onClearStatusChanged]);

  const progressPercent = useMemo(() => {
    if (isCancelled) return 0;
    if (isTerminal) return 100;
    return ((currentStepIndex + 1) / TRACKING_STEPS.length) * 100;
  }, [currentStepIndex, isCancelled, isTerminal]);

  return (
    <div className="space-y-6">
      {/* Status Toast */}
      <AnimatePresence>
        {showStatusToast && previousStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-caramel px-5 py-3 shadow-2xl"
          >
            <p className="text-sm font-medium text-espresso">
              Status updated: {currentStep.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Status Hero */}
      <motion.div
        key={order.status}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6 text-center"
      >
        <motion.div
          key={`icon-${order.status}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-5xl mb-3"
        >
          {currentStep.icon}
        </motion.div>
        <h2 className="font-heading text-2xl font-bold text-espresso dark:text-cream mb-1">
          {currentStep.label}
        </h2>
        <p className="text-sm text-smoke-300 dark:text-cream/50 max-w-sm mx-auto">
          {currentStep.message}
        </p>

        {/* Countdown */}
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-caramel/10 px-4 py-2"
          >
            <Clock size={14} className="text-caramel" />
            <span className="text-sm font-medium text-caramel">
              ~{formatCountdown(countdown)}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-smoke-300 dark:text-cream/50">Progress</span>
          <span className="text-xs font-medium text-caramel">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 bg-espresso/5 dark:bg-cream/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isCancelled
                ? 'bg-red-400'
                : isTerminal
                ? 'bg-sage'
                : 'bg-gradient-to-r from-caramel to-caramel-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
        <h3 className="font-heading font-semibold text-espresso dark:text-cream mb-5">
          Order Timeline
        </h3>

        {isCancelled ? (
          <CancelledTimeline order={order} />
        ) : (
          <div className="space-y-0">
            {TRACKING_STEPS.map((step, i) => {
              const stepIdx = getStepIndex(step.key);
              const isCompleted = stepIdx < currentStepIndex || order.status === 'COMPLETED';
              const isCurrent = step.key === order.status;
              const isPending = stepIdx > currentStepIndex;
              const Icon = stepIcons[step.key] || Clock;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4"
                >
                  {/* Vertical Line + Circle */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={isCurrent ? { scale: 0.8 } : false}
                      animate={isCurrent ? { scale: [0.8, 1.1, 1] } : {}}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-sage/10'
                          : isCurrent
                          ? 'bg-caramel/10 ring-4 ring-caramel/20'
                          : 'bg-espresso/5 dark:bg-cream/5'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={18} className="text-sage" />
                      ) : isCurrent ? (
                        <Icon size={18} className="text-caramel" />
                      ) : (
                        <Icon size={18} className="text-smoke-200 dark:text-cream/20" />
                      )}
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-caramel"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    {i < TRACKING_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 min-h-[32px] ${
                          isCompleted
                            ? 'bg-sage/30'
                            : isCurrent
                            ? 'bg-gradient-to-b from-caramel/30 to-espresso/5 dark:to-cream/5'
                            : 'bg-espresso/5 dark:bg-cream/5'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-6 pt-1.5 ${i === TRACKING_STEPS.length - 1 ? 'pb-0' : ''}`}>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-medium ${
                          isCompleted || isCurrent
                            ? 'text-espresso dark:text-cream'
                            : 'text-smoke-300 dark:text-cream/30'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-caramel/10 text-caramel"
                        >
                          Current
                        </motion.span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        isCompleted || isCurrent
                          ? 'text-smoke-300 dark:text-cream/50'
                          : 'text-smoke-200 dark:text-cream/20'
                      }`}
                    >
                      {step.message}
                    </p>
                    {isCurrent && step.estimatedMinutes && (
                      <p className="text-[10px] text-caramel mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        Est. {step.estimatedMinutes} min
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
        <h3 className="font-heading font-semibold text-espresso dark:text-cream mb-4">
          Order Details
        </h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-espresso/5 dark:bg-cream/5">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={40}
                  height={40}
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-espresso dark:text-cream truncate">
                  {item.name}
                </p>
                <p className="text-xs text-smoke-300 dark:text-cream/40">
                  Qty: {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="text-sm font-medium text-espresso dark:text-cream">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 border-t border-espresso/10 dark:border-cream/10">
            <span className="font-medium text-espresso dark:text-cream">Total</span>
            <span className="font-heading font-bold text-lg text-caramel">
              {formatPrice(order.totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelledTimeline({ order }: { order: TrackingOrder }) {
  const step = getStepByStatus('CANCELLED');
  const Icon = XCircle;

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-red-500" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-red-500">{step.label}</h4>
        <p className="text-xs text-smoke-300 dark:text-cream/50 mt-0.5">{step.message}</p>
        <p className="text-[10px] text-smoke-300/50 dark:text-cream/30 mt-1">
          Order was placed {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
