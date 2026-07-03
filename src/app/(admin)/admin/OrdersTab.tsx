'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  X,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChefHat,
  AlertTriangle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminStore } from '@/lib/admin-store';
import { orderStatusConfig, priorityConfig, type AdminOrder, type AdminOrderStatus, type AdminPriority } from '@/data/admin-data';
import { formatPrice } from '@/lib/utils';
import { staggerContainer, fadeUp } from '@/lib/animations';

const statusIcons: Record<AdminOrderStatus, React.ReactNode> = {
  pending: <Clock size={14} />,
  preparing: <ChefHat size={14} />,
  ready: <CheckCircle size={14} />,
  delivered: <Truck size={14} />,
  cancelled: <XCircle size={14} />,
};

const statusFilters: (AdminOrderStatus | 'all')[] = ['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'];

export function OrdersTab() {
  const {
    orders,
    orderFilter,
    setOrderFilter,
    searchQuery,
    setSearchQuery,
    updateOrderStatus,
    updateOrderPriority,
    getFilteredOrders,
  } = useAdminStore();

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const filteredOrders = getFilteredOrders();

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-5">
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((status) => {
          const isActive = orderFilter === status;
          const config = status === 'all' ? null : orderStatusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setOrderFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-caramel text-espresso shadow-sm'
                  : 'bg-white dark:bg-espresso-500 border border-espresso/10 dark:border-cream/10 text-smoke-300 dark:text-cream/50 hover:border-caramel hover:text-caramel'
              }`}
            >
              {status === 'all' ? 'All' : config?.label}
              <span className="ml-1.5 text-[10px] opacity-70">{statusCounts[status]}</span>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const status = orderStatusConfig[order.status];
          const priority = priorityConfig[order.priority];
          return (
            <motion.div
              key={order.id}
              variants={fadeUp}
              onClick={() => setSelectedOrder(order)}
              className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-4 cursor-pointer hover:shadow-lg hover:border-caramel/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-espresso dark:text-cream text-sm">{order.id}</p>
                  <p className="text-xs text-smoke-300 dark:text-cream/40">{order.userName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priority.bg} ${priority.color}`}>
                    {priority.label}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.slice(0, 2).map((item) => (
                  <p key={item.id} className="text-xs text-smoke-300 dark:text-cream/50 truncate">
                    {item.quantity}x {item.name}
                  </p>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-caramel">+{order.items.length - 2} more items</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-espresso/5 dark:border-cream/5">
                <span className="text-sm font-heading font-bold text-espresso dark:text-cream">
                  {formatPrice(order.total)}
                </span>
                <span className="text-[10px] text-smoke-300 dark:text-cream/40">
                  {new Date(order.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Search size={40} className="mx-auto mb-3 text-smoke-200 dark:text-cream/20" />
          <p className="text-sm text-smoke-300 dark:text-cream/40">No orders found</p>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-espresso/10 dark:border-cream/10">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream">
                    {selectedOrder.id}
                  </h3>
                  <p className="text-sm text-smoke-300 dark:text-cream/40">{selectedOrder.userName}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-smoke-300 dark:text-cream/40 hover:bg-smoke-50 dark:hover:bg-espresso/50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Items */}
                <div>
                  <p className="text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-espresso/5 dark:bg-cream/5 overflow-hidden">
                            <div className="w-full h-full bg-caramel/10" />
                          </div>
                          <div>
                            <p className="text-sm text-espresso dark:text-cream">{item.name}</p>
                            <p className="text-[10px] text-smoke-300 dark:text-cream/40">{item.quantity}x {formatPrice(item.price)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-espresso dark:text-cream">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-espresso/10 dark:border-cream/10">
                    <span className="font-medium text-espresso dark:text-cream">Total</span>
                    <span className="font-heading font-bold text-lg text-espresso dark:text-cream">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <p className="text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider mb-1">Notes</p>
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                      <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-espresso dark:text-cream">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Status Change */}
                <div>
                  <p className="text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(orderStatusConfig) as AdminOrderStatus[]).map((status) => {
                      const config = orderStatusConfig[status];
                      const isActive = selectedOrder.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, status);
                            setSelectedOrder({ ...selectedOrder, status });
                          }}
                          disabled={isActive}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? `${config.bg} ${config.color} ring-2 ring-offset-1 ring-current/20`
                              : 'border border-espresso/10 dark:border-cream/10 text-smoke-300 dark:text-cream/50 hover:border-caramel hover:text-caramel'
                          }`}
                        >
                          {statusIcons[status]}
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider mb-2">Priority</p>
                  <div className="flex gap-2">
                    {(Object.keys(priorityConfig) as AdminPriority[]).map((p) => {
                      const config = priorityConfig[p];
                      const isActive = selectedOrder.priority === p;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            updateOrderPriority(selectedOrder.id, p);
                            setSelectedOrder({ ...selectedOrder, priority: p });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? `${config.bg} ${config.color}`
                              : 'border border-espresso/10 dark:border-cream/10 text-smoke-300 dark:text-cream/50 hover:border-caramel hover:text-caramel'
                          }`}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
