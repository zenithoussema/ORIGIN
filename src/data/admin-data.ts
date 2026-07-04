export type AdminOrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type AdminReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type AdminUserRole = 'USER' | 'ADMIN' | 'GUEST';
export type AdminMenuCategory = 'COFFEE' | 'FOOD' | 'DESSERTS' | 'BEVERAGES' | 'SPECIALS';
export type AdminPriority = 'low' | 'normal' | 'high' | 'urgent';
export type AdminMediaType = 'image' | 'video';
export type AdminNewsStatus = 'draft' | 'scheduled' | 'active' | 'expired';
export type AdminSortField = 'newest' | 'spending' | 'orders' | 'name';

export interface AdminOrderItem {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface AdminOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  status: AdminOrderStatus;
  items: AdminOrderItem[];
  total: number;
  priority: AdminPriority;
  notes: string;
}

export interface AdminMenuItem {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  price: number;
  image: string;
  video: string;
  category: AdminMenuCategory;
  isAvailable: boolean;
  tags: string[];
  orderCount: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  image: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyLevel: string;
  isBlocked: boolean;
  lastActive: string;
}

export interface AdminReservation {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  status: AdminReservationStatus;
  tableNumber: number | null;
  notes: string;
  createdAt: string;
}

export interface AdminNewsPost {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  image: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  showOnHomepage: boolean;
  status: AdminNewsStatus;
  createdAt: string;
}

export interface AdminMediaItem {
  id: string;
  name: string;
  url: string;
  type: AdminMediaType;
  size: number;
  category: string;
  createdAt: string;
}

export interface AdminActivity {
  id: string;
  type: 'order' | 'user' | 'reservation' | 'system';
  message: string;
  time: string;
  icon: string;
}

export interface AdminDashboardStats {
  totalSales: number;
  salesTrend: number;
  ordersToday: number;
  ordersTrend: number;
  activeUsers: number;
  usersTrend: number;
  avgOrderValue: number;
  avgTrend: number;
}

export interface AdminChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface AdminTopProduct {
  id: string;
  name: string;
  nameAr: string;
  image: string;
  orderCount: number;
  revenue: number;
}

