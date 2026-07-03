'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronDown, ChevronUp, RefreshCw, Package } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUserStore } from '@/lib/user-store';
import { statusConfig, type OrderStatus } from '@/data/user-profile';
import { formatPrice } from '@/lib/utils';
import { staggerContainer, fadeUp } from '@/lib/animations';

const statusFilters: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function OrdersTab() {
  const { orders, reorder } = useUserStore();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6">
      {/* Status Filters */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {statusFilters.map((filter) => {
          const count = filter.id === 'all'
            ? orders.length
            : orders.filter((o) => o.status === filter.id).length;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter.id
                  ? 'bg-caramel text-espresso shadow-sm'
                  : 'bg-white dark:bg-espresso-500 border border-espresso/10 dark:border-cream/10 text-smoke-300 dark:text-cream/50 hover:border-caramel hover:text-caramel'
              }`}
            >
              {filter.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === filter.id
                  ? 'bg-espresso/10 text-espresso'
                  : 'bg-espresso/5 dark:bg-cream/5 text-smoke-300 dark:text-cream/40'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-12 text-center"
        >
          <Package size={48} className="mx-auto mb-4 text-smoke-300 dark:text-cream/20" />
          <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-2">
            No orders found
          </h3>
          <p className="text-sm text-smoke-300 dark:text-cream/40">
            {activeFilter === 'all'
              ? "You haven't placed any orders yet."
              : `No ${activeFilter} orders found.`}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const statusInfo = statusConfig[order.status];

            return (
              <motion.div
                key={order.id}
                variants={fadeUp}
                className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 overflow-hidden"
              >
                {/* Order Header */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-smoke-50 dark:hover:bg-espresso/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-caramel/10 flex items-center justify-center">
                      <ShoppingBag size={18} className="text-caramel" />
                    </div>
                    <div>
                      <p className="font-medium text-espresso dark:text-cream text-sm sm:text-base">
                        {order.id}
                      </p>
                      <p className="text-xs text-smoke-300 dark:text-cream/40">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="font-medium text-espresso dark:text-cream">
                        {formatPrice(order.total)}
                      </p>
                      <StatusBadge
                        label={statusInfo.label}
                        color={statusInfo.color}
                        bg={statusInfo.bg}
                      />
                    </div>
                    <div className="sm:hidden">
                      <StatusBadge
                        label={statusInfo.label}
                        color={statusInfo.color}
                        bg={statusInfo.bg}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-smoke-300 dark:text-cream/40" />
                    ) : (
                      <ChevronDown size={18} className="text-smoke-300 dark:text-cream/40" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-espresso/10 dark:border-cream/10">
                        {/* Order Items */}
                        <div className="mt-4 space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-smoke-50 dark:bg-espresso/50"
                            >
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={48}
                                height={48}
                                sizes="48px"
                                className="rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-espresso dark:text-cream truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-smoke-300 dark:text-cream/40">
                                  Qty: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-espresso dark:text-cream">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-espresso/10 dark:border-cream/10">
                          <p className="font-heading font-bold text-lg text-espresso dark:text-cream">
                            Total: {formatPrice(order.total)}
                          </p>
                          {order.status !== 'cancelled' && (
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<RefreshCw size={14} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                reorder(order.id);
                              }}
                            >
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
