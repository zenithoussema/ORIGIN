export type MenuCategory = 'coffee' | 'food' | 'desserts' | 'drinks' | 'beverages' | 'specials';

export type MenuTag = 'vegan' | 'spicy' | 'popular' | 'new' | 'gluten-free' | 'chef-special' | 'light' | 'premium';

export type SortOption = 'relevance' | 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

export interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  price: number;
  image: string;
  category: MenuCategory;
  tags: MenuTag[];
  rating: number;
  reviewCount: number;
  prepTime: number;
  calories?: number;
  ingredients: string[];
  ingredientsAr: string[];
  allergens: string[];
  popularity: number;
  isAvailable: boolean;
  isNew: boolean;
  createdAt: string;
}

export interface MenuCategoryInfo {
  id: MenuCategory;
  name: string;
  nameAr: string;
  nameFr: string;
  emoji: string;
}

export const menuCategories: MenuCategoryInfo[] = [
  { id: 'coffee', name: 'Coffee', nameAr: 'القهوة', nameFr: 'Café', emoji: '☕' },
  { id: 'food', name: 'Food', nameAr: 'الطعام', nameFr: 'Nourriture', emoji: '🍽️' },
  { id: 'desserts', name: 'Desserts', nameAr: 'الحلويات', nameFr: 'Desserts', emoji: '🍰' },
  { id: 'drinks', name: 'Drinks', nameAr: 'المشروبات', nameFr: 'Boissons', emoji: '🥤' },
];

