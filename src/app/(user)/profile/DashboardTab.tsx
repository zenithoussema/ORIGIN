'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Heart, Award, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useUserStore } from '@/lib/user-store';
import { loyaltyLevels, getLoyaltyLevel, getProgressToNextLevel, getNextLevel } from '@/data/user-profile';
import { formatPrice } from '@/lib/utils';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function DashboardTab() {
  const { profile, orders, favorites, loyaltyRewards } = useUserStore();
  const loyaltyLevel = getLoyaltyLevel(profile.loyaltyPoints);
  const levelConfig = loyaltyLevels[loyaltyLevel];
  const nextLevel = getNextLevel(loyaltyLevel);
  const progress = getProgressToNextLevel(profile.loyaltyPoints);
  const unlockedRewards = loyaltyRewards.filter((r) => r.isUnlocked).length;

  const stats = [
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: profile.totalOrders,
      color: 'bg-caramel/10 text-caramel',
    },
    {
      icon: DollarSign,
      label: 'Total Spent',
      value: profile.totalSpent,
      prefix: '',
      suffix: '',
      color: 'bg-sage/10 text-sage',
      format: true,
    },
    {
      icon: Heart,
      label: 'Favorites',
      value: profile.favoriteCount,
      color: 'bg-red-50 dark:bg-red-900/20 text-red-500',
    },
    {
      icon: Award,
      label: 'Loyalty Points',
      value: profile.loyaltyPoints,
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-5 hover-lift"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="font-heading font-bold text-2xl text-espresso dark:text-cream">
              {stat.format ? (
                formatPrice(stat.value)
              ) : (
                <AnimatedCounter value={stat.value} />
              )}
            </p>
            <p className="text-xs text-smoke-300 dark:text-cream/50 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loyalty Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-caramel/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-caramel" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream">
              Loyalty Progress
            </h3>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className={`font-medium ${levelConfig.color}`}>{levelConfig.label}</span>
              {nextLevel && (
                <span className="text-smoke-300 dark:text-cream/40">
                  {loyaltyLevels[nextLevel].label}
                </span>
              )}
            </div>
            <div className="h-2 bg-espresso/5 dark:bg-cream/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${levelConfig.gradient}`}
              />
            </div>
            <p className="text-xs text-smoke-300 dark:text-cream/40 mt-2">
              {nextLevel
                ? `${loyaltyLevels[nextLevel].min - profile.loyaltyPoints} points to ${loyaltyLevels[nextLevel].label}`
                : 'You\'ve reached the highest level!'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Award size={14} className="text-caramel" />
              <span className="text-smoke-300 dark:text-cream/50">
                {unlockedRewards} rewards unlocked
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-caramel/10 flex items-center justify-center">
              <ShoppingBag size={18} className="text-caramel" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream">
              Recent Orders
            </h3>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg bg-smoke-50 dark:bg-espresso/50"
              >
                <div>
                  <p className="text-sm font-medium text-espresso dark:text-cream">
                    {order.id}
                  </p>
                  <p className="text-xs text-smoke-300 dark:text-cream/40">
                    {new Date(order.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-espresso dark:text-cream">
                    {formatPrice(order.total)}
                  </p>
                  <p className={`text-xs capitalize ${
                    order.status === 'delivered' ? 'text-emerald-600' :
                    order.status === 'preparing' ? 'text-blue-600' :
                    order.status === 'cancelled' ? 'text-red-500' :
                    'text-amber-600'
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
