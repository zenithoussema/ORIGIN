'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Award,
  Settings,
  CalendarDays,
  LogOut,
  ArrowLeft,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useUserStore } from '@/lib/user-store';
import { loyaltyLevels, getLoyaltyLevel } from '@/data/user-profile';
import { DashboardTab } from './DashboardTab';
import { OrdersTab } from './OrdersTab';
import { FavoritesTab } from './FavoritesTab';
import { LoyaltyTab } from './LoyaltyTab';
import { SettingsTab } from './SettingsTab';
import { ReservationsTab } from './ReservationsTab';
import { WalletTab } from './WalletTab';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'loyalty', label: 'Loyalty', icon: Award },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfileDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const mounted = useIsMounted();
  const { activeTab, setActiveTab, profile, settings } = useUserStore();
  const loyaltyLevel = getLoyaltyLevel(profile.loyaltyPoints);
  const levelConfig = loyaltyLevels[loyaltyLevel];

  useEffect(() => {
    if (tabParam && ['dashboard', 'orders', 'wallet', 'favorites', 'loyalty', 'reservations', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam, setActiveTab]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const displayName = session.user?.name || settings.name || 'User';
  const displayEmail = session.user?.email || settings.email || '';

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'orders':
        return <OrdersTab />;
      case 'wallet':
        return <WalletTab />;
      case 'favorites':
        return <FavoritesTab />;
      case 'loyalty':
        return <LoyaltyTab />;
      case 'reservations':
        return <ReservationsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-smoke-300 dark:text-cream/50 hover:text-caramel transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <ProfileAvatar name={displayName} size="xl" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-espresso dark:text-cream">
                  {displayName}
                </h1>
                <StatusBadge
                  label={levelConfig.label}
                  color={levelConfig.color}
                  bg="bg-espresso/5 dark:bg-cream/5"
                />
              </div>
              <p className="text-smoke-300 dark:text-cream/50 text-sm mb-3">
                {displayEmail}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-smoke-300 dark:text-cream/40">
                  Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className="text-smoke-300 dark:text-cream/40">•</span>
                <span className="text-caramel font-medium">
                  {profile.loyaltyPoints} points
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              leftIcon={<LogOut size={16} />}
              className="text-smoke-300 dark:text-cream/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex overflow-x-auto gap-1 p-1 bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-caramel text-espresso shadow-sm'
                    : 'text-smoke-300 dark:text-cream/50 hover:bg-espresso/5 dark:hover:bg-cream/5 hover:text-espresso dark:hover:text-cream'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTab()}
        </motion.div>
      </div>
    </div>
  );
}
