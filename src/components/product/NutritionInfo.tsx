'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { fadeUp } from '@/lib/animations';
import type { ProductDetail } from '@/data/menu-items';

interface NutritionInfoProps {
  product: ProductDetail;
}

export function NutritionInfo({ product }: NutritionInfoProps) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const nutrients = [
    { key: 'calories', label: isAr ? 'سعرات' : 'Calories', value: product.nutrition.calories, unit: 'kcal', color: 'text-caramel' },
    { key: 'protein', label: isAr ? 'بروتين' : 'Protein', value: product.nutrition.protein, unit: 'g', color: 'text-blue-500' },
    { key: 'carbs', label: isAr ? 'كربوهيدرات' : 'Carbs', value: product.nutrition.carbs, unit: 'g', color: 'text-green-500' },
    { key: 'fat', label: isAr ? 'دهون' : 'Fat', value: product.nutrition.fat, unit: 'g', color: 'text-orange-500' },
  ];

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-12 border-t border-espresso/10 dark:border-cream/10"
    >
      <h2 className="font-playfair text-2xl font-bold text-espresso dark:text-cream mb-6">
        {isAr ? 'معلومات غذائية' : 'Nutrition Info'}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {nutrients.map((nutrient) => (
          <div
            key={nutrient.key}
            className="rounded-2xl bg-cream/50 p-4 text-center dark:bg-charcoal/50"
          >
            <div className={`text-2xl font-bold ${nutrient.color} mb-1`}>
              {nutrient.value}
              <span className="text-sm font-normal opacity-60 ml-0.5">{nutrient.unit}</span>
            </div>
            <div className="text-xs text-espresso/50 dark:text-cream/50 uppercase tracking-wider">
              {nutrient.label}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
