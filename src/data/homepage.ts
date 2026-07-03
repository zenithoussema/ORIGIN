import type { MenuCategory } from '@/data/menu';

export interface HomepageMenuItem {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  price: number;
  image: string;
  rating: number;
  category: MenuCategory;
  tags: string[];
  viewers?: number;
  ordersLast10Min?: number;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  icon: string;
  itemCount: number;
}

export interface Testimonial {
  id: string;
  name: string;
  nameAr: string;
  avatar: string;
  rating: number;
  text: string;
  textAr: string;
  date: string;
}

export interface ChefStory {
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  bio: string;
  bioAr: string;
  image: string;
  philosophy: string;
  philosophyAr: string;
}

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  labelAr: string;
  filter: string[];
}

export const featuredItems: HomepageMenuItem[] = [
  {
    id: '1',
    name: 'Wagyu Beef Tenderloin',
    nameAr: 'فيليه واغيو',
    nameFr: 'Filet de Boeuf Wagyu',
    price: 380,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop',
    rating: 4.9,
    category: 'food',
    tags: ['popular', 'chef-special'],
    viewers: 15,
    ordersLast10Min: 8,
  },
  {
    id: '2',
    name: 'Truffle Risotto',
    nameAr: 'ريزوتو الكمأة',
    nameFr: 'Risotto à la Truffe',
    price: 220,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop',
    rating: 4.8,
    category: 'food',
    tags: ['popular', 'new'],
    viewers: 12,
    ordersLast10Min: 6,
  },
  {
    id: '3',
    name: 'Lobster Thermidor',
    nameAr: 'لوبستر ثيرميدور',
    nameFr: 'Homard Thermidor',
    price: 450,
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop',
    rating: 4.9,
    category: 'food',
    tags: ['chef-special', 'premium'],
    viewers: 8,
    ordersLast10Min: 3,
  },
  {
    id: '4',
    name: 'Saffron Latte',
    nameAr: 'لاتيه الزعفران',
    nameFr: 'Latte au Safran',
    price: 35,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop',
    rating: 4.7,
    category: 'coffee',
    tags: ['popular', 'trending'],
    viewers: 22,
    ordersLast10Min: 15,
  },
  {
    id: '5',
    name: 'Crème Brûlée',
    nameAr: 'كريم بروليه',
    nameFr: 'Crème Brûlée',
    price: 65,
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&h=400&fit=crop',
    rating: 4.8,
    category: 'desserts',
    tags: ['popular'],
    viewers: 10,
    ordersLast10Min: 5,
  },
  {
    id: '6',
    name: 'Cold Brew Espresso',
    nameAr: 'كولد برو إسبريسو',
    nameFr: 'Cold Brew Espresso',
    price: 28,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop',
    rating: 4.6,
    category: 'coffee',
    tags: ['new', 'trending'],
    viewers: 18,
    ordersLast10Min: 12,
  },
  {
    id: '7',
    name: 'Mediterranean Salad',
    nameAr: 'سلطة متوسطية',
    nameFr: 'Salade Méditerranéenne',
    price: 85,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
    rating: 4.5,
    category: 'food',
    tags: ['light', 'healthy'],
    viewers: 7,
    ordersLast10Min: 4,
  },
  {
    id: '8',
    name: 'Tiramisu',
    nameAr: 'تيراميسو',
    nameFr: 'Tiramisu',
    price: 55,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop',
    rating: 4.9,
    category: 'desserts',
    tags: ['popular', 'chef-special'],
    viewers: 14,
    ordersLast10Min: 9,
  },
  {
    id: '9',
    name: 'Arabic Coffee',
    nameAr: 'قهوة عربية',
    nameFr: 'Café Arabe',
    price: 20,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=600&h=400&fit=crop',
    rating: 4.8,
    category: 'coffee',
    tags: ['popular', 'traditional'],
    viewers: 25,
    ordersLast10Min: 20,
  },
  {
    id: '10',
    name: 'Grilled Salmon',
    nameAr: 'سلمون مشوي',
    nameFr: 'Saumon Grillé',
    price: 290,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
    rating: 4.7,
    category: 'food',
    tags: ['healthy', 'premium'],
    viewers: 9,
    ordersLast10Min: 3,
  },
  {
    id: '11',
    name: 'Mango Cheesecake',
    nameAr: 'كعكة المانجو',
    nameFr: 'Gâteau au Mangue',
    price: 70,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&h=400&fit=crop',
    rating: 4.6,
    category: 'desserts',
    tags: ['new', 'seasonal'],
    viewers: 6,
    ordersLast10Min: 2,
  },
  {
    id: '12',
    name: 'Cappuccino',
    nameAr: 'كابتشينو',
    nameFr: 'Cappuccino',
    price: 25,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop',
    rating: 4.7,
    category: 'coffee',
    tags: ['popular', 'classic'],
    viewers: 20,
    ordersLast10Min: 18,
  },
];

export const categories: Category[] = [
  { id: 'coffee', name: 'Coffee', nameAr: 'القهوة', nameFr: 'Café', icon: 'coffee', itemCount: 24 },
  { id: 'food', name: 'Main Courses', nameAr: 'الأطباق الرئيسية', nameFr: 'Plats Principaux', icon: 'utensils', itemCount: 32 },
  { id: 'desserts', name: 'Desserts', nameAr: 'الحلويات', nameFr: 'Desserts', icon: 'cake', itemCount: 18 },
  { id: 'drinks', name: 'Beverages', nameAr: 'المشروبات', nameFr: 'Boissons', icon: 'glass', itemCount: 15 },
  { id: 'specials', name: 'Specials', nameAr: 'الخاصة', nameFr: 'Spécialités', icon: 'star', itemCount: 8 },
];

