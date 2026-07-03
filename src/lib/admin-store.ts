import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminMenuItem,
  AdminMenuCategory,
  AdminUser,
  AdminUserRole,
  AdminReservation,
  AdminReservationStatus,
  AdminNewsPost,
  AdminMediaItem,
  AdminSettings,
  AdminSortField,
  AdminPriority,
} from '@/data/admin-data';
import {
  mockAdminOrders,
  mockAdminMenuItems,
  mockAdminUsers,
  mockAdminReservations,
  mockAdminNews,
  mockAdminMedia,
  mockAdminSettings,
} from '@/data/admin-data';

type AdminTab = 'dashboard' | 'orders' | 'menu' | 'users' | 'reservations' | 'analytics' | 'marketing' | 'media' | 'settings' | 'recommendations';

interface AdminState {
  activeTab: AdminTab;
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  orders: AdminOrder[];
  menuItems: AdminMenuItem[];
  users: AdminUser[];
  reservations: AdminReservation[];
  news: AdminNewsPost[];
  media: AdminMediaItem[];
  settings: AdminSettings;
  orderFilter: AdminOrderStatus | 'all';
  menuCategoryFilter: AdminMenuCategory | 'all';
  userSort: AdminSortField;
  reservationFilter: AdminReservationStatus | 'all';
  searchQuery: string;
  selectedItemId: string | null;
  isModalOpen: boolean;
  modalType: string | null;

  setActiveTab: (tab: AdminTab) => void;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setOrderFilter: (filter: AdminOrderStatus | 'all') => void;
  setMenuCategoryFilter: (filter: AdminMenuCategory | 'all') => void;
  setUserSort: (sort: AdminSortField) => void;
  setReservationFilter: (filter: AdminReservationStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSelectedItemId: (id: string | null) => void;
  setIsModalOpen: (open: boolean) => void;
  setModalType: (type: string | null) => void;

  updateOrderStatus: (orderId: string, status: AdminOrderStatus) => void;
  updateOrderPriority: (orderId: string, priority: AdminPriority) => void;
  addMenuItem: (item: AdminMenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<AdminMenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemAvailability: (id: string) => void;
  reorderMenuItems: (fromIndex: number, toIndex: number) => void;
  updateUserRole: (userId: string, role: AdminUserRole) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  resetUserPoints: (userId: string) => void;
  updateReservationStatus: (id: string, status: AdminReservationStatus) => void;
  assignTable: (id: string, tableNumber: number) => void;
  addNews: (post: AdminNewsPost) => void;
  updateNews: (id: string, updates: Partial<AdminNewsPost>) => void;
  deleteNews: (id: string) => void;
  addMedia: (item: AdminMediaItem) => void;
  deleteMedia: (id: string) => void;
  updateSettings: (updates: Partial<AdminSettings>) => void;

  getFilteredOrders: () => AdminOrder[];
  getFilteredMenuItems: () => AdminMenuItem[];
  getFilteredUsers: () => AdminUser[];
  getFilteredReservations: () => AdminReservation[];
  getFilteredNews: () => AdminNewsPost[];
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      activeTab: 'dashboard',
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      orders: mockAdminOrders,
      menuItems: mockAdminMenuItems,
      users: mockAdminUsers,
      reservations: mockAdminReservations,
      news: mockAdminNews,
      media: mockAdminMedia,
      settings: mockAdminSettings,
      orderFilter: 'all',
      menuCategoryFilter: 'all',
      userSort: 'newest',
      reservationFilter: 'all',
      searchQuery: '',
      selectedItemId: null,
      isModalOpen: false,
      modalType: null,

      setActiveTab: (tab) => set({ activeTab: tab, searchQuery: '', selectedItemId: null }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
      setOrderFilter: (filter) => set({ orderFilter: filter }),
      setMenuCategoryFilter: (filter) => set({ menuCategoryFilter: filter }),
      setUserSort: (sort) => set({ userSort: sort }),
      setReservationFilter: (filter) => set({ reservationFilter: filter }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedItemId: (id) => set({ selectedItemId: id }),
      setIsModalOpen: (open) => set({ isModalOpen: open }),
      setModalType: (type) => set({ modalType: type }),

      updateOrderStatus: (orderId, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)) })),

