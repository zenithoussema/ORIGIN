export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type LoyaltyLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface OrderItem {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

export interface FavoriteItem {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  price: number;
  image: string;
  category: string;
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  name: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  pointsRequired: number;
  type: 'discount' | 'free_item' | 'priority';
  icon: string;
  isUnlocked: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  loyaltyPoints: number;
  loyaltyLevel: LoyaltyLevel;
  memberSince: string;
  totalOrders: number;
  totalSpent: number;
  favoriteCount: number;
}

export interface UserSettings {
  name: string;
  email: string;
  language: string;
  theme: string;
}

export const loyaltyLevels: Record<LoyaltyLevel, { min: number; max: number; label: string; color: string; gradient: string }> = {
  bronze: { min: 0, max: 100, label: 'Bronze', color: 'text-amber-600', gradient: 'from-amber-700 to-amber-500' },
  silver: { min: 100, max: 300, label: 'Silver', color: 'text-gray-400', gradient: 'from-gray-500 to-gray-300' },
  gold: { min: 300, max: 700, label: 'Gold', color: 'text-yellow-500', gradient: 'from-yellow-600 to-yellow-400' },
  platinum: { min: 700, max: Infinity, label: 'Platinum', color: 'text-purple-400', gradient: 'from-purple-600 to-purple-400' },
};

export function getLoyaltyLevel(points: number): LoyaltyLevel {
  if (points >= 700) return 'platinum';
  if (points >= 300) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
}

export function getProgressToNextLevel(points: number): number {
  const level = getLoyaltyLevel(points);
  const config = loyaltyLevels[level];
  if (level === 'platinum') return 100;
  const range = config.max - config.min;
  const progress = points - config.min;
  return Math.min(100, Math.round((progress / range) * 100));
}

export function getNextLevel(level: LoyaltyLevel): LoyaltyLevel | null {
  if (level === 'bronze') return 'silver';
  if (level === 'silver') return 'gold';
  if (level === 'gold') return 'platinum';
  return null;
}

export const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  preparing: { label: 'Preparing', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ready: { label: 'Ready', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
};

export const reservationStatusConfig: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  confirmed: { label: 'Confirmed', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  completed: { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
};

export const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    date: '2024-12-20',
    status: 'delivered',
    total: 185,
    items: [
      { id: 'c1', name: 'Arabic Coffee', nameAr: 'قهوة عربية', nameFr: 'Café Arabe', price: 20, quantity: 2, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=200', category: 'coffee' },
      { id: 'c5', name: 'Wagyu Beef Tenderloin', nameAr: 'فيليه واغيو', nameFr: 'Filet de Boeuf Wagyu', price: 380, quantity: 1, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200', category: 'food' },
    ],
  },
  {
    id: 'ORD-2024-002',
    date: '2024-12-18',
    status: 'delivered',
    total: 137,
    items: [
      { id: 'c2', name: 'Saffron Latte', nameAr: 'لاتيه الزعفران', nameFr: 'Latte au Safran', price: 35, quantity: 2, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200', category: 'coffee' },
      { id: 'c12', name: 'Tiramisu', nameAr: 'تيراميسو', nameFr: 'Tiramisu', price: 55, quantity: 1, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200', category: 'desserts' },
    ],
  },
  {
    id: 'ORD-2024-003',
    date: '2024-12-15',
    status: 'preparing',
    total: 310,
    items: [
      { id: 'c7', name: 'Lobster Thermidor', nameAr: 'لوبستر ثيرميدور', nameFr: 'Homard Thermidor', price: 450, quantity: 1, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200', category: 'food' },
      { id: 'c15', name: 'Mojito', nameAr: 'موهيتو', nameFr: 'Mojito', price: 32, quantity: 2, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200', category: 'drinks' },
    ],
  },
  {
    id: 'ORD-2024-004',
    date: '2024-12-10',
    status: 'cancelled',
    total: 65,
    items: [
      { id: 'c11', name: 'Crème Brûlée', nameAr: 'كريم بروليه', nameFr: 'Crème Brûlée', price: 65, quantity: 1, image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=200', category: 'desserts' },
    ],
  },
];

export const mockFavorites: FavoriteItem[] = [
  { id: 'c5', name: 'Wagyu Beef Tenderloin', nameAr: 'فيليه واغيو', nameFr: 'Filet de Boeuf Wagyu', price: 380, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'food' },
  { id: 'c2', name: 'Saffron Latte', nameAr: 'لاتيه الزعفران', nameFr: 'Latte au Safran', price: 35, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', category: 'coffee' },
  { id: 'c12', name: 'Tiramisu', nameAr: 'تيراميسو', nameFr: 'Tiramisu', price: 55, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', category: 'desserts' },
  { id: 'c7', name: 'Lobster Thermidor', nameAr: 'لوبستر ثيرميدور', nameFr: 'Homard Thermidor', price: 450, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400', category: 'food' },
  { id: 'c17', name: 'Matcha Latte', nameAr: 'لاتيه الماتشا', nameFr: 'Latte Matcha', price: 32, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', category: 'coffee' },
];

export const mockReservations: Reservation[] = [
  { id: 'RES-001', date: '2024-12-28', time: '8:00 PM', guests: 4, status: 'confirmed', name: 'Ahmed Al-Rashid' },
  { id: 'RES-002', date: '2024-12-15', time: '7:30 PM', guests: 2, status: 'completed', name: 'Ahmed Al-Rashid' },
  { id: 'RES-003', date: '2024-11-20', time: '9:00 PM', guests: 6, status: 'completed', name: 'Ahmed Al-Rashid' },
];

export const mockLoyaltyRewards: LoyaltyReward[] = [
  { id: 'r1', name: '10% Off Next Order', nameAr: 'خصم 10% على الطلب التالي', description: 'Get 10% off your next order of any size.', pointsRequired: 50, type: 'discount', icon: '🏷️', isUnlocked: true },
  { id: 'r2', name: 'Free Arabic Coffee', nameAr: 'قهوة عربية مجانية', description: 'Enjoy a complimentary Arabic Coffee on us.', pointsRequired: 100, type: 'free_item', icon: '☕', isUnlocked: true },
  { id: 'r3', name: 'Priority Ordering', nameAr: 'طلب أولوية', description: 'Skip the queue with priority order processing.', pointsRequired: 200, type: 'priority', icon: '⚡', isUnlocked: false },
  { id: 'r4', name: 'Free Dessert', nameAr: 'حلوى مجانية', description: 'Choose any dessert from our premium selection.', pointsRequired: 350, type: 'free_item', icon: '🍰', isUnlocked: false },
  { id: 'r5', name: '20% Off', nameAr: 'خصم 20%', description: 'Enjoy 20% off any order up to 500 DT.', pointsRequired: 500, type: 'discount', icon: '🎉', isUnlocked: false },
  { id: 'r6', name: 'Chef\'s Table Experience', nameAr: 'تجربة طاولة الشيف', description: 'Exclusive chef\'s table dinner for two.', pointsRequired: 1000, type: 'free_item', icon: '👨‍🍳', isUnlocked: false },
];

export const mockUserProfile: UserProfile = {
  id: 'usr_1',
  name: 'Ahmed Al-Rashid',
  email: 'ahmed@example.com',
  role: 'USER',
  loyaltyPoints: 245,
  loyaltyLevel: 'silver',
  memberSince: '2024-03-15',
  totalOrders: 12,
  totalSpent: 2450,
  favoriteCount: 5,
};
