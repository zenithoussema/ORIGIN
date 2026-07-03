'use client';

import { motion } from 'framer-motion';
import {
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { useAdminStore } from '@/lib/admin-store';
import { mockDashboardStats, mockChartData, mockTopProducts, mockActivityFeed, orderStatusConfig } from '@/data/admin-data';
import { formatPrice } from '@/lib/utils';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function DashboardTab() {
  const { setActiveTab, orders } = useAdminStore();

  const stats = mockDashboardStats;
  const maxRevenue = Math.max(...mockChartData.map((d) => d.revenue));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={formatPrice(stats.totalSales)}
          trend={stats.salesTrend}
          icon={<DollarSign size={20} className="text-caramel" />}
          color="bg-caramel/10"
          delay={0}
        />
        <StatCard
          title="Orders Today"
          value={stats.ordersToday}
          trend={stats.ordersTrend}
          icon={<ShoppingCart size={20} className="text-sage" />}
          color="bg-sage/10"
          delay={0.1}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          trend={stats.usersTrend}
          icon={<Users size={20} className="text-blue-500" />}
          color="bg-blue-500/10"
          delay={0.2}
        />
        <StatCard
          title="Avg. Order Value"
          value={formatPrice(stats.avgOrderValue)}
          trend={stats.avgTrend}
          icon={<TrendingUp size={20} className="text-purple-500" />}
          color="bg-purple-500/10"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          variants={fadeUp}
          className="lg:col-span-2 bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-espresso dark:text-cream">Revenue Overview</h3>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-caramel hover:underline flex items-center gap-1"
            >
              View Details <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex items-end gap-2 h-48">
            {mockChartData.map((d, i) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
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

        {/* Activity Feed */}
        <motion.div
          variants={fadeUp}
          className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5"
        >
          <h3 className="font-heading font-semibold text-espresso dark:text-cream mb-4">Live Activity</h3>
          <div className="space-y-3">
            {mockActivityFeed.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="text-lg mt-0.5">{a.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-espresso dark:text-cream leading-snug">{a.message}</p>
                  <p className="text-[10px] text-smoke-300 dark:text-cream/40 mt-0.5">{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          variants={fadeUp}
          className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-espresso dark:text-cream">Top Products</h3>
            <button
              onClick={() => setActiveTab('menu')}
              className="text-xs text-caramel hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {mockTopProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-medium text-smoke-300 dark:text-cream/40 w-4">{i + 1}</span>
                <div className="w-9 h-9 rounded-lg bg-espresso/5 dark:bg-cream/5 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-caramel/10" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-espresso dark:text-cream truncate">{p.name}</p>
                  <p className="text-[10px] text-smoke-300 dark:text-cream/40">{p.orderCount} orders</p>
                </div>
                <span className="text-sm font-medium text-espresso dark:text-cream">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          variants={fadeUp}
          className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-espresso dark:text-cream">Recent Orders</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-caramel hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => {
              const status = orderStatusConfig[o.status];
              return (
                <div key={o.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-espresso dark:text-cream">{o.id}</p>
                    <p className="text-[10px] text-smoke-300 dark:text-cream/40 truncate">{o.userName}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-sm font-medium text-espresso dark:text-cream ml-3">{formatPrice(o.total)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