export const trendingItems: HomepageMenuItem[] = featuredItems.filter((item) =>
  item.tags.includes('trending') || item.tags.includes('popular')
).slice(0, 6);

export const coffeeCollection: HomepageMenuItem[] = featuredItems.filter(
  (item) => item.category === 'coffee'
);

export const chefSpecials: HomepageMenuItem[] = featuredItems.filter((item) =>
  item.tags.includes('chef-special')
);

export const dessertItems: HomepageMenuItem[] = featuredItems.filter(
  (item) => item.category === 'desserts'
);

export const newItems: HomepageMenuItem[] = featuredItems.filter((item) =>
  item.tags.includes('new')
);

export const recommendedItems: HomepageMenuItem[] = featuredItems.slice(0, 6);

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الراشد',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'An extraordinary dining experience. The Wagyu was cooked to perfection and the ambiance was simply magical.',
    textAr: 'تجربة طعام استثنائية. الواغيو كان مطبوخاً بشكل مثالي والأجواء كانت ساحرة ببساطة.',
    date: '2025-01-15',
  },
  {
    id: '2',
    name: 'Fatima Hassan',
    nameAr: 'فاطمة حسن',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'The best coffee in Sfax! The saffron latte is a must-try. Will definitely come back.',
    textAr: 'أفضل قهوة في صفاقس! لاتيه الزعفران يجب تجربته. سأعود بالتأكيد.',
    date: '2025-01-10',
  },
  {
    id: '3',
    name: 'Mohamed Ben Ali',
    nameAr: 'محمد بن علي',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Celebrated our anniversary here. The chef personally came to our table. Unforgettable experience.',
    textAr: 'احتفلنا بذكرى زواجنا هنا. الشيف جاء شخصياً إلى طاولتنا. تجربة لا تُنسى.',
    date: '2025-01-05',
  },
  {
    id: '4',
    name: 'Sara Mansour',
    nameAr: 'سارة منصور',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'The dessert collection is phenomenal. The crème brûlée rivals anything I had in Paris.',
    textAr: 'تشكيلة الحلويات مذهلة. كريم بروليه يضاهي أي شيء تذوقته في باريس.',
    date: '2024-12-28',
  },
  {
    id: '5',
    name: 'Omar Khlifi',
    nameAr: 'عمر الخليفي',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'From the moment you walk in, you feel the luxury. Every detail is thought through.',
    textAr: 'منذ لحظة دخولك، تشعر بالفخامة. كل تفصيل مدروس بعناية.',
    date: '2024-12-20',
  },
];

export const chefStory: ChefStory = {
  name: 'Chef Antonio Marchetti',
  nameAr: 'شيف أنطونيو ماركيتي',
  title: 'Executive Chef',
  titleAr: 'الشيف التنفيذي',
  bio: 'With over 20 years of culinary mastery across Michelin-starred restaurants in Milan, Paris, and Dubai, Chef Antonio brings a unique fusion of Mediterranean and Middle Eastern flavors to ORIGIN.',
  bioAr: 'بخبرة تزيد عن 20 عاماً من الإتقان الطهوي في مطاعم نجوم ميشلان في ميلانو وباري ودبي، يجلب شيف أنطونيو مزيجاً فريداً من النكهات المتوسطية والشرق أوسطية إلى أوريجين.',
  image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=800&fit=crop',
  philosophy: 'Every dish is a canvas, every ingredient tells a story. At ORIGIN, we don\'t just cook — we create memories.',
  philosophyAr: 'كل طبق لوحة فنية، كل مكون يحكي قصة. في أوريجين، لا نطبخ فحسب — نصنع ذكريات.',
};

export const moodOptions: MoodOption[] = [
  {
    id: 'energetic',
    emoji: '☀️',
    label: 'Energetic',
    labelAr: 'نشيط',
    filter: ['specials', 'premium'],
  },
  {
    id: 'relaxed',
    emoji: '🌧️',
    label: 'Relaxed',
    labelAr: 'مرتاح',
    filter: ['coffee', 'desserts'],
  },
  {
    id: 'celebrating',
    emoji: '🎉',
    label: 'Celebrating',
    labelAr: 'احتفال',
    filter: ['chef-special', 'premium'],
  },
  {
    id: 'light',
    emoji: '🤍',
    label: 'Light meal',
    labelAr: 'وجبة خفيفة',
    filter: ['light', 'healthy'],
  },
];

export const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop', caption: 'Interior Ambiance' },
  { src: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=800&fit=crop', caption: 'Coffee Art' },
  { src: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&h=400&fit=crop', caption: 'Fine Dining' },
  { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=800&fit=crop', caption: 'Chef at Work' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', caption: 'Plated Perfection' },
  { src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=800&fit=crop', caption: 'Morning Brew' },
  { src: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6c?w=600&h=400&fit=crop', caption: 'Evening Mood' },
  { src: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=800&fit=crop', caption: 'Dessert Display' },
];

export const getItemsByCategory = (category: string): HomepageMenuItem[] => {
  return featuredItems.filter((item) => item.category === category);
};

export const getItemsByMood = (moodFilter: string[]): HomepageMenuItem[] => {
  return featuredItems.filter((item) =>
    item.tags.some((tag) => moodFilter.includes(tag))
  );
};

export const getPopularItems = (limit: number = 6): HomepageMenuItem[] => {
  return [...featuredItems]
    .sort((a, b) => (b.rating * (b.viewers ?? 0)) - (a.rating * (a.viewers ?? 0)))
    .slice(0, limit);
};
