'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  CalendarDays,
  BarChart3,
  Megaphone,
  ImagePlus,
  Settings,
  Brain,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/lib/admin-store';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'media', label: 'Media', icon: ImagePlus },
  { id: 'recommendations', label: 'Recommendations', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export function AdminSidebar() {
  const { activeTab, setActiveTab, sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } = useAdminStore();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-espresso-500 border-r border-cream/10 flex flex-col transition-all duration-300',
          'lg:relative lg:z-auto',
          sidebarCollapsed ? 'w-[72px]' : 'w-64',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-16 border-b border-cream/10', sidebarCollapsed ? 'justify-center px-2' : 'px-5')}>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-caramel flex items-center justify-center flex-shrink-0">
                <span className="text-espresso font-heading font-bold text-sm">O</span>
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-cream text-sm truncate">ORIGIN</p>
                <p className="text-[10px] text-cream/40 uppercase tracking-widest">Admin</p>
              </div>
            </motion.div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-caramel flex items-center justify-center">
              <span className="text-espresso font-heading font-bold text-sm">O</span>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="lg:hidden ml-auto text-cream/60 hover:text-cream"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as typeof activeTab);
                  setSidebarMobileOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg transition-all duration-200 group relative',
                  sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-caramel/15 text-caramel'
                    : 'text-cream/50 hover:text-cream hover:bg-cream/5'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-caramel rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-espresso text-cream text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-center border-t border-cream/10 p-2">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-cream/40 hover:text-cream hover:bg-cream/5 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
