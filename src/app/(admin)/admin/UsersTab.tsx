'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Shield,
  ShieldOff,
  RotateCcw,
  Crown,
  X,
  Mail,
  Calendar,
  ShoppingCart,
  Star,
  Ban,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAdminStore } from '@/lib/admin-store';
import { type AdminUser, type AdminSortField } from '@/data/admin-data';
import { formatPrice } from '@/lib/utils';
import { staggerContainer, fadeUp } from '@/lib/animations';

const sortOptions: { value: AdminSortField; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'spending', label: 'Highest Spending' },
  { value: 'orders', label: 'Most Active' },
  { value: 'name', label: 'Name A-Z' },
];

const loyaltyColors: Record<string, string> = {
  bronze: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  silver: 'text-gray-400 bg-gray-50 dark:bg-gray-900/20',
  gold: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  platinum: 'text-purple-400 bg-purple-50 dark:bg-purple-900/20',
};

export function UsersTab() {
  const {
    users,
    userSort,
    setUserSort,
    searchQuery,
    setSearchQuery,
    blockUser,
    unblockUser,
    resetUserPoints,
    updateUserRole,
    getFilteredUsers,
  } = useAdminStore();

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const filteredUsers = getFilteredUsers();

  return (
    <div className="space-y-5">
      {/* Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setUserSort(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                userSort === opt.value
                  ? 'bg-caramel text-espresso shadow-sm'
                  : 'bg-white dark:bg-espresso-500 border border-espresso/10 dark:border-cream/10 text-smoke-300 dark:text-cream/50 hover:border-caramel hover:text-caramel'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-smoke-300 dark:text-cream/40 ml-auto">{filteredUsers.length} users</p>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-espresso/10 dark:border-cream/10">
                <th className="text-left text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Role</th>
                <th className="text-left text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Orders</th>
                <th className="text-left text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Spent</th>
                <th className="text-left text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Loyalty</th>
                <th className="text-left text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-espresso/5 dark:border-cream/5 last:border-0 hover:bg-smoke-50 dark:hover:bg-espresso/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-caramel text-xs font-medium">{user.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-espresso dark:text-cream truncate">{user.name}</p>
                        <p className="text-[10px] text-smoke-300 dark:text-cream/40 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-caramel/10 text-caramel' : 'bg-smoke-100 dark:bg-espresso/50 text-smoke-300 dark:text-cream/50'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-espresso dark:text-cream hidden md:table-cell">{user.totalOrders}</td>
                  <td className="px-4 py-3 text-sm font-medium text-espresso dark:text-cream hidden md:table-cell">{formatPrice(user.totalSpent)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${loyaltyColors[user.loyaltyLevel] || ''}`}>
                      {user.loyaltyLevel} ({user.loyaltyPoints})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isBlocked ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">Blocked</span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-smoke-300 dark:text-cream/40 hover:bg-smoke-50 dark:hover:bg-espresso/50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => user.isBlocked ? unblockUser(user.id) : blockUser(user.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          user.isBlocked
                            ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title={user.isBlocked ? 'Unblock' : 'Block'}
                      >
                        {user.isBlocked ? <Shield size={14} /> : <Ban size={14} />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Search size={40} className="mx-auto mb-3 text-smoke-200 dark:text-cream/20" />
            <p className="text-sm text-smoke-300 dark:text-cream/40">No users found</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-espresso/10 dark:border-cream/10">
                <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream">User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-smoke-300 dark:text-cream/40 hover:bg-smoke-50 dark:hover:bg-espresso/50">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-caramel/20 flex items-center justify-center">
                    <span className="text-caramel font-heading font-bold text-xl">{selectedUser.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-espresso dark:text-cream">{selectedUser.name}</h4>
                    <p className="text-sm text-smoke-300 dark:text-cream/40">{selectedUser.email}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                      selectedUser.role === 'ADMIN' ? 'bg-caramel/10 text-caramel' : 'bg-smoke-100 dark:bg-espresso/50 text-smoke-300 dark:text-cream/50'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-smoke-50 dark:bg-espresso/50 rounded-lg">
                    <ShoppingCart size={16} className="mx-auto mb-1 text-caramel" />
                    <p className="text-lg font-heading font-bold text-espresso dark:text-cream">{selectedUser.totalOrders}</p>
                    <p className="text-[10px] text-smoke-300 dark:text-cream/40">Orders</p>
                  </div>
                  <div className="text-center p-3 bg-smoke-50 dark:bg-espresso/50 rounded-lg">
                    <Star size={16} className="mx-auto mb-1 text-caramel" />
                    <p className="text-lg font-heading font-bold text-espresso dark:text-cream">{formatPrice(selectedUser.totalSpent)}</p>
                    <p className="text-[10px] text-smoke-300 dark:text-cream/40">Spent</p>
                  </div>
                  <div className="text-center p-3 bg-smoke-50 dark:bg-espresso/50 rounded-lg">
                    <Crown size={16} className="mx-auto mb-1 text-caramel" />
                    <p className="text-lg font-heading font-bold text-espresso dark:text-cream">{selectedUser.loyaltyPoints}</p>
                    <p className="text-[10px] text-smoke-300 dark:text-cream/40">Points</p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-smoke-300 dark:text-cream/40" />
                    <span className="text-smoke-300 dark:text-cream/40">Joined:</span>
                    <span className="text-espresso dark:text-cream">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-smoke-300 dark:text-cream/40" />
                    <span className="text-smoke-300 dark:text-cream/40">Last Active:</span>
                    <span className="text-espresso dark:text-cream">{new Date(selectedUser.lastActive).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Crown size={14} className="text-smoke-300 dark:text-cream/40" />
                    <span className="text-smoke-300 dark:text-cream/40">Loyalty Level:</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loyaltyColors[selectedUser.loyaltyLevel] || ''}`}>
                      {selectedUser.loyaltyLevel}
                    </span>
                  </div>
                </div>

                {/* Admin Actions */}
                <div>
                  <p className="text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider mb-2">Admin Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={selectedUser.isBlocked ? <Shield size={14} /> : <Ban size={14} />}
                      onClick={() => {
                        selectedUser.isBlocked ? unblockUser(selectedUser.id) : blockUser(selectedUser.id);
                        setSelectedUser({ ...selectedUser, isBlocked: !selectedUser.isBlocked });
                      }}
                      className={selectedUser.isBlocked ? 'text-green-500' : 'text-red-500'}
                    >
                      {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<RotateCcw size={14} />}
                      onClick={() => {
                        resetUserPoints(selectedUser.id);
                        setSelectedUser({ ...selectedUser, loyaltyPoints: 0, loyaltyLevel: 'bronze' });
                      }}
                      className="text-orange-500"
                    >
                      Reset Points
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Mail size={14} />}
                      className="text-caramel"
                    >
                      Send Message
                    </Button>
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
