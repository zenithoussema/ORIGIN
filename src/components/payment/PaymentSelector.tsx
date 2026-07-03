'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Banknote,
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';
import { formatPrice } from '@/lib/utils';

type PaymentMethod = 'CASH' | 'CARD' | 'WALLET';

interface PaymentSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  amount: number;
  disabled?: boolean;
}

const methods = [
  {
    value: 'CASH' as const,
    label: 'Cash',
    icon: Banknote,
    description: 'Pay on delivery or pickup',
    badge: null,
  },
  {
    value: 'CARD' as const,
    label: 'Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, Mada',
    badge: 'Secure',
  },
  {
    value: 'WALLET' as const,
    label: 'Wallet',
    icon: Wallet,
    description: 'ORIGIN Wallet balance',
    badge: null,
  },
];

export function PaymentSelector({
  selectedMethod,
  onSelect,
  amount,
  disabled = false,
}: PaymentSelectorProps) {
  const isMounted = useIsMounted();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState('');

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    setBalanceError('');
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance);
      }
    } catch {
      setBalanceError('Could not load wallet balance');
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted && selectedMethod === 'WALLET') {
      fetchBalance(); // eslint-disable-line react-hooks/set-state-in-effect -- intentional wallet balance fetch
    }
  }, [isMounted, selectedMethod, fetchBalance]);

  if (!isMounted) return null;

  const insufficientBalance = walletBalance !== null && walletBalance < amount;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-espresso dark:text-cream flex items-center gap-2">
        <Shield size={14} className="text-sage" />
        Payment Method
      </h3>

      {methods.map((method) => {
        const isActive = selectedMethod === method.value;
        const isWallet = method.value === 'WALLET';
        const isDisabledMethod = disabled || (isWallet && insufficientBalance);

        return (
          <motion.button
            key={method.value}
            type="button"
            onClick={() => !isDisabledMethod && onSelect(method.value)}
            disabled={isDisabledMethod}
            whileHover={!isDisabledMethod ? { scale: 1.01 } : undefined}
            whileTap={!isDisabledMethod ? { scale: 0.99 } : undefined}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              isDisabledMethod
                ? 'opacity-50 cursor-not-allowed border-espresso/5 dark:border-cream/5'
                : isActive
                ? 'border-caramel bg-caramel/5'
                : 'border-espresso/10 dark:border-cream/10 hover:border-caramel/50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-caramel/20' : 'bg-espresso/5 dark:bg-cream/5'
              }`}
            >
              <method.icon
                size={20}
                className={isActive ? 'text-caramel' : 'text-smoke-300 dark:text-cream/40'}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-medium ${
                    isActive ? 'text-caramel' : 'text-espresso dark:text-cream'
                  }`}
                >
                  {method.label}
                </p>
                {method.badge && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-sage/10 text-sage">
                    {method.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-smoke-300 dark:text-cream/40">{method.description}</p>

              {isWallet && selectedMethod === 'WALLET' && (
                <div className="mt-2">
                  {loadingBalance ? (
                    <div className="flex items-center gap-1.5 text-xs text-smoke-300 dark:text-cream/40">
                      <Loader2 size={12} className="animate-spin" />
                      Loading balance...
                    </div>
                  ) : balanceError ? (
                    <div className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle size={12} />
                      {balanceError}
                    </div>
                  ) : walletBalance !== null ? (
                    <div className="flex items-center gap-1.5">
                      {insufficientBalance ? (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Insufficient balance ({formatPrice(walletBalance)})
                        </span>
                      ) : (
                        <span className="text-xs text-sage flex items-center gap-1">
                          <CheckCircle size={12} />
                          Balance: {formatPrice(walletBalance)}
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isActive ? 'border-caramel' : 'border-espresso/20 dark:border-cream/20'
              }`}
            >
              {isActive && <div className="w-2.5 h-2.5 rounded-full bg-caramel" />}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export type { PaymentMethod };
