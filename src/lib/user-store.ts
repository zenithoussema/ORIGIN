import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile,
  Order,
  OrderStatus,
  FavoriteItem,
  Reservation,
  ReservationStatus,
  LoyaltyReward,
  UserSettings,
} from '@/data/user-profile';
import {
  mockUserProfile,
  mockOrders,
  mockFavorites,
  mockReservations,
  mockLoyaltyRewards,
} from '@/data/user-profile';
import { useCartStore } from '@/lib/cart-store';

interface UserState {
  profile: UserProfile;
  orders: Order[];
  favorites: FavoriteItem[];
  reservations: Reservation[];
  loyaltyRewards: LoyaltyReward[];
  settings: UserSettings;
  activeTab: string;

  setActiveTab: (tab: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;

  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  reorder: (orderId: string) => void;
  filterOrders: (status: OrderStatus | 'all') => Order[];

  cancelReservation: (id: string) => void;

  addLoyaltyPoints: (points: number) => void;
  redeemReward: (rewardId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: mockUserProfile,
      orders: mockOrders,
      favorites: mockFavorites,
      reservations: mockReservations,
      loyaltyRewards: mockLoyaltyRewards,
      settings: {
        name: mockUserProfile.name,
        email: mockUserProfile.email,
        language: 'en',
        theme: 'dark',
      },
      activeTab: 'dashboard',

      setActiveTab: (tab) => set({ activeTab: tab }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
          settings: {
            ...state.settings,
            ...(updates.name && { name: updates.name }),
            ...(updates.email && { email: updates.email }),
          },
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
          profile: {
            ...state.profile,
            ...(updates.name && { name: updates.name }),
            ...(updates.email && { email: updates.email }),
          },
        })),

      addFavorite: (item) =>
        set((state) => {
          const exists = state.favorites.some((f) => f.id === item.id);
          if (exists) return state;
          const newItem: FavoriteItem = { ...item, id: item.id };
          return {
            favorites: [...state.favorites, newItem],
            profile: { ...state.profile, favoriteCount: state.favorites.length + 1 },
          };
        }),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
          profile: { ...state.profile, favoriteCount: Math.max(0, state.favorites.length - 1) },
        })),

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      reorder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;
        const addItem = useCartStore.getState().addItem;
        order.items.forEach((item) => {
          for (let i = 0; i < item.quantity; i++) {
            addItem({
              id: item.id,
              name: item.name,
              nameAr: item.nameAr,
              nameFr: item.nameFr,
              price: item.price,
              image: item.image,
              category: item.category,
            });
          }
        });
      },

      filterOrders: (status) => {
        const { orders } = get();
        if (status === 'all') return orders;
        return orders.filter((o) => o.status === status);
      },

      cancelReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' as ReservationStatus } : r
          ),
        })),

      addLoyaltyPoints: (points) =>
        set((state) => ({
          profile: { ...state.profile, loyaltyPoints: state.profile.loyaltyPoints + points },
        })),

      redeemReward: (rewardId) =>
        set((state) => {
          const reward = state.loyaltyRewards.find((r) => r.id === rewardId);
          if (!reward || reward.isUnlocked) return state;
          if (state.profile.loyaltyPoints < reward.pointsRequired) return state;
          return {
            profile: {
              ...state.profile,
              loyaltyPoints: state.profile.loyaltyPoints - reward.pointsRequired,
            },
            loyaltyRewards: state.loyaltyRewards.map((r) =>
              r.id === rewardId ? { ...r, isUnlocked: true } : r
            ),
          };
        }),
    }),
    {
      name: 'origin-user-profile',
      partialize: (state) => ({
        favorites: state.favorites,
        settings: state.settings,
        loyaltyRewards: state.loyaltyRewards,
      }),
    }
  )
);