      updateOrderPriority: (orderId, priority) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, priority } : o)) })),

      addMenuItem: (item) =>
        set((s) => ({ menuItems: [item, ...s.menuItems] })),

      updateMenuItem: (id, updates) =>
        set((s) => ({ menuItems: s.menuItems.map((m) => (m.id === id ? { ...m, ...updates } : m)) })),

      deleteMenuItem: (id) =>
        set((s) => ({ menuItems: s.menuItems.filter((m) => m.id !== id) })),

      toggleMenuItemAvailability: (id) =>
        set((s) => ({ menuItems: s.menuItems.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m)) })),

      reorderMenuItems: (fromIndex, toIndex) =>
        set((s) => {
          const items = [...s.menuItems];
          if (fromIndex < 0 || fromIndex >= items.length) return { menuItems: s.menuItems };
          const [removed] = items.splice(fromIndex, 1);
          if (removed) items.splice(toIndex, 0, removed);
          return { menuItems: items };
        }),

      updateUserRole: (userId, role) =>
        set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)) })),

      blockUser: (userId) =>
        set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, isBlocked: true } : u)) })),

      unblockUser: (userId) =>
        set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, isBlocked: false } : u)) })),

      resetUserPoints: (userId) =>
        set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, loyaltyPoints: 0, loyaltyLevel: 'bronze' } : u)) })),

      updateReservationStatus: (id, status) =>
        set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, status } : r)) })),

      assignTable: (id, tableNumber) =>
        set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, tableNumber, status: 'confirmed' as const } : r)) })),

      addNews: (post) =>
        set((s) => ({ news: [post, ...s.news] })),

      updateNews: (id, updates) =>
        set((s) => ({ news: s.news.map((n) => (n.id === id ? { ...n, ...updates } : n)) })),

      deleteNews: (id) =>
        set((s) => ({ news: s.news.filter((n) => n.id !== id) })),

      addMedia: (item) =>
        set((s) => ({ media: [item, ...s.media] })),

      deleteMedia: (id) =>
        set((s) => ({ media: s.media.filter((m) => m.id !== id) })),

      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),

      getFilteredOrders: () => {
        const { orders, orderFilter, searchQuery } = get();
        let filtered = orders;
        if (orderFilter !== 'all') {
          filtered = filtered.filter((o) => o.status === orderFilter);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (o) =>
              o.id.toLowerCase().includes(q) ||
              o.userName.toLowerCase().includes(q) ||
              o.userEmail.toLowerCase().includes(q)
          );
        }
        return filtered;
      },

      getFilteredMenuItems: () => {
        const { menuItems, menuCategoryFilter, searchQuery } = get();
        let filtered = menuItems;
        if (menuCategoryFilter !== 'all') {
          filtered = filtered.filter((m) => m.category === menuCategoryFilter);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.nameAr.includes(q) ||
              m.tags.some((t) => t.includes(q))
          );
        }
        return filtered;
      },

      getFilteredUsers: () => {
        const { users, userSort, searchQuery } = get();
        let filtered = users;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.name.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q)
          );
        }
        switch (userSort) {
          case 'newest':
            filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'spending':
            filtered = [...filtered].sort((a, b) => b.totalSpent - a.totalSpent);
            break;
          case 'orders':
            filtered = [...filtered].sort((a, b) => b.totalOrders - a.totalOrders);
            break;
          case 'name':
            filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
            break;
          default:
            break;
        }
        return filtered;
      },

      getFilteredReservations: () => {
        const { reservations, reservationFilter, searchQuery } = get();
        let filtered = reservations;
        if (reservationFilter !== 'all') {
          filtered = filtered.filter((r) => r.status === reservationFilter);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.email.toLowerCase().includes(q)
          );
        }
        return filtered;
      },

      getFilteredNews: () => {
        const { news, searchQuery } = get();
        if (!searchQuery) return news;
        const q = searchQuery.toLowerCase();
        return news.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.titleAr.includes(q) ||
            n.content.toLowerCase().includes(q)
        );
      },
    }),
    {
      name: 'origin-admin-store',
      partialize: (state) => ({
        activeTab: state.activeTab,
        sidebarCollapsed: state.sidebarCollapsed,
        orders: state.orders,
        menuItems: state.menuItems,
        users: state.users,
        reservations: state.reservations,
        news: state.news,
        media: state.media,
        settings: state.settings,
        orderFilter: state.orderFilter,
        menuCategoryFilter: state.menuCategoryFilter,
        userSort: state.userSort,
        reservationFilter: state.reservationFilter,
      }),
    }
  )
);
