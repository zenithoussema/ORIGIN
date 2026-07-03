'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  Users,
  DollarSign,
} from 'lucide-react';
import { mockChartData, mockTopProducts } from '@/data/admin-data';
import { formatPrice } from '@/lib/utils';
import { staggerContainer, fadeUp } from '@/lib/animations';

const peakHours = [
  { hour: '8 AM', orders: 12 },
  { hour: '9 AM', orders: 28 },
  { hour: '10 AM', orders: 45 },
  { hour: '11 AM', orders: 38 },
  { hour: '12 PM', orders: 62 },
  { hour: '1 PM', orders: 58 },
  { hour: '2 PM', orders: 42 },
  { hour: '3 PM', orders: 35 },
  { hour: '4 PM', orders: 28 },
  { hour: '5 PM', orders: 32 },
  { hour: '6 PM', orders: 48 },
  { hour: '7 PM', orders: 65 },
  { hour: '8 PM', orders: 72 },
  { hour: '9 PM', orders: 55 },
  { hour: '10 PM', orders: 30 },
];

const userGrowth = [
  { month: 'Jan', users: 45 },
  { month: 'Feb', users: 82 },
  { month: 'Mar', users: 128 },
  { month: 'Apr', users: 195 },
  { month: 'May', users: 267 },
  { month: 'Jun', users: 342 },
];

const maxPeak = Math.max(...peakHours.map((h) => h.orders));
const maxUsers = Math.max(...userGrowth.map((u) => u.users));

export function AnalyticsTab() {
  const totalRevenue = mockChartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = mockChartData.reduce((sum, d) => sum + d.orders, 0);
  const avgDaily = totalRevenue / mockChartData.length;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-caramel/10 flex items-center justify-center">
              <DollarSign size={18} className="text-caramel" />
            </div>
            <p className="text-sm text-smoke-300 dark:text-cream/50">Total Revenue (7d)</p>
          </div>
          <p className="text-2xl font-heading font-bold text-espresso dark:text-cream">{formatPrice(totalRevenue)}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-xs text-green-500 font-medium">+12.5%</span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-sage/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-sage" />
            </div>
            <p className="text-sm text-smoke-300 dark:text-cream/50">Total Orders (7d)</p>
          </div>
          <p className="text-2xl font-heading font-bold text-espresso dark:text-cream">{totalOrders}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-xs text-green-500 font-medium">+8.3%</span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <DollarSign size={18} className="text-blue-500" />
            </div>
            <p className="text-sm text-smoke-300 dark:text-cream/50">Avg. Daily Revenue</p>
          </div>
          <p className="text-2xl font-heading font-bold text-espresso dark:text-cream">{formatPrice(avgDaily)}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown size={12} className="text-red-500" />
            <span className="text-xs text-red-500 font-medium">-2.1%</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5">
          <h3 className="font-heading font-semibold text-espresso dark:text-cream mb-5">Daily Revenue</h3>
          <div className="flex items-end gap-2 h-48">
            {mockChartData.map((d, i) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.revenue / Math.max(...mockChartData.map((x) => x.revenue))) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                  className="w-full bg-gradient-to-t from-caramel to-caramel/60 rounded-t-md min-h-[4px] relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-espresso text-cream text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                    {formatPrice(d.revenue)}
                  </div>
                </motion.div>
                <span className="text-[10px] text-smoke-300 dark:text-cream/40">{d.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Peak Hours */}
        <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={18} className="text-caramel" />
            <h3 className="font-heading font-semibold text-espresso dark:text-cream">Peak Hours</h3>
          </div>
          <div className="flex items-end gap-1 h-48">
            {peakHours.map((h, i) => (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(h.orders / maxPeak) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                  className={`w-full rounded-t-md min-h-[4px] ${
                    h.orders === maxPeak ? 'bg-caramel' : 'bg-caramel/30'
                  } relative group`}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-espresso text-cream text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                    {h.orders} orders
                  </div>
                </motion.div>
                {i % 2 === 0 && (
                  <span className="text-[8px] text-smoke-300 dark:text-cream/40 -rotate-45 origin-left mt-1">{h.hour}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5">
          <h3 className="font-heading font-semibold text-espresso dark:text-cream mb-4">Top Products by Revenue</h3>
          <div className="space-y-3">
            {mockTopProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-medium text-caramel w-4">#{i + 1}</span>
                <div className="w-9 h-9 rounded-lg bg-espresso/5 dark:bg-cream/5 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-caramel/10" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-espresso dark:text-cream truncate">{p.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-smoke-300 dark:text-cream/40">{p.orderCount} orders</p>
                    <div className="flex-1 h-1 bg-smoke-100 dark:bg-espresso/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.revenue / mockTopProducts[0].revenue) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                        className="h-full bg-caramel rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-espresso dark:text-cream">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* User Growth */}
        <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-caramel" />
            <h3 className="font-heading font-semibold text-espresso dark:text-cream">User Growth</h3>
          </div>
          <div className="flex items-end gap-3 h-48">
            {userGrowth.map((u, i) => (
              <div key={u.month} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(u.users / maxUsers) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                  className="w-full bg-gradient-to-t from-sage to-sage/60 rounded-t-md min-h-[4px] relative group"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-espresso text-cream text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                    {u.users} users
                  </div>
                </motion.div>
                <span className="text-xs text-smoke-300 dark:text-cream/40">{u.month}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
