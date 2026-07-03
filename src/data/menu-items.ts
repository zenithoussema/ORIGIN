import type { MenuCategory, MenuTag } from '@/data/menu';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SizeOption {
  id: string;
  name: string;
  nameAr: string;
  priceModifier: number;
}

export interface ExtraOption {
  id: string;
  name: string;
  nameAr: string;
  price: number;
}

export interface Review {
  id: string;
  name: string;
  nameAr: string;
  avatar: string;
  rating: number;
  comment: string;
  commentAr: string;
  date: string;
  image?: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  story: string;
  storyAr: string;
  chefNote?: string;
  chefNoteAr?: string;
  price: number;
  images: string[];
  category: MenuCategory;
  tags: MenuTag[];
  rating: number;
  reviewCount: number;
  prepTime: number;
  popularity: number;
  spicyLevel?: number;
  isVegan: boolean;
  nutrition: NutritionInfo;
  ingredients: string[];
  ingredientsAr: string[];
  allergens: string[];
  sizes?: SizeOption[];
  extras?: ExtraOption[];
  removableIngredients?: { id: string; name: string; nameAr: string }[];
  isAvailable: boolean;
  isNew: boolean;
  relatedIds: string[];
  reviews?: Review[];
}

export const productDetails: Record<string, ProductDetail> = {
  'c2': {
    id: 'c2',
    name: 'Saffron Latte',
    nameAr: 'لاتيه الزعفران',
    nameFr: 'Latte au Safran',
    description: 'Premium latte infused with Iranian saffron and topped with gold dust.',
    descriptionAr: 'لاتيه فاخر مُنتَج بالزعفران الإيراني ومُزيَّن بطبقة ذهبية.',
    descriptionFr: 'Latte premium infusé au safran iranien et saupoudré de poudre dorée.',
    story: 'Our Saffron Latte begins with hand-picked Iranian saffron threads, gently steeped to release their golden essence. Paired with a double shot of our signature espresso blend and velvety steamed milk, it\'s finished with an edible gold dust that catches the light with every sip. A drink fit for royalty.',
    storyAr: 'يبدأ لاتيه الزعفران لدينا بخيوط الزعفران الإيرانية المختارة يدوياً، منقوعة برفق لإطلاق لونها الذهبي. مقترن بشوت مزدوج من مزيج الإسبريسو المميز我们的 والحليب المخيوط المخملي، ينتهي بغبار ذهبي edible يلتقط الضوء مع كل رشفة.',
    chefNote: 'Best enjoyed within the first 5 minutes. The saffron infusion deepens over time.',
    chefNoteAr: 'يُفضل تناوله خلال أول 5 دقائق. يزداد التوهج بالزعفران مع مرور الوقت.',
    price: 35,
    images: [
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=800&h=600&fit=crop',
    ],
    category: 'coffee',
    tags: ['popular', 'chef-special'],
    rating: 4.9,
    reviewCount: 287,
    prepTime: 7,
    popularity: 94,
    isVegan: false,
    nutrition: { calories: 180, protein: 6, carbs: 22, fat: 8 },
    ingredients: ['Espresso', 'Steamed milk', 'Iranian saffron', 'Gold dust', 'Vanilla'],
    ingredientsAr: ['إسبريسو', 'حليب مخيوط', 'زعفران إيراني', 'غبار ذهبي', 'فانيليا'],
    allergens: ['Milk'],
    sizes: [
      { id: 'small', name: 'Small', nameAr: 'صغير', priceModifier: -5 },
      { id: 'medium', name: 'Medium', nameAr: 'متوسط', priceModifier: 0 },
      { id: 'large', name: 'Large', nameAr: 'كبير', priceModifier: 5 },
    ],
    extras: [
      { id: 'extra-shot', name: 'Extra Shot', nameAr: 'شوت إضافي', price: 5 },
      { id: 'oat-milk', name: 'Oat Milk', nameAr: 'حليب شوفان', price: 3 },
      { id: 'vanilla-syrup', name: 'Vanilla Syrup', nameAr: 'شراب فانيليا', price: 2 },
    ],
    removableIngredients: [
      { id: 'gold-dust', name: 'Gold Dust', nameAr: 'غبار ذهبي' },
      { id: 'vanilla', name: 'Vanilla', nameAr: 'فانيليا' },
    ],
    isAvailable: true,
    isNew: false,
    relatedIds: ['c1', 'c4', 'c17', 'd1', 'c3'],
    reviews: [
      { id: 'r1', name: 'Ahmed M.', nameAr: 'أحمد م.', avatar: '', rating: 5, comment: 'Absolutely divine! The saffron flavor is authentic and the gold dust is a nice touch.', commentAr: 'مذهل تماماً! طعم الزعفران أصيل ولمسة الغبار الذهبي لطيفة.', date: '2026-06-20' },
      { id: 'r2', name: 'Sara K.', nameAr: 'سارة ك.', avatar: '', rating: 5, comment: 'My new favorite coffee. Worth every penny.', commentAr: 'محلقي المفضل الجديد. يستحق كل فلس.', date: '2026-06-18' },
      { id: 'r3', name: 'James L.', nameAr: 'جيمس ل.', avatar: '', rating: 4, comment: 'Beautiful presentation. The saffron is subtle but elegant.', commentAr: 'عرض جميل. الزعفران خفيف لكن أنيق.', date: '2026-06-15' },
    ],
  },
  'c5': {
    id: 'c5',
    name: 'Wagyu Beef Tenderloin',
    nameAr: 'فيليه واغيو',
    nameFr: 'Filet de Boeuf Wagyu',
    description: 'A5 Japanese Wagyu, pan-seared to perfection, served with truffle jus.',
    descriptionAr: 'واغيو ياباني درجة A5، مقلي في المقلاة بعناية، يُقدَّم مع صلصة الكمأة.',
    descriptionFr: 'Wagyu japonais A5, poêlé à la perfection, servi avec jus de truffe.',
    story: 'Sourced directly from Miyazaki Prefecture, our A5 Wagyu is the pinnacle of beef excellence. Each cut is aged for 28 days, then seared at precisely 230°C to create a caramelized crust while maintaining a buttery interior. Served with our house-made truffle jus and seasonal accompaniments.',
    storyAr: 'مستورد مباشرة من محافظة ميازاكي، واغيو A5 لدينا هو قمة التميز في اللحم. كل قطعة تُنقّى لمدة 28 يوماً، ثم تُقلى بدقة 230 درجة لإنشاء قشرة كراميليز مع الحفاظ على قلب كريمي. يُقدَّم مع صلصة الكمأة المنزلية والمُ accompany الموسمية.',
    chefNote: 'We recommend medium-rare for the optimal Wagyu experience. The marbling melts at body temperature.',
    chefNoteAr: 'نوصي بالطبخ نصف جاهز لتجربة واغيو المثالية. يتداخل الدهن عند درجة حرارة الجسم.',
    price: 380,
    images: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1432139509613-5c4255a78e03?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop',
    ],
    category: 'food',
    tags: ['chef-special', 'popular', 'premium'],
    rating: 4.9,
    reviewCount: 156,
    prepTime: 25,
    popularity: 89,
    spicyLevel: 0,
    isVegan: false,
    nutrition: { calories: 650, protein: 52, carbs: 8, fat: 45 },
    ingredients: ['A5 Wagyu beef', 'Black truffle', 'Asparagus', 'Potato purée', 'Red wine jus'],
    ingredientsAr: ['لحم واغيو A5', 'كمأة سوداء', 'سبانخ', 'هريسة بطاطا', 'صلصة نبيذ أحمر'],
    allergens: ['Dairy'],
    sizes: [
      { id: '200g', name: '200g', nameAr: '200 جرام', priceModifier: -80 },
      { id: '300g', name: '300g', nameAr: '300 جرام', priceModifier: 0 },
      { id: '400g', name: '400g', nameAr: '400 جرام', priceModifier: 120 },
    ],
    extras: [
      { id: 'truffle-shaving', name: 'Extra Truffle', nameAr: 'كمأة إضافية', price: 45 },
      { id: 'foie-gras', name: 'Foie Gras', nameAr: 'فوا غرا', price: 65 },
      { id: 'lobster-tail', name: 'Lobster Tail', nameAr: 'ذيل لوبستر', price: 95 },
    ],
    removableIngredients: [
      { id: 'asparagus', name: 'Asparagus', nameAr: 'سبانخ' },
    ],
    isAvailable: true,
    isNew: false,
    relatedIds: ['c6', 'c7', 'c8', 'c18', 'd2'],
    reviews: [
      { id: 'r4', name: 'Mohammed A.', nameAr: 'محمد أ.', avatar: '', rating: 5, comment: 'The best Wagyu I have had outside Japan. The truffle jus is perfection.', commentAr: 'أفضل واغيو تذوقته خارج اليابان. صلصة الكمأة مثالية.', date: '2026-06-22' },
      { id: 'r5', name: 'Fatima R.', nameAr: 'فاطمة ر.', avatar: '', rating: 5, comment: 'Melt in your mouth. Truly A5 quality.', commentAr: 'يذوب في الفم. جودة A5 حقيقية.', date: '2026-06-19' },
    ],
  },
  'c12': {
    id: 'c12',
    name: 'Tiramisu',
    nameAr: 'تيراميسو',
    nameFr: 'Tiramisu',
    description: 'Authentic Italian tiramisu with mascarpone and espresso-soaked ladyfingers.',
    descriptionAr: 'تيراميسو إيطالي أصيل مع ماسكاربوني وبسكويت منقوع بالإسبريسو.',
    descriptionFr: 'Tiramisu italien authentique à la mascarpone et biscuits imbibés d\'espresso.',
    story: 'Our Tiramisu follows a recipe passed down through three generations of Italian pastry chefs. We use only the finest Italian mascarpone, freshly brewed espresso, and Marsala wine from Sicily. Each portion is hand-assembled and rested for 24 hours to achieve the perfect balance of flavors.',
    storyAr: 'تيراميسو لدينا يتبع وصفة توارثها ثلاث أجيال من الطهاة الإيطاليين. نستخدم فقط أجود ماسكاربوني إيطالي، وإسبريسو طازج، ونبيذ مارسالا من صقلية. كل حصة تُجمَّع يدوياً وتُرتاح لمدة 24 ساعة لتحقيق التوازن المثالي.',
    chefNote: 'Allow 5 minutes at room temperature before serving for the best texture.',
    chefNoteAr: 'اتركه 5 دقائق على درجة حرارة الغرفة قبل التقديم لأفضل قوام.',
    price: 55,
    images: [
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop',
    ],
    category: 'desserts',
    tags: ['popular', 'chef-special'],
    rating: 4.9,
    reviewCount: 356,
    prepTime: 5,
    popularity: 96,
    isVegan: false,
    nutrition: { calories: 420, protein: 8, carbs: 38, fat: 28 },
    ingredients: ['Mascarpone', 'Espresso', 'Ladyfingers', 'Cocoa', 'Marsala wine', 'Eggs'],
    ingredientsAr: ['ماسكاربوني', 'إسبريسو', 'بسكويت أصابع السيد', 'كاكاو', 'نبيذ مارسالا', 'بيض'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    extras: [
      { id: 'extra-espresso', name: 'Extra Espresso Shot', nameAr: 'شوت إسبريسو إضافي', price: 3 },
      { id: 'ice-cream', name: 'Vanilla Ice Cream', nameAr: 'آيس كريم فانيلا', price: 8 },
    ],
    isAvailable: true,
    isNew: false,
    relatedIds: ['c11', 'c13', 'c14', 'c2', 'd1'],
  },
  'c1': {
    id: 'c1',
    name: 'Arabic Coffee',
    nameAr: 'قهوة عربية',
    nameFr: 'Café Arabe',
    description: 'Traditional Arabic coffee with cardamom and saffron, served in a dallah.',
    descriptionAr: 'قهوة عربية تقليدية بالهيل والزعفران، تُقدَّم في دلة.',
    descriptionFr: 'Café arabe traditionnel à la cardamome et au safran, servi dans une dallah.',
    story: 'Our Arabic Coffee is a tribute to centuries of hospitality tradition. We source our beans from the highlands of Yemen, roast them with care, and blend them with hand-ground cardamom and a whisper of saffron. Served in a traditional dallah, each cup is a ceremony of welcome.',
    storyAr: 'قهوة عربية لدينا تحية لقرون من تقاليد الضيافة. نجلب حبوبنا من مرتفعات اليمن، ونحمصها بعناية، ونمزجها مع هيل مطحون يدوياً ولمسة من الزعفران. تُقدَّم في دلة تقليدية، كل كوب هو مراسم ترحيب.',
    price: 20,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop',
    ],
    category: 'coffee',
    tags: ['popular'],
    rating: 4.8,
    reviewCount: 342,
    prepTime: 5,
    popularity: 92,
    isVegan: true,
    nutrition: { calories: 15, protein: 0, carbs: 2, fat: 0 },
    ingredients: ['Yemeni coffee beans', 'Cardamom', 'Saffron', 'Rose water'],
    ingredientsAr: ['بن يمني', 'هيل', 'زعفران', 'ماء ورد'],
    allergens: [],
    sizes: [
      { id: 'small', name: 'Small', nameAr: 'صغير', priceModifier: 0 },
      { id: 'large', name: 'Large (Dallah)', nameAr: 'كبير (دلة)', priceModifier: 15 },
    ],
    isAvailable: true,
    isNew: false,
    relatedIds: ['c2', 'c4', 'c17', 'd1', 'c3'],
  },
  'c14': {
    id: 'c14',
    name: 'Kunafa',
    nameAr: 'كنافة نابلسية',
    nameFr: 'Kunafa',
    description: 'Crispy kunafa with molten cheese, soaked in fragrant sugar syrup.',
    descriptionAr: 'كنافة مقرمشة مع جبنة ذائبة، مشبعة بشراب السكر العطري.',
    descriptionFr: 'Kunafa croustillante au fromage fondu, imbibée de sirop de sucre parfumé.',
    story: 'Our Kunafa is a modern tribute to the beloved Palestinian classic. We use hand-shredded kataifi dough, layered with fresh Nabulsi cheese, and baked until golden and crispy. Drizzled with our signature rose-water infused syrup and topped with crushed pistachios.',
    storyAr: 'كنافة لدينا تحية عصرية للكلاسيكية الفلسطينية المحبوبة. نستخدم عجينة كتائفي مبروشة يدوياً، مع جبنة نابلسية طازجة، ونخبزها حتى ذهبية ومقرمشة. تُرشّ بشراب ماء الورد المميز وتُزيَّن بفستق مجروش.',
    price: 45,
    images: [
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&h=600&fit=crop',
    ],
    category: 'desserts',
    tags: ['popular'],
    rating: 4.7,
    reviewCount: 421,
    prepTime: 12,
    popularity: 88,
    isVegan: false,
    nutrition: { calories: 380, protein: 12, carbs: 48, fat: 16 },
    ingredients: ['Kataifi dough', 'Nabulsi cheese', 'Sugar syrup', 'Rose water', 'Pistachios'],
    ingredientsAr: ['عجينة كتائفي', 'جبنة نابلسية', 'شراب سكر', 'ماء ورد', 'فستق'],
    allergens: ['Dairy', 'Gluten', 'Nuts'],
    extras: [
      { id: 'ice-cream', name: 'Ice Cream', nameAr: 'آيس كريم', price: 8 },
      { id: 'extra-syrup', name: 'Extra Syrup', nameAr: 'شراب إضافي', price: 2 },
    ],
    isAvailable: true,
    isNew: false,
    relatedIds: ['c11', 'c12', 'c13', 'd1', 'd2'],
  },
  'c3': {
    id: 'c3',
    name: 'Cold Brew Espresso',
    nameAr: 'كولد برو إسبريسو',
    nameFr: 'Cold Brew Espresso',
    description: '24-hour cold brew with a double shot of espresso. Smooth and bold.',
    descriptionAr: 'كولد برو لمدة 24 ساعة مع شوت مزدوج من الإسبريسو. ناعم وجريء.',
    descriptionFr: 'Cold brew de 24 heures avec un double shot d\'espresso. Doux et audacieux.',
    story: 'Our Cold Brew is steeped for a full 24 hours using single-origin Ethiopian beans, resulting in a remarkably smooth concentrate with notes of dark chocolate and cherry. We finish it with a double shot of our signature espresso for an extra bold kick.',
    storyAr: 'كولد برو لدينا يُنقّى لمدة 24 ساعة كاملة باستخدام حبوب إثيوبية من مصدر واحد، مما ينتج تركيزاً ناعماً بشكل ملحوظ مع نكهات من الشوكولاتة الداكرة والكرز. ننتهي بشوت مزدوج من الإسبريسو المميز.',
    price: 28,
    images: [
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&h=600&fit=crop',
    ],
    category: 'coffee',
    tags: ['new', 'popular'],
    rating: 4.7,
    reviewCount: 198,
    prepTime: 3,
    popularity: 85,
    isVegan: true,
    nutrition: { calories: 10, protein: 0, carbs: 1, fat: 0 },
    ingredients: ['Cold brew coffee', 'Double espresso', 'Ice'],
    ingredientsAr: ['قهوة كولد برو', 'إسبريسو مزدوج', 'ثلج'],
    allergens: [],
    sizes: [
      { id: 'regular', name: 'Regular', nameAr: 'عادي', priceModifier: 0 },
      { id: 'large', name: 'Large', nameAr: 'كبير', priceModifier: 5 },
    ],
    isAvailable: true,
    isNew: true,
    relatedIds: ['c1', 'c2', 'c4', 'c17', 'd1'],
  },
  'c11': {
    id: 'c11',
    name: 'Crème Brûlée',
    nameAr: 'كريم بروليه',
    nameFr: 'Crème Brûlée',
    description: 'Classic vanilla bean crème brûlée with caramelized sugar crust.',
    descriptionAr: 'كريم بروليه فانيلا كلاسيكي مع قشرة سكر كراميليز.',
    descriptionFr: 'Crème brûlée à la vanille classique avec croûte de sucre caramélisé.',
    story: 'Our Crème Brûlée features Madagascar vanilla beans, slow-infused into rich cream and egg yolks. Each portion is baked in a water bath at a precise 82°C, then finished with a torch-caramelized sugar crust that shatters with the tap of a spoon.',
    storyAr: 'كريم بروليه لدينا يضم حبوب فانيليا مدغشقر، منقوعة ببطء في كريمة غنية وصفار بيض. كل حصة تُخبز في حمام مائي بدقة 82 درجة، ثم تنتهي بقشرة سكر محترقة تتحطم مع لمسة ملعقة.',
    price: 65,
    images: [
      'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
    ],
    category: 'desserts',
    tags: ['popular'],
    rating: 4.8,
    reviewCount: 278,
    prepTime: 8,
    popularity: 82,
    isVegan: false,
    nutrition: { calories: 380, protein: 6, carbs: 32, fat: 26 },
    ingredients: ['Vanilla bean', 'Heavy cream', 'Egg yolks', 'Sugar'],
    ingredientsAr: ['فانيليا', 'كريمة ثقيلة', 'صفار بيض', 'سكر'],
    allergens: ['Dairy', 'Eggs'],
    extras: [
      { id: 'berries', name: 'Fresh Berries', nameAr: 'توت طازج', price: 8 },
      { id: 'extra-caramel', name: 'Extra Caramel', nameAr: 'كراميل إضافي', price: 3 },
    ],
    isAvailable: true,
    isNew: false,
    relatedIds: ['c12', 'c13', 'c14', 'd1', 'd2'],
  },
  'c17': {
    id: 'c17',
    name: 'Matcha Latte',
    nameAr: 'لاتيه الماتشا',
    nameFr: 'Latte Matcha',
    description: 'Premium Japanese matcha with oat milk and a hint of vanilla.',
    descriptionAr: 'ماتشا يابانية فاخرة مع حليب الشوفان ولمسة فانيليا.',
    descriptionFr: 'Matcha japonais premium avec lait d\'avoine et une touche de vanille.',
    story: 'Our Matcha is sourced from the Uji region of Kyoto, Japan — the birthplace of matcha. Each ceremonial-grade powder is stone-ground to a particle size of 5 microns, creating an impossibly smooth, umami-rich experience. We pair it with creamy oat milk for a modern twist.',
    storyAr: 'ماتشا لدينا مستوردة من منطقة أوجي في كيوتو، اليابان — مسقط رأس الماتشا. كل مسحوق بدرجة طقوس يُطحن بحجر إلى حجم جسيم 5 ميكرون، مما يخلق تجربة ناعمة بشكل مستحيل وغنية بالأومامي.',
    price: 32,
    images: [
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&h=600&fit=crop',
    ],
    category: 'coffee',
    tags: ['new', 'vegan'],
    rating: 4.6,
    reviewCount: 112,
    prepTime: 5,
    popularity: 78,
    isVegan: true,
    nutrition: { calories: 140, protein: 3, carbs: 18, fat: 6 },
    ingredients: ['Ceremonial matcha', 'Oat milk', 'Vanilla', 'Honey'],
    ingredientsAr: ['ماتشا طقوسية', 'حليب شوفان', 'فانيليا', 'عسل'],
    allergens: ['Gluten'],
    extras: [
      { id: 'extra-matcha', name: 'Extra Matcha', nameAr: 'ماتشا إضافية', price: 5 },
      { id: 'honey', name: 'Extra Honey', nameAr: 'عسل إضافي', price: 2 },
    ],
    isAvailable: true,
    isNew: true,
    relatedIds: ['c2', 'c1', 'c4', 'c3', 'd1'],
  },
};

export const getAllProductIds = (): string[] => {
  return Object.keys(productDetails);
};

export const getRelatedProducts = (productId: string, limit: number = 4): ProductDetail[] => {
  const product = productDetails[productId];
  if (!product) return [];
  return product.relatedIds
    .map((id) => productDetails[id])
    .filter((p): p is ProductDetail => p !== undefined)
    .slice(0, limit);
};
