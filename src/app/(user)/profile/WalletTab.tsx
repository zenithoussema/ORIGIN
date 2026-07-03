'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useIsMounted } from '@/hooks/useIsMounted';

interface WalletBalance {
  balance: number;
}

interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

const quickAmounts = [10, 25, 50, 100, 200, 500];

export function WalletTab() {
  const isMounted = useIsMounted();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [funding, setFunding] = useState(false);
  const [fundSuccess, setFundSuccess] = useState('');
  const [fundError, setFundError] = useState('');

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data: WalletBalance = await res.json();
        setBalance(data.balance);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isMounted) {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFund = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      setFundError('Please enter a valid amount.');
      return;
    }

    setFunding(true);
    setFundError('');
    setFundSuccess('');

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFundError(data.error || 'Failed to fund wallet.');
        return;
      }

      setBalance(data.newBalance);
      setFundSuccess(`Successfully funded ${formatPrice(amount)} to your wallet.`);
      setCustomAmount('');
      setSelectedAmount(null);

      setTimeout(() => setFundSuccess(''), 5000);
    } catch {
      setFundError('Something went wrong. Please try again.');
    } finally {
      setFunding(false);
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-caramel" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-espresso to-espresso-600 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-caramel/20 flex items-center justify-center">
              <Wallet size={24} className="text-caramel" />
            </div>
            <div>
              <p className="text-sm opacity-70">ORIGIN Wallet</p>
              <p className="font-heading text-xs opacity-50">Balance</p>
            </div>
          </div>

          <p className="font-heading text-4xl sm:text-5xl font-bold text-caramel">
            {balance !== null ? formatPrice(balance) : '0.000 DT'}
          </p>
        </div>
      </motion.div>

      {/* Fund Wallet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
      >
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
          Fund Wallet
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                selectedAmount === amount
                  ? 'border-caramel bg-caramel/10 text-caramel'
                  : 'border-espresso/10 dark:border-cream/10 text-espresso dark:text-cream hover:border-caramel/50'
              }`}
            >
              {formatPrice(amount)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="number"
            min="1"
            max="50000"
            step="0.001"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            placeholder="Custom amount"
            className="flex-1 px-4 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all"
          />
          <button
            type="button"
            onClick={handleFund}
            disabled={funding || (!selectedAmount && !customAmount)}
            className="px-6 py-2.5 rounded-lg bg-caramel text-sm font-semibold text-espresso transition-all hover:bg-caramel-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {funding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Fund'
            )}
          </button>
        </div>

        {fundSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-sage bg-sage/10 rounded-lg p-3"
          >
            <CheckCircle size={16} />
            {fundSuccess}
          </motion.div>
        )}

        {fundError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-3"
          >
            <AlertCircle size={16} />
            {fundError}
          </motion.div>
        )}
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
      >
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
          How It Works
        </h3>
        <div className="space-y-3 text-sm text-smoke-300 dark:text-cream/50">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-caramel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-caramel">1</span>
            </div>
            <p>Fund your wallet with any amount between 1 DT and 50,000 DT.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-caramel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-caramel">2</span>
            </div>
            <p>Select &quot;Wallet&quot; at checkout to pay with your balance.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-caramel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-caramel">3</span>
            </div>
            <p>Admin can also credit or debit your wallet directly.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
