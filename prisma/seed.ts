import { PrismaClient, UserRole, MenuCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = 'admin@origin.com';
  const adminPassword = 'OriginAdmin2026!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashed,
        role: UserRole.ADMIN,
        loyaltyPoints: 0,
      },
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  const menuCount = await prisma.menuItem.count();
  if (menuCount === 0) {
    const items = [
      { name: 'Saffron Latte', nameAr: 'لاتيه الزعفران', nameFr: 'Latte Safran', description: 'Premium saffron-infused latte with steamed milk', descriptionAr: 'لاتيه يحتوي على زعفران فاخر مع حليب مبخر', price: 18, category: MenuCategory.COFFEE, tags: ['signature', 'hot'] },
      { name: 'Espresso', nameAr: 'إسبريسو', nameFr: 'Espresso', description: 'Classic double shot espresso', descriptionAr: 'إسبريسو كلاسيكي مزدوج', price: 12, category: MenuCategory.COFFEE, tags: ['classic', 'hot'] },
      { name: 'Cappuccino', nameAr: 'كابتشينو', nameFr: 'Cappuccino', description: 'Creamy cappuccino with velvety foam', descriptionAr: 'كابتشينو كريمي مع رغوة ناعمة', price: 15, category: MenuCategory.COFFEE, tags: ['classic', 'hot'] },
      { name: 'Cold Brew', nameAr: 'كولد برو', nameFr: 'Cold Brew', description: 'Slow-steeped cold brew coffee', descriptionAr: 'قهوة باردة مقشرة ببطء', price: 16, category: MenuCategory.COFFEE, tags: ['cold', 'popular'] },
      { name: 'Truffle Wagyu Burger', nameAr: 'برجر واقيو بالترuffle', nameFr: 'Burger Wagyu Truffe', description: 'A5 Wagyu beef patty with black truffle aioli', descriptionAr: 'لحم واقيو A5 مع أيولي الترuffle الأسود', price: 68, category: MenuCategory.FOOD, tags: ['signature', 'premium'] },
      { name: 'Grilled Sea Bass', nameAr: 'باس مشوي', nameFr: 'Bar Grillé', description: 'Mediterranean sea bass with herb butter', descriptionAr: 'باس البحر المتوسط مع زبدة الأعشاب', price: 55, category: MenuCategory.FOOD, tags: ['healthy', 'popular'] },
      { name: 'Wagyu Steak', nameAr: 'ستيك واقيو', nameFr: 'Steak Wagyu', description: 'Premium A5 Wagyu ribeye steak', descriptionAr: 'ستيك واقيو A5 فاخر', price: 120, category: MenuCategory.FOOD, tags: ['premium', 'signature'] },
      { name: 'Caesar Salad', nameAr: 'سلطة سيزر', nameFr: 'Salade Caesar', description: 'Classic Caesar with parmesan crisp', descriptionAr: 'سيزر كلاسيك مع كريب Parmesan', price: 28, category: MenuCategory.FOOD, tags: ['healthy', 'light'] },
      { name: 'Crème Brûlée', nameAr: 'كريم بروليه', nameFr: 'Crème Brûlée', description: 'Classic vanilla bean crème brûlée', descriptionAr: 'كريم بروليه فانيليا كلاسيكي', price: 22, category: MenuCategory.DESSERTS, tags: ['classic'] },
      { name: 'Pistachio Baklava', nameAr: 'بقلاوة بالفستق', nameFr: 'Baklava Pistache', description: 'Handcrafted pistachio baklava with honey', descriptionAr: 'بقلاوة فستق يدوية مع عسل', price: 18, category: MenuCategory.DESSERTS, tags: ['signature'] },
      { name: 'Fresh Orange Juice', nameAr: 'عصير برتقال طازج', nameFr: 'Jus d\'Orange Frais', description: 'Freshly squeezed orange juice', descriptionAr: 'عصير برتقال طازج معصور', price: 14, category: MenuCategory.BEVERAGES, tags: ['fresh', 'cold'] },
      { name: 'Moroccan Mint Tea', nameAr: 'شاي بالنعناع المغربي', nameFr: 'Thé Marocain à la Menthe', description: 'Traditional Moroccan mint tea', descriptionAr: 'شاي بالنعناع المغربي التقليدي', price: 10, category: MenuCategory.BEVERAGES, tags: ['hot', 'traditional'] },
    ];

    await prisma.menuItem.createMany({
      data: items.map((item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        tags: item.tags,
        isAvailable: true,
        image: '/images/menu/placeholder.jpg',
      })),
    });
    console.log(`Seeded ${items.length} menu items.`);
  } else {
    console.log('Menu items already exist, skipping.');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
