'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, ShoppingCart, Calendar, Gift, Megaphone, Star } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export function NotificationPreferences() {
  const { isSupported, permission, isSubscribed, subscribe, unsubscribe, requestPermission } =
    usePushNotifications();
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'order_updates',
      label: 'Order Updates',
      description: 'Get notified about your order status',
      icon: <ShoppingCart className="h-5 w-5" />,
      enabled: true,
    },
    {
      id: 'reservations',
      label: 'Reservations',
      description: 'Reminders about upcoming reservations',
      icon: <Calendar className="h-5 w-5" />,
      enabled: true,
    },
    {
      id: 'promotions',
      label: 'Promotions',
      description: 'Special offers and discounts',
      icon: <Gift className="h-5 w-5" />,
      enabled: false,
    },
    {
      id: 'announcements',
      label: 'Announcements',
      description: 'News and updates from ORIGIN',
      icon: <Megaphone className="h-5 w-5" />,
      enabled: false,
    },
    {
      id: 'loyalty',
      label: 'Loyalty Rewards',
      description: 'Points and reward notifications',
      icon: <Star className="h-5 w-5" />,
      enabled: true,
    },
  ]);

  const handleToggle = async (categoryId: string) => {
    if (!isSubscribed) {
      const result = await requestPermission();
      if (result !== 'granted') return;
      await subscribe();
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleToggleAll = async () => {
    if (isSubscribed) {
      await unsubscribe();
      setCategories((prev) => prev.map((c) => ({ ...c, enabled: false })));
    } else {
      const result = await requestPermission();
      if (result !== 'granted') return;
      await subscribe();
      setCategories((prev) => prev.map((c) => ({ ...c, enabled: true })));
    }
  };

  if (!isSupported) {
    return (
      <div className="rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BellOff className="h-5 w-5 text-espresso/40 dark:text-cream/40" />
          <h3 className="font-semibold text-espresso dark:text-cream">
            Push Notifications
          </h3>
        </div>
        <p className="text-sm text-espresso/60 dark:text-cream/60">
          Push notifications are not supported on this device or browser.
        </p>
      </div>
    );
  }

  const allEnabled = categories.every((c) => c.enabled);

  return (
    <div className="rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-caramel" />
          <h3 className="font-semibold text-espresso dark:text-cream">
            Push Notifications
          </h3>
        </div>
        <button
          onClick={handleToggleAll}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            allEnabled ? 'bg-caramel' : 'bg-espresso/20 dark:bg-cream/20'
          }`}
          aria-label={allEnabled ? 'Disable all notifications' : 'Enable all notifications'}
        >
          <motion.div
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
            animate={{ left: allEnabled ? 22 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {permission === 'denied' && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          Notifications are blocked. Please enable them in your browser settings.
        </div>
      )}

      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-espresso/5 dark:bg-cream/5 text-espresso/60 dark:text-cream/60">
                {category.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-espresso dark:text-cream">
                  {category.label}
                </p>
                <p className="text-xs text-espresso/50 dark:text-cream/50">
                  {category.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(category.id)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                category.enabled ? 'bg-caramel' : 'bg-espresso/20 dark:bg-cream/20'
              }`}
              aria-label={`${category.enabled ? 'Disable' : 'Enable'} ${category.label}`}
            >
              <motion.div
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
                animate={{ left: category.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
