import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { computeTotals, findCartItem, type CartItem, type CartItemInput } from '@/lib/cart-utils';

interface CartState {
  items: CartItem[];
  _hydrated: boolean;

  addItem: (item: CartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  clearCart: () => void;
  getItem: (id: string) => CartItem | undefined;
  getTotals: () => { subtotal: number; itemCount: number; uniqueItems: number };
  setHydrated: (value: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,

      addItem: (item) =>
        set((state) => {
          const existing = findCartItem(state.items, item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1, addedAt: Date.now() } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1, addedAt: Date.now() }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(quantity, 99) } : i
            ),
          };
        }),

      incrementItem: (id) =>
        set((state) => {
          const item = findCartItem(state.items, id);
          if (!item || item.quantity >= 99) return state;
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }),

      decrementItem: (id) =>
        set((state) => {
          const item = findCartItem(state.items, id);
          if (!item) return state;
          if (item.quantity <= 1) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity - 1 } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getItem: (id) => findCartItem(get().items, id),

      getTotals: () => computeTotals(get().items),

      setHydrated: (value) => set({ _hydrated: value }),
    }),
    {
      name: 'origin-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