export const menuItems: MenuItem[] = [
  {
    id: 'c1',
    name: 'Arabic Coffee',
    nameAr: 'قهوة عربية',
    nameFr: 'Café Arabe',
    description: 'Traditional Arabic coffee with cardamom and saffron, served in a dallah.',
    descriptionAr: 'قهوة عربية تقليدية بالهيل والزعفران، تُقدَّم في دلة.',
    descriptionFr: 'Café arabe traditionnel à la cardamome et au safran, servi dans une dallah.',
    price: 20,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=600&h=400&fit=crop',
    category: 'coffee',
    tags: ['popular'],
    rating: 4.8,
    reviewCount: 342,
    prepTime: 5,
    calories: 15,
    ingredients: ['Arabic coffee beans', 'Cardamom', 'Saffron', 'Rose water'],
    ingredientsAr: ['بن عربي', 'هيل', 'زعفران', 'ماء ورد'],
    allergens: [],
    isAvailable: true,
    isNew: false,
    popularity: 92,
    createdAt: '2024-01-01',
  },
  {
    id: 'c2',
    name: 'Saffron Latte',
    nameAr: 'لاتيه الزعفران',
    nameFr: 'Latte au Safran',
    description: 'Premium latte infused with Iranian saffron and topped with gold dust.',
    descriptionAr: 'لاتيه فاخر مُنتَج بالزعفران الإيراني ومُزيَّن بطبقة ذهبية.',
    descriptionFr: 'Latte premium infusé au safran iranien et saupoudré de poudre dorée.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop',
    category: 'coffee',
    tags: ['popular', 'chef-special'],
    rating: 4.9,
    reviewCount: 287,
    prepTime: 7,
    calories: 180,
    ingredients: ['Espresso', 'Steamed milk', 'Saffron', 'Gold dust', 'Vanilla'],
    ingredientsAr: ['إسبريسو', 'حليب مخيوط', 'زعفران', 'غبار ذهبي', 'فانيليا'],
    allergens: ['Milk'],
    isAvailable: true,
    isNew: false,
    popularity: 94,
    createdAt: '2024-01-15',
  },
  {
    id: 'c3',
    name: 'Cold Brew Espresso',
    nameAr: 'كولد برو إسبريسو',
    nameFr: 'Cold Brew Espresso',
    description: '24-hour cold brew with a double shot of espresso. Smooth and bold.',
    descriptionAr: 'كولد برو لمدة 24 ساعة مع شوت مزدوج من الإسبريسو. ناعم وجريء.',
    descriptionFr: 'Cold brew de 24 heures avec un double shot d\'espresso. Doux et audacieux.',
    price: 28,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop',
    category: 'coffee',
    tags: ['new', 'popular'],
    rating: 4.7,
    reviewCount: 198,
    prepTime: 3,
    calories: 10,
    ingredients: ['Cold brew coffee', 'Double espresso', 'Ice'],
    ingredientsAr: ['قهوة كولد برو', 'إسبريسو مزدوج', 'ثلج'],
    allergens: [],
    isAvailable: true,
    isNew: true,
    popularity: 85,
    createdAt: '2025-01-10',
  },
  {
    id: 'c4',
    name: 'Cappuccino',
    nameAr: 'كابتشينو',
    nameFr: 'Cappuccino',
    description: 'Classic Italian cappuccino with velvety microfoam.',
    descriptionAr: 'كابتشينو إيطالي كلاسيكي بزبدة رغوة ناعمة.',
    descriptionFr: 'Cappuccino italien classique à la mousse de lait velvet.',
    price: 25,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop',
    category: 'coffee',
    tags: ['popular'],
    rating: 4.6,
    reviewCount: 456,
    prepTime: 5,
    calories: 150,
    ingredients: ['Espresso', 'Steamed milk', 'Milk foam'],
    ingredientsAr: ['إسبريسو', 'حليب مخيوط', 'رغوة حليب'],
    allergens: ['Milk'],
    isAvailable: true,
    isNew: false,
    popularity: 88,
    createdAt: '2024-01-01',
  },
  {
    id: 'c5',
    name: 'Wagyu Beef Tenderloin',
    nameAr: 'فيليه واغيو',
    nameFr: 'Filet de Boeuf Wagyu',
    description: 'A5 Japanese Wagyu, pan-seared to perfection, served with truffle jus.',
    descriptionAr: 'واغيو ياباني درجة A5، مقلي في المقلاة بعناية، يُقدَّم مع صلصة الكمأة.',
    descriptionFr: 'Wagyu japonais A5, poêlé à la perfection, servi avec jus de truffe.',
    price: 380,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop',
    category: 'food',
    tags: ['chef-special', 'popular'],
    rating: 4.9,
    reviewCount: 156,
    prepTime: 25,
    calories: 650,
    ingredients: ['A5 Wagyu beef', 'Truffle jus', 'Asparagus', 'Potato purée'],
    ingredientsAr: ['لحم واغيو A5', 'صلصة الكمأة', 'سبانخ', 'هريسة بطاطا'],
    allergens: ['Dairy'],
    isAvailable: true,
    isNew: false,
    popularity: 89,
    createdAt: '2024-01-01',
  },
  {
    id: 'c6',
    name: 'Truffle Risotto',
    nameAr: 'ريزوتو الكمأة',
    nameFr: 'Risotto à la Truffe',
    description: 'Creamy Arborio rice with black truffle, parmesan, and white wine.',
    descriptionAr: 'أرز أربوريو كريمي مع الكمأة السوداء والبارميزان ونبيذ أبيض.',
    descriptionFr: 'Riz Arborio crémeux avec truffe noire, parmesan et vin blanc.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop',
    category: 'food',
    tags: ['chef-special'],
    rating: 4.8,
    reviewCount: 203,
    prepTime: 20,
    calories: 520,
    ingredients: ['Arborio rice', 'Black truffle', 'Parmesan', 'White wine', 'Butter'],
    ingredientsAr: ['أرز أربوريو', 'كمأة سوداء', 'بارميزان', 'نبيذ أبيض', 'زبدة'],
    allergens: ['Dairy', 'Gluten'],
    isAvailable: true,
    isNew: false,
    popularity: 82,
    createdAt: '2024-01-01',
  },
  {
    id: 'c7',
    name: 'Lobster Thermidor',
    nameAr: 'لوبستر ثيرميدور',
    nameFr: 'Homard Thermidor',
    description: 'Whole lobster baked in creamy cognac sauce with gruyère cheese.',
    descriptionAr: 'لوبستر كامل مخبوز في صلصة كريمية بالكوجنياك وجبنة غرويير.',
    descriptionFr: 'Homard entier cuit au four dans une sauce crémeuse au cognac avec du gruyère.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop',
    category: 'food',
    tags: ['chef-special', 'premium'],
    rating: 4.9,
    reviewCount: 89,
    prepTime: 30,
    calories: 780,
    ingredients: ['Whole lobster', 'Cognac', 'Gruyère', 'Cream', 'Mustard'],
    ingredientsAr: ['لوبستر كامل', 'كوجنياك', 'جبنة غرويير', 'كريمة', 'خردل'],
    allergens: ['Shellfish', 'Dairy', 'Gluten'],
    isAvailable: true,
    isNew: false,
    popularity: 80,
    createdAt: '2024-01-01',
  },
  {
    id: 'c8',
    name: 'Grilled Salmon',
    nameAr: 'سلمون مشوي',
    nameFr: 'Saumon Grillé',
    description: 'Atlantic salmon fillet with lemon herb butter and seasonal vegetables.',
    descriptionAr: 'فيليه سلمون أطلسي مع زبدة الأعشاب الليمونية والخضروات الموسمية.',
    descriptionFr: 'Filet de saumon atlantique avec beurre aux herbes citronnées et légumes de saison.',
    price: 290,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
    category: 'food',
    tags: ['light', 'popular'],
    rating: 4.7,
    reviewCount: 234,
    prepTime: 18,
    calories: 420,
    ingredients: ['Atlantic salmon', 'Lemon', 'Herbs', 'Seasonal vegetables'],
    ingredientsAr: ['سلمون أطلسي', 'ليمون', 'أعشاب', 'خضروات موسمية'],
    allergens: ['Fish'],
    isAvailable: true,
    isNew: false,
    popularity: 79,
    createdAt: '2024-01-01',
  },
  {
    id: 'c9',
    name: 'Mediterranean Salad',
    nameAr: 'سلطة متوسطية',
    nameFr: 'Salade Méditerranéenne',
    description: 'Fresh greens with feta, olives, sun-dried tomatoes, and balsamic.',
    descriptionAr: 'خضروات طازجة مع فيتا والزيتون وجبنة الطماطم المجففة والخل البلسمي.',
    descriptionFr: 'Laitues fraîches avec feta, olives, tomates séchées et vinaigre balsamique.',
    price: 85,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
    category: 'food',
    tags: ['light', 'vegan'],
    rating: 4.5,
    reviewCount: 312,
    prepTime: 10,
    calories: 280,
    ingredients: ['Mixed greens', 'Feta cheese', 'Olives', 'Sun-dried tomatoes', 'Balsamic'],
    ingredientsAr: ['خضروات مشكلة', 'جبنة فيتا', 'زيتون', 'طماطم مجففة', 'خل بلسمي'],
    allergens: ['Dairy'],
    isAvailable: true,
    isNew: false,
    popularity: 75,
    createdAt: '2024-01-01',
  },
  {
    id: 'c10',
    name: 'Spicy Tuna Bowl',
    nameAr: 'بولة تونة حارة',
    nameFr: 'Bol au Thon Épicé',
    description: 'Sushi-grade tuna with spicy mayo, avocado, and crispy rice.',
    descriptionAr: 'تونة درجة سوشي مع مايونيز حار وأفوكادو وأرز مقرمش.',
    descriptionFr: 'Thon de qualité sushii avec mayonnaise épicée, avocat et riz croustillant.',
    price: 165,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    category: 'food',
    tags: ['spicy', 'new'],
    rating: 4.6,
    reviewCount: 145,
    prepTime: 15,
    calories: 450,
    ingredients: ['Sushi-grade tuna', 'Spicy mayo', 'Avocado', 'Crispy rice', 'Sesame'],
    ingredientsAr: ['تونة سوشي', 'مايونيز حار', 'أفوكادو', 'أرز مقرمش', 'سمسم'],
    allergens: ['Fish', 'Soy', 'Gluten'],
    isAvailable: true,
    isNew: true,
    popularity: 72,
    createdAt: '2025-01-05',
  },
  {
    id: 'c11',
    name: 'Crème Brûlée',
    nameAr: 'كريم بروليه',
    nameFr: 'Crème Brûlée',
    description: 'Classic vanilla bean crème brûlée with caramelized sugar crust.',
    descriptionAr: 'كريم بروليه فانيلا كلاسيكي مع قشرة سكر كراميليز.',
    descriptionFr: 'Crème brûlée à la vanille classique avec croûte de sucre caramélisé.',
    price: 65,
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&h=400&fit=crop',
    category: 'desserts',
    tags: ['popular'],
    rating: 4.8,
    reviewCount: 278,
    prepTime: 8,
    calories: 380,
    ingredients: ['Vanilla bean', 'Heavy cream', 'Egg yolks', 'Sugar'],
    ingredientsAr: ['فانيليا', 'كريمة ثقيلة', 'صفار بيض', 'سكر'],
    allergens: ['Dairy', 'Eggs'],
    isAvailable: true,
    isNew: false,
    popularity: 82,
    createdAt: '2024-01-01',
  },
  {
    id: 'c12',
    name: 'Tiramisu',
    nameAr: 'تيراميسو',
    nameFr: 'Tiramisu',
    description: 'Authentic Italian tiramisu with mascarpone and espresso-soaked ladyfingers.',
    descriptionAr: 'تيراميسو إيطالي أصيل مع ماسكاربوني وبسكويت منقوع بالإسبريسو.',
    descriptionFr: 'Tiramisu italien authentique à la mascarpone et biscuits imbibés d\'espresso.',
    price: 55,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop',
    category: 'desserts',
    tags: ['popular', 'chef-special'],
    rating: 4.9,
    reviewCount: 356,
    prepTime: 5,
    calories: 420,
    ingredients: ['Mascarpone', 'Espresso', 'Ladyfingers', 'Cocoa', 'Marsala wine'],
    ingredientsAr: ['ماسكاربوني', 'إسبريسو', 'بسكويت أصابع السيد', 'كاكاو', 'نبيذ مارسالا'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    isAvailable: true,
    isNew: false,
    popularity: 96,
    createdAt: '2024-01-01',
  },
  {
    id: 'c13',
    name: 'Mango Cheesecake',
    nameAr: 'كعكة المانجو',
    nameFr: 'Gâteau au Mangue',
    description: 'New York style cheesecake topped with fresh mango coulis.',
    descriptionAr: 'كيك تشيز نيويورك مع صلطة مانجو طازجة.',
    descriptionFr: 'Cheesecake style New York garni de coulis de mangue fraîche.',
    price: 70,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&h=400&fit=crop',
    category: 'desserts',
    tags: ['new'],
    rating: 4.6,
    reviewCount: 134,
    prepTime: 5,
    calories: 450,
    ingredients: ['Cream cheese', 'Mango', 'Graham cracker', 'Sugar', 'Vanilla'],
    ingredientsAr: ['جبنة كريمي', 'مانجو', 'بسكويت غراهام', 'سكر', 'فانيليا'],
    allergens: ['Dairy', 'Gluten'],
    isAvailable: true,
    isNew: true,
    popularity: 70,
    createdAt: '2025-01-08',
  },
  {
    id: 'c14',
    name: 'Kunafa',
    nameAr: 'كنافة نابلسية',
    nameFr: 'Kunafa',
    description: 'Crispy kunafa with molten cheese, soaked in fragrant sugar syrup.',
    descriptionAr: 'كنافة مقرمشة مع جبنة ذائبة، مشبعة بشراب السكر العطري.',
    descriptionFr: 'Kunafa croustillante au fromage fondu, imbibée de sirop de sucre parfumé.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop',
    category: 'desserts',
    tags: ['popular'],
    rating: 4.7,
    reviewCount: 421,
    prepTime: 12,
    calories: 380,
    ingredients: ['Kataifi dough', 'Mozzarella', 'Sugar syrup', 'Rose water', 'Pistachios'],
    ingredientsAr: ['عجينة كنافة', 'جبنة موزاريلا', 'شراب سكر', 'ماء ورد', 'فستق'],
    allergens: ['Dairy', 'Gluten', 'Nuts'],
    isAvailable: true,
    isNew: false,
    popularity: 88,
    createdAt: '2024-01-01',
  },
  {
    id: 'c15',
    name: 'Mojito',
    nameAr: 'موهيتو',
    nameFr: 'Mojito',
    description: 'Refreshing mint and lime cocktail with soda water.',
    descriptionAr: 'كوكتيل منعش بالنعناع والليمون مع ماء غازي.',
    descriptionFr: 'Cocktail rafraîchissant à la menthe et au citron vert avec eau gazeuse.',
    price: 32,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=400&fit=crop',
    category: 'drinks',
    tags: ['popular'],
    rating: 4.5,
    reviewCount: 189,
    prepTime: 5,
    calories: 120,
    ingredients: ['Fresh mint', 'Lime', 'Soda water', 'Sugar', 'Ice'],
    ingredientsAr: ['نعناع طازج', 'ليمون', 'ماء غازي', 'سكر', 'ثلج'],
    allergens: [],
    isAvailable: true,
    isNew: false,
    popularity: 68,
    createdAt: '2024-01-01',
  },
  {
    id: 'c16',
    name: 'Fresh Juice Blend',
    nameAr: 'عصير فواكه طازج',
    nameFr: 'Mélange de Jus Frais',
    description: 'Seasonal fresh juice blend with orange, carrot, and ginger.',
    descriptionAr: 'مزيج عصير فواكه طازج موسمي مع برتقال وجزر وزنجبيل.',
    descriptionFr: 'Mélange de jus frais de saison avec orange, carotte et gingembre.',
    price: 25,
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&h=400&fit=crop',
    category: 'drinks',
    tags: ['vegan', 'light'],
    rating: 4.4,
    reviewCount: 167,
    prepTime: 5,
    calories: 90,
    ingredients: ['Orange', 'Carrot', 'Ginger', 'Lemon'],
    ingredientsAr: ['برتقال', 'جزر', 'زنجبيل', 'ليمون'],
    allergens: [],
    isAvailable: true,
    isNew: false,
    popularity: 65,
    createdAt: '2024-01-01',
  },
  {
    id: 'c17',
    name: 'Matcha Latte',
    nameAr: 'لاتيه الماتشا',
    nameFr: 'Latte Matcha',
    description: 'Premium Japanese matcha with oat milk and a hint of vanilla.',
    descriptionAr: 'ماتشا يابانية فاخرة مع حليب الشوفان ولمسة فانيليا.',
    descriptionFr: 'Matcha japonais premium avec lait d\'avoine et une touche de vanille.',
    price: 32,
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=400&fit=crop',
    category: 'coffee',
    tags: ['new', 'vegan'],
    rating: 4.6,
    reviewCount: 112,
    prepTime: 5,
    calories: 140,
    ingredients: ['Matcha powder', 'Oat milk', 'Vanilla', 'Honey'],
    ingredientsAr: ['مسحوق ماتشا', 'حليب شوفان', 'فانيليا', 'عسل'],
    allergens: ['Gluten'],
    isAvailable: true,
    isNew: true,
    popularity: 78,
    createdAt: '2025-01-12',
  },
  {
    id: 'c18',
    name: 'Mansaf',
    nameAr: 'منسف أردني',
    nameFr: 'Mansaf',
    description: 'Traditional Jordanian dish with lamb, rice, and jameed yogurt sauce.',
    descriptionAr: 'طبق أردني تقليدي مع لحم خروف وأرز وصلصة جميد.',
    descriptionFr: 'Plat jordanien traditionnel avec agneau, riz et sauce yaourt jameed.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop',
    category: 'food',
    tags: ['popular', 'chef-special'],
    rating: 4.8,
    reviewCount: 267,
    prepTime: 35,
    calories: 850,
    ingredients: ['Lamb', 'Basmati rice', 'Jameed', 'Nuts', 'Flatbread'],
    ingredientsAr: ['لحم خروف', 'أرز بسمتي', 'جميد', 'مكسرات', 'خبز عربي'],
    allergens: ['Dairy', 'Gluten', 'Nuts'],
    isAvailable: true,
    isNew: false,
    popularity: 84,
    createdAt: '2024-01-01',
  },
];

export const getItemsByCategory = (category: MenuCategory): MenuItem[] => {
  return menuItems.filter((item) => item.category === category);
};

export const getItemsByTag = (tag: MenuTag): MenuItem[] => {
  return menuItems.filter((item) => item.tags.includes(tag));
};

export const getPopularItems = (limit: number = 8): MenuItem[] => {
  return [...menuItems]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
};

export const getNewItems = (): MenuItem[] => {
  return menuItems.filter((item) => item.isNew);
};

export const searchItems = (query: string): MenuItem[] => {
  const lower = query.toLowerCase();
  return menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lower) ||
      item.nameAr.includes(query) ||
      item.description.toLowerCase().includes(lower) ||
      item.descriptionAr.includes(query) ||
      item.tags.some((tag) => tag.includes(lower)) ||
      item.category.includes(lower)
  );
};

export const sortItems = (items: MenuItem[], sort: SortOption): MenuItem[] => {
  const sorted = [...items];
  switch (sort) {
    case 'popular':
      return sorted.sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted;
  }
};
