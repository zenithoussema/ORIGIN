export interface CartItem {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  addedAt: number;
}

export type CartItemInput = Omit<CartItem, 'quantity' | 'addedAt'>;

export interface CartTotals {
  subtotal: number;
  itemCount: number;
  uniqueItems: number;
}

export function computeTotals(items: readonly CartItem[]): CartTotals {
  let subtotal = 0;
  let itemCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    subtotal += item.price * item.quantity;
    itemCount += item.quantity;
  }

  return {
    subtotal,
    itemCount,
    uniqueItems: items.length,
  };
}

export function getCartItemName(item: CartItem, locale: string): string {
  if (locale === 'ar') return item.nameAr;
  if (locale === 'fr') return item.nameFr;
  return item.name;
}

export function findCartItem(items: readonly CartItem[], id: string): CartItem | undefined {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return items[i];
  }
  return undefined;
}
