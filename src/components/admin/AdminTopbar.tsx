'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, ChevronDown, LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useAdminStore } from '@/lib/admin-store';

export function AdminTopbar() {
  const { data: session } = useSession();
  const { searchQuery, setSearchQuery, setSidebarMobileOpen } = useAdminStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const notifications = [
    { id: '1', text: 'New order #ORD-007 received', time: '2m ago', unread: true },
    { id: '2', text: 'Reservation confirmed for 6 guests', time: '15m ago', unread: true },
    { id: '3', text: 'Order #ORD-004 ready for pickup', time: '25m ago', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-white dark:bg-espresso-500 border-b border-espresso/10 dark:border-cream/10 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="lg:hidden text-espresso dark:text-cream hover:text-caramel transition-colors"
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-smoke-50 dark:bg-espresso/50 rounded-lg px-3 py-2 w-72">
          <Search size={16} className="text-smoke-300 dark:text-cream/30 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search orders, users, menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/30 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsUserMenuOpen(false);
            }}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-espresso/60 dark:text-cream/60 hover:bg-smoke-50 dark:hover:bg-espresso/50 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-caramel text-espresso text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 shadow-xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-espresso/10 dark:border-cream/10">
                  <p className="font-medium text-sm text-espresso dark:text-cream">Notifications</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 border-b border-espresso/5 dark:border-cream/5 hover:bg-smoke-50 dark:hover:bg-espresso/30 transition-colors ${
                        n.unread ? 'bg-caramel/5' : ''
                      }`}
                    >
                      <p className="text-sm text-espresso dark:text-cream">{n.text}</p>
                      <p className="text-xs text-smoke-300 dark:text-cream/40 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-smoke-50 dark:hover:bg-espresso/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center">
              <span className="text-caramel font-medium text-xs">
                {session?.user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-espresso dark:text-cream leading-tight">
                {session?.user?.name || 'Admin'}
              </p>
              <p className="text-[10px] text-smoke-300 dark:text-cream/40">Administrator</p>
            </div>
            <ChevronDown size={14} className="text-smoke-300 dark:text-cream/40 hidden sm:block" />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 shadow-xl overflow-hidden z-50"
              >
                <button
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-espresso dark:text-cream hover:bg-smoke-50 dark:hover:bg-espresso/50 transition-colors"
                >
                  <User size={14} />
                  Profile
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
