'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

export function StatCard({ title, value, trend, icon, color, delay = 0 }: StatCardProps) {
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-smoke-300 dark:text-cream/50 mb-1">{title}</p>
          <p className="text-2xl font-heading font-bold text-espresso dark:text-cream">{value}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        {isPositive ? (
          <TrendingUp size={14} className="text-green-500" />
        ) : (
          <TrendingDown size={14} className="text-red-500" />
        )}
        <span className={cn('text-xs font-medium', isPositive ? 'text-green-500' : 'text-red-500')}>
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-smoke-300 dark:text-cream/40 ml-1">vs last week</span>
      </div>
    </motion.div>
  );
}
