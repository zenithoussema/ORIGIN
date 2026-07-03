'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/lib/admin-store';
import { DashboardTab } from './DashboardTab';
import { OrdersTab } from './OrdersTab';
import { MenuTab } from './MenuTab';
import { UsersTab } from './UsersTab';
import { ReservationsTab } from './ReservationsTab';
import { AnalyticsTab } from './AnalyticsTab';
import { MarketingTab } from './MarketingTab';
import { MediaTab } from './MediaTab';
import { SettingsTab } from './SettingsTab';
import { RecommendationsTab } from './RecommendationsTab';

const tabComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardTab,
  orders: OrdersTab,
  menu: MenuTab,
  users: UsersTab,
  reservations: ReservationsTab,
  analytics: AnalyticsTab,
  marketing: MarketingTab,
  media: MediaTab,
  settings: SettingsTab,
  recommendations: RecommendationsTab,
};

export default function AdminClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeTab } = useAdminStore();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login?callbackUrl=/admin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-smoke-50 dark:bg-espresso flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-caramel border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  const ActiveTabComponent = tabComponents[activeTab] || DashboardTab;

  return (
    <AdminLayout>
      <ActiveTabComponent />
    </AdminLayout>
  );
}
