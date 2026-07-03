'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Megaphone,
  X,
  ChevronDown,
} from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { useIsMounted } from '@/hooks/useIsMounted';

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  INFO: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  SUCCESS: { icon: CheckCircle, color: 'text-sage', bg: 'bg-sage/10' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ERROR: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  PROMO: { icon: Megaphone, color: 'text-caramel', bg: 'bg-caramel/10' },
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = typeConfig[notification.type] || typeConfig.INFO;
  const Icon = config.icon;

  const getLink = (): string | null => {
    if (!notification.relatedEntityId) return null;
    switch (notification.relatedType) {
      case 'ORDER':
        return `/order/${notification.relatedEntityId}`;
      case 'RESERVATION':
        return '/profile';
      case 'PAYMENT':
        return `/receipt/${notification.relatedEntityId}`;
      case 'WALLET':
        return '/profile';
      default:
        return null;
    }
  };

  const link = getLink();

  const content = (
    <div
      className={`flex items-start gap-3 p-4 transition-colors ${
        !notification.read
          ? 'bg-caramel/5 dark:bg-caramel/5'
          : 'hover:bg-espresso/5 dark:hover:bg-cream/5'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
        <Icon size={18} className={config.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm font-medium text-espresso dark:text-cream ${
              !notification.read ? 'font-semibold' : ''
            }`}>
              {notification.title}
            </p>
            <p className="text-xs text-smoke-300 dark:text-cream/40 mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          </div>
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-caramel flex-shrink-0 mt-2" />
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-smoke-300/60 dark:text-cream/30">
            {timeAgo(notification.createdAt)}
          </span>
          {!notification.read && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="text-[10px] text-caramel hover:text-caramel-400 transition-colors flex items-center gap-0.5"
            >
              <Check size={10} />
              Mark read
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="text-[10px] text-smoke-300/40 hover:text-red-400 transition-colors ml-auto"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    );
  }

  return <div className="cursor-pointer">{content}</div>;
}

export function NotificationBell() {
  const isMounted = useIsMounted();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, hasMore, markAsRead, markAllAsRead, deleteNotification, loadMore, refresh } =
    useNotifications({ pollingInterval: 15000 });

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  if (!isMounted) {
    return (
      <button className="relative p-2 rounded-full text-cream/60">
        <Bell size={20} />
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-caramel text-[10px] font-bold text-espresso"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-espresso-500 border border-espresso/10 dark:border-cream/10 shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-espresso/5 dark:border-cream/5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold text-espresso dark:text-cream">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-caramel/10 text-caramel">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="p-1.5 rounded-lg text-xs text-caramel hover:bg-caramel/10 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-smoke-300 dark:text-cream/40 hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell size={32} className="text-espresso/10 dark:text-cream/10 mb-3" />
                  <p className="text-sm text-smoke-300 dark:text-cream/40 text-center">
                    No notifications yet
                  </p>
                  <p className="text-xs text-smoke-300/50 dark:text-cream/20 text-center mt-1">
                    We&apos;ll notify you when something happens
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-espresso/5 dark:divide-cream/5">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-espresso/5 dark:border-cream/5 p-3">
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-caramel hover:text-caramel-400 transition-colors"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        Load more
                      </>
                    )}
                  </button>
                )}
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-xs font-medium text-smoke-300 dark:text-cream/40 hover:text-caramel transition-colors mt-1"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default NotificationBell;