export interface AdminSettings {
  restaurantName: string;
  restaurantNameAr: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  openingHours: { open: string; close: string; isOpen: boolean }[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  addressAr: string;
  currency: string;
  taxRate: number;
  deliveryFee: number;
  minOrder: number;
}

export const orderStatusConfig: Record<AdminOrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  preparing: { label: 'Preparing', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ready: { label: 'Ready', color: 'text-sage', bg: 'bg-sage-50 dark:bg-sage/10' },
  delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
};

export const reservationStatusConfig: Record<AdminReservationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  confirmed: { label: 'Confirmed', color: 'text-sage', bg: 'bg-sage-50 dark:bg-sage/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
};

export const priorityConfig: Record<AdminPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-smoke-300', bg: 'bg-smoke-100 dark:bg-smoke-400/20' },
  normal: { label: 'Normal', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  urgent: { label: 'Urgent', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
};

export const menuCategoryConfig: Record<AdminMenuCategory, { label: string; icon: string }> = {
  COFFEE: { label: 'Coffee', icon: '☕' },
  FOOD: { label: 'Food', icon: '🍽️' },
  DESSERTS: { label: 'Desserts', icon: '🍰' },
  BEVERAGES: { label: 'Beverages', icon: '🥤' },
  SPECIALS: { label: 'Specials', icon: '⭐' },
};

export const adminTags = ['spicy', 'vegan', 'bestseller', 'new', 'seasonal', 'gluten-free', 'organic', 'signature'] as const;

export const mockAdminOrders: AdminOrder[] = [
  {
    id: 'ORD-001',
    userId: 'usr_1',
    userName: 'Ahmed Al-Rashid',
    userEmail: 'ahmed@example.com',
    date: '2026-06-25T10:30:00Z',
    status: 'preparing',
    items: [
      { id: 'item_1', name: 'Signature Latte', nameAr: 'لاتيه مميز', nameFr: 'Latte Signature', price: 45, quantity: 2, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop', category: 'COFFEE' },
      { id: 'item_2', name: 'Truffle Risotto', nameAr: 'ريزوتو ترافل', nameFr: 'Risotto aux Truffes', price: 120, quantity: 1, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop', category: 'FOOD' },
    ],
    total: 210,
    priority: 'high',
    notes: 'Extra hot latte',
  },
  {
    id: 'ORD-002',
    userId: 'usr_2',
    userName: 'Sara Hassan',
    userEmail: 'sara@example.com',
    date: '2026-06-25T11:15:00Z',
    status: 'pending',
    items: [
      { id: 'item_3', name: 'Wagyu Burger', nameAr: 'برجر واغيو', nameFr: 'Burger Wagyu', price: 95, quantity: 1, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', category: 'FOOD' },
      { id: 'item_4', name: 'Matcha Latte', nameAr: 'لاتيه ماتشا', nameFr: 'Latte Matcha', price: 38, quantity: 2, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=400&fit=crop', category: 'BEVERAGES' },
    ],
    total: 171,
    priority: 'normal',
    notes: '',
  },
  {
    id: 'ORD-003',
    userId: 'usr_3',
    userName: 'Omar Abdullah',
    userEmail: 'omar@example.com',
    date: '2026-06-25T09:45:00Z',
    status: 'delivered',
    items: [
      { id: 'item_5', name: 'Espresso Tiramisu', nameAr: 'تiramisu إسبريسو', nameFr: 'Tiramisu Expresso', price: 55, quantity: 2, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop', category: 'DESSERTS' },
    ],
    total: 110,
    priority: 'normal',
    notes: '',
  },
  {
    id: 'ORD-004',
    userId: 'usr_4',
    userName: 'Fatima Al-Zahra',
    userEmail: 'fatima@example.com',
    date: '2026-06-25T12:00:00Z',
    status: 'ready',
    items: [
      { id: 'item_6', name: 'Avocado Toast', nameAr: 'توست أفوكادو', nameFr: 'Toast Avocat', price: 42, quantity: 1, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop', category: 'FOOD' },
      { id: 'item_7', name: 'Cold Brew', nameAr: 'كولد برو', nameFr: 'Cold Brew', price: 28, quantity: 1, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop', category: 'COFFEE' },
    ],
    total: 70,
    priority: 'urgent',
    notes: 'VIP customer',
  },
  {
    id: 'ORD-005',
    userId: 'usr_5',
    userName: 'Khalid Mansour',
    userEmail: 'khalid@example.com',
    date: '2026-06-24T18:30:00Z',
    status: 'cancelled',
    items: [
      { id: 'item_8', name: 'Salmon Poke Bowl', nameAr: 'بول سلمون', nameFr: 'Bol Saumon Poke', price: 78, quantity: 1, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop', category: 'FOOD' },
    ],
    total: 78,
    priority: 'low',
    notes: 'Customer cancelled',
  },
  {
    id: 'ORD-006',
    userId: 'usr_6',
    userName: 'Layla Ibrahim',
    userEmail: 'layla@example.com',
    date: '2026-06-25T13:20:00Z',
    status: 'pending',
    items: [
      { id: 'item_9', name: 'Saffron Cappuccino', nameAr: 'كابتشينو زعفران', nameFr: 'Cappuccino Safran', price: 48, quantity: 3, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop', category: 'COFFEE' },
      { id: 'item_10', name: 'Pistachio Croissant', nameAr: 'كرواسون فستق', nameFr: 'Croissant Pistache', price: 32, quantity: 2, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&h=400&fit=crop', category: 'DESSERTS' },
    ],
    total: 208,
    priority: 'normal',
    notes: '',
  },
  {
    id: 'ORD-007',
    userId: 'usr_7',
    userName: 'Yusuf Al-Qahtani',
    userEmail: 'yusuf@example.com',
    date: '2026-06-25T14:05:00Z',
    status: 'preparing',
    items: [
      { id: 'item_11', name: 'Lobster Pasta', nameAr: 'باستا لوبستر', nameFr: 'Pasta Homard', price: 185, quantity: 1, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop', category: 'FOOD' },
    ],
    total: 185,
    priority: 'high',
    notes: 'Anniversary dinner',
  },
];

export const mockAdminMenuItems: AdminMenuItem[] = [
  { id: 'mi_1', name: 'Signature Latte', nameAr: 'لاتيه مميز', nameFr: 'Latte Signature', description: 'Our signature latte with a unique blend', descriptionAr: 'لاتيه مميز بمزيج فريد', descriptionFr: 'Notre latte signature avec un mélange unique', price: 45, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop', video: '', category: 'COFFEE', isAvailable: true, tags: ['bestseller', 'signature'], orderCount: 342, createdAt: '2026-01-15T00:00:00Z' },
  { id: 'mi_2', name: 'Truffle Risotto', nameAr: 'ريزوتو ترافل', nameFr: 'Risotto aux Truffes', description: 'Creamy risotto with black truffle shavings', descriptionAr: 'ريزوتو كريمي مع شرائح الترافل الأسود', descriptionFr: 'Risotto crémeux aux éclats de truffe noire', price: 120, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop', video: '', category: 'FOOD', isAvailable: true, tags: ['bestseller'], orderCount: 218, createdAt: '2026-01-20T00:00:00Z' },
  { id: 'mi_3', name: 'Wagyu Burger', nameAr: 'برجر واغيو', nameFr: 'Burger Wagyu', description: 'Premium wagyu beef with artisan bun', descriptionAr: 'لحم واغيو فاخر مع خبز صناعي', descriptionFr: 'Bœuf wagyu premium avec bun artisanal', price: 95, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', video: '', category: 'FOOD', isAvailable: true, tags: ['bestseller'], orderCount: 189, createdAt: '2026-02-01T00:00:00Z' },
  { id: 'mi_4', name: 'Matcha Latte', nameAr: 'لاتيه ماتشا', nameFr: 'Latte Matcha', description: 'Premium Japanese matcha with oat milk', descriptionAr: 'ماتشا يابانية فاخرة مع حليب الشوفان', descriptionFr: 'Matcha japonaise premium avec lait d\'avoine', price: 38, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=400&fit=crop', video: '', category: 'BEVERAGES', isAvailable: true, tags: ['vegan', 'new'], orderCount: 156, createdAt: '2026-03-10T00:00:00Z' },
  { id: 'mi_5', name: 'Espresso Tiramisu', nameAr: 'تiramisu إسبريسو', nameFr: 'Tiramisu Expresso', description: 'Classic tiramisu with our house espresso', descriptionAr: 'تiramisu كلاسيكي بإسبريسو المنزل', descriptionFr: 'Tiramisu classique avec notre expresso maison', price: 55, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop', video: '', category: 'DESSERTS', isAvailable: true, tags: ['bestseller'], orderCount: 267, createdAt: '2026-01-25T00:00:00Z' },
  { id: 'mi_6', name: 'Avocado Toast', nameAr: 'توست أفوكادو', nameFr: 'Toast Avocat', description: 'Sourdough toast with fresh avocado and poached egg', descriptionAr: 'توست صاجع مع أفوكادو طازج وبيض مسلوق', descriptionFr: 'Toast au levain avec avocat frais et œuf poché', price: 42, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop', video: '', category: 'FOOD', isAvailable: true, tags: ['vegan', 'new'], orderCount: 134, createdAt: '2026-04-05T00:00:00Z' },
  { id: 'mi_7', name: 'Cold Brew', nameAr: 'كولد برو', nameFr: 'Cold Brew', description: '24-hour cold brew with vanilla notes', descriptionAr: 'كولد برو 24 ساعة مع نكهات الفانيليا', descriptionFr: 'Cold brew 24 heures aux notes de vanille', price: 28, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop', video: '', category: 'COFFEE', isAvailable: true, tags: ['bestseller'], orderCount: 298, createdAt: '2026-02-15T00:00:00Z' },
  { id: 'mi_8', name: 'Saffron Cappuccino', nameAr: 'كابتشينو زعفران', nameFr: 'Cappuccino Safran', description: 'Traditional cappuccino infused with saffron', descriptionAr: 'كابتشينو تقليدي معزعفران', descriptionFr: 'Cappuccino traditionnel infusé au safran', price: 48, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop', video: '', category: 'COFFEE', isAvailable: true, tags: ['signature', 'spicy'], orderCount: 187, createdAt: '2026-01-30T00:00:00Z' },
  { id: 'mi_9', name: 'Salmon Poke Bowl', nameAr: 'بول سلمون', nameFr: 'Bol Saumon Poke', description: 'Fresh salmon with sushi rice and avocado', descriptionAr: 'سلمون طازج مع أرز السوشي والأفوكادو', descriptionFr: 'Saumon frais avec riz sushi et avocat', price: 78, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop', video: '', category: 'FOOD', isAvailable: true, tags: ['gluten-free'], orderCount: 145, createdAt: '2026-03-20T00:00:00Z' },
  { id: 'mi_10', name: 'Pistachio Croissant', nameAr: 'كرواسون فستق', nameFr: 'Croissant Pistache', description: 'Buttery croissant filled with pistachio cream', descriptionAr: 'كرواسون بالزبدة محشو بكريم الفستق', descriptionFr: 'Croissant au beurre farci de crème de pistache', price: 32, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&h=400&fit=crop', video: '', category: 'DESSERTS', isAvailable: true, tags: ['new'], orderCount: 176, createdAt: '2026-05-01T00:00:00Z' },
  { id: 'mi_11', name: 'Lobster Pasta', nameAr: 'باستا لوبستر', nameFr: 'Pasta Homard', description: 'Fresh pasta with butter-poached lobster', descriptionAr: 'باستا طازجة مع لوبستر بالزبدة', descriptionFr: 'Pâtes fraîches au homard poché au beurre', price: 185, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop', video: '', category: 'FOOD', isAvailable: false, tags: ['signature'], orderCount: 98, createdAt: '2026-02-10T00:00:00Z' },
  { id: 'mi_12', name: 'Chocolate Fondant', nameAr: 'شوكولاتة فوندان', nameFr: 'Fondant au Chocolat', description: 'Molten chocolate cake with vanilla ice cream', descriptionAr: 'كعكة شوكولاتة ذائبة مع آيس كريم الفانيليا', descriptionFr: 'Gâteau au chocolat fondant avec glace à la vanille', price: 65, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop', video: '', category: 'DESSERTS', isAvailable: true, tags: ['bestseller'], orderCount: 223, createdAt: '2026-01-18T00:00:00Z' },
];

export const mockAdminUsers: AdminUser[] = [
  { id: 'usr_1', name: 'Ahmed Al-Rashid', email: 'ahmed@example.com', role: 'ADMIN', image: '', createdAt: '2025-12-01T00:00:00Z', totalOrders: 45, totalSpent: 8920, loyaltyPoints: 720, loyaltyLevel: 'platinum', isBlocked: false, lastActive: '2026-06-25T14:00:00Z' },
  { id: 'usr_2', name: 'Sara Hassan', email: 'sara@example.com', role: 'USER', image: '', createdAt: '2026-01-15T00:00:00Z', totalOrders: 32, totalSpent: 5680, loyaltyPoints: 340, loyaltyLevel: 'gold', isBlocked: false, lastActive: '2026-06-25T11:15:00Z' },
  { id: 'usr_3', name: 'Omar Abdullah', email: 'omar@example.com', role: 'USER', image: '', createdAt: '2026-02-20T00:00:00Z', totalOrders: 28, totalSpent: 4200, loyaltyPoints: 280, loyaltyLevel: 'silver', isBlocked: false, lastActive: '2026-06-25T09:45:00Z' },
  { id: 'usr_4', name: 'Fatima Al-Zahra', email: 'fatima@example.com', role: 'USER', image: '', createdAt: '2026-03-10T00:00:00Z', totalOrders: 19, totalSpent: 3150, loyaltyPoints: 190, loyaltyLevel: 'silver', isBlocked: false, lastActive: '2026-06-25T12:00:00Z' },
  { id: 'usr_5', name: 'Khalid Mansour', email: 'khalid@example.com', role: 'USER', image: '', createdAt: '2026-04-05T00:00:00Z', totalOrders: 12, totalSpent: 1890, loyaltyPoints: 120, loyaltyLevel: 'bronze', isBlocked: true, lastActive: '2026-06-24T18:30:00Z' },
  { id: 'usr_6', name: 'Layla Ibrahim', email: 'layla@example.com', role: 'USER', image: '', createdAt: '2026-04-18T00:00:00Z', totalOrders: 8, totalSpent: 1240, loyaltyPoints: 80, loyaltyLevel: 'bronze', isBlocked: false, lastActive: '2026-06-25T13:20:00Z' },
  { id: 'usr_7', name: 'Yusuf Al-Qahtani', email: 'yusuf@example.com', role: 'USER', image: '', createdAt: '2026-05-01T00:00:00Z', totalOrders: 5, totalSpent: 870, loyaltyPoints: 50, loyaltyLevel: 'bronze', isBlocked: false, lastActive: '2026-06-25T14:05:00Z' },
  { id: 'usr_8', name: 'Noura Al-Harbi', email: 'noura@example.com', role: 'USER', image: '', createdAt: '2026-05-15T00:00:00Z', totalOrders: 3, totalSpent: 420, loyaltyPoints: 30, loyaltyLevel: 'bronze', isBlocked: false, lastActive: '2026-06-20T10:00:00Z' },
];

export const mockAdminReservations: AdminReservation[] = [
  { id: 'res_1', userId: 'usr_1', name: 'Ahmed Al-Rashid', email: 'ahmed@example.com', date: '2026-06-25', time: '19:00', guests: 4, status: 'confirmed', tableNumber: 7, notes: 'Window seat preferred', createdAt: '2026-06-20T10:00:00Z' },
  { id: 'res_2', userId: 'usr_2', name: 'Sara Hassan', email: 'sara@example.com', date: '2026-06-25', time: '20:30', guests: 2, status: 'confirmed', tableNumber: 3, notes: '', createdAt: '2026-06-21T14:30:00Z' },
  { id: 'res_3', userId: 'usr_3', name: 'Omar Abdullah', email: 'omar@example.com', date: '2026-06-26', time: '18:00', guests: 6, status: 'pending', tableNumber: null, notes: 'Birthday celebration, need cake', createdAt: '2026-06-22T09:00:00Z' },
  { id: 'res_4', userId: null, name: 'Guest User', email: 'guest@example.com', date: '2026-06-26', time: '20:00', guests: 3, status: 'pending', tableNumber: null, notes: '', createdAt: '2026-06-23T16:00:00Z' },
  { id: 'res_5', userId: 'usr_4', name: 'Fatima Al-Zahra', email: 'fatima@example.com', date: '2026-06-24', time: '19:30', guests: 2, status: 'completed', tableNumber: 5, notes: '', createdAt: '2026-06-19T11:00:00Z' },
  { id: 'res_6', userId: 'usr_5', name: 'Khalid Mansour', email: 'khalid@example.com', date: '2026-06-23', time: '21:00', guests: 4, status: 'cancelled', tableNumber: null, notes: 'Cancelled by customer', createdAt: '2026-06-18T08:00:00Z' },
];

export const mockAdminNews: AdminNewsPost[] = [
  { id: 'news_1', title: 'Summer Special Menu', titleAr: 'قائمة الصيف الخاصة', content: 'Experience our new summer collection featuring refreshing cold brews and tropical desserts.', contentAr: 'استمتع بمجموعتنا الصيفية الجديدة', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop', startDate: '2026-06-01', endDate: '2026-08-31', isActive: true, showOnHomepage: true, status: 'active', createdAt: '2026-05-25T00:00:00Z' },
  { id: 'news_2', title: 'VIP Loyalty Program Launch', titleAr: 'إطلاق برنامج الولاء المميز', content: 'Join our exclusive loyalty program and earn points with every order.', contentAr: 'انضم لبرنامج الولاء الحصري واكسب نقاطاً مع كل طلب', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop', startDate: '2026-06-15', endDate: '2026-12-31', isActive: true, showOnHomepage: true, status: 'active', createdAt: '2026-06-10T00:00:00Z' },
  { id: 'news_3', title: 'Private Dining Experience', titleAr: 'تجربة الطعام الخاصة', content: 'Book our private dining room for special occasions.', contentAr: 'احجز غرفة الطعام الخاصة للمناسبات الخاصة', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', startDate: '2026-07-01', endDate: '2026-07-31', isActive: false, showOnHomepage: false, status: 'scheduled', createdAt: '2026-06-20T00:00:00Z' },
];

export const mockAdminMedia: AdminMediaItem[] = [
  { id: 'media_1', name: 'latte.jpg', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop', type: 'image', size: 245000, category: 'menu', createdAt: '2026-01-15T00:00:00Z' },
  { id: 'media_2', name: 'risotto.jpg', url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop', type: 'image', size: 312000, category: 'menu', createdAt: '2026-01-20T00:00:00Z' },
  { id: 'media_3', name: 'summer.jpg', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop', type: 'image', size: 520000, category: 'promotion', createdAt: '2026-05-25T00:00:00Z' },
  { id: 'media_4', name: 'hero.mp4', url: '/videos/hero.mp4', type: 'video', size: 2400000, category: 'homepage', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'media_5', name: 'loyalty.jpg', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop', type: 'image', size: 180000, category: 'promotion', createdAt: '2026-06-10T00:00:00Z' },
  { id: 'media_6', name: 'private-dining.jpg', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', type: 'image', size: 445000, category: 'homepage', createdAt: '2026-06-20T00:00:00Z' },
];

export const mockDashboardStats: AdminDashboardStats = {
  totalSales: 127450,
  salesTrend: 12.5,
  ordersToday: 47,
  ordersTrend: 8.3,
  activeUsers: 342,
  usersTrend: 15.2,
  avgOrderValue: 168,
  avgTrend: -2.1,
};

export const mockChartData: AdminChartData[] = [
  { date: 'Jun 19', revenue: 8200, orders: 52 },
  { date: 'Jun 20', revenue: 9100, orders: 58 },
  { date: 'Jun 21', revenue: 7800, orders: 49 },
  { date: 'Jun 22', revenue: 11200, orders: 71 },
  { date: 'Jun 23', revenue: 10500, orders: 67 },
  { date: 'Jun 24', revenue: 12100, orders: 76 },
  { date: 'Jun 25', revenue: 9800, orders: 47 },
];

export const mockTopProducts: AdminTopProduct[] = [
  { id: 'mi_1', name: 'Signature Latte', nameAr: 'لاتيه مميز', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop', orderCount: 342, revenue: 15390 },
  { id: 'mi_7', name: 'Cold Brew', nameAr: 'كولد برو', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop', orderCount: 298, revenue: 8344 },
  { id: 'mi_5', name: 'Espresso Tiramisu', nameAr: 'تiramisu إسبريسو', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop', orderCount: 267, revenue: 14685 },
  { id: 'mi_12', name: 'Chocolate Fondant', nameAr: 'شوكولاتة فوندان', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop', orderCount: 223, revenue: 14495 },
  { id: 'mi_2', name: 'Truffle Risotto', nameAr: 'ريزوتو ترافل', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop', orderCount: 218, revenue: 26160 },
];

export const mockActivityFeed: AdminActivity[] = [
  { id: 'act_1', type: 'order', message: 'New order #ORD-007 from Yusuf Al-Qahtani', time: '2 minutes ago', icon: '🛒' },
  { id: 'act_2', type: 'reservation', message: 'New reservation from Omar Abdullah for 6 guests', time: '15 minutes ago', icon: '📅' },
  { id: 'act_3', type: 'order', message: 'Order #ORD-004 is ready for pickup', time: '25 minutes ago', icon: '✅' },
  { id: 'act_4', type: 'user', message: 'New user registered: Noura Al-Harbi', time: '1 hour ago', icon: '👤' },
  { id: 'act_5', type: 'system', message: 'Lobster Pasta marked as unavailable', time: '2 hours ago', icon: '⚠️' },
  { id: 'act_6', type: 'order', message: 'Order #ORD-003 delivered successfully', time: '3 hours ago', icon: '🎉' },
];

export const mockAdminSettings: AdminSettings = {
  restaurantName: 'ORIGIN',
  restaurantNameAr: 'أوريجين',
  logo: '/logo.png',
  primaryColor: '#C8882A',
  secondaryColor: '#1C0A00',
  openingHours: [
    { open: '07:00', close: '23:00', isOpen: true },
    { open: '07:00', close: '23:00', isOpen: true },
    { open: '07:00', close: '23:00', isOpen: true },
    { open: '07:00', close: '23:00', isOpen: true },
    { open: '07:00', close: '00:00', isOpen: true },
    { open: '08:00', close: '00:00', isOpen: true },
    { open: '08:00', close: '22:00', isOpen: true },
  ],
  contactEmail: 'hello@origin.tn',
  contactPhone: '+216 71 123 456',
  address: 'Avenue Habib Bourguiba, Tunis, Tunisia',
  addressAr: 'شارع الحبيب بورقيبة، تونس، تونس',
  currency: 'TND',
  taxRate: 15,
  deliveryFee: 15,
  minOrder: 50,
};
