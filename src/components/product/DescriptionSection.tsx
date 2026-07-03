'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { fadeUp } from '@/lib/animations';
import type { ProductDetail } from '@/data/menu-items';

interface DescriptionSectionProps {
  product: ProductDetail;
}

export function DescriptionSection({ product }: DescriptionSectionProps) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const story = isAr ? product.storyAr : product.story;
  const chefNote = isAr ? product.chefNoteAr : product.chefNote;
  const ingredients = isAr ? product.ingredientsAr : product.ingredients;

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-12"
    >
      <div className="space-y-8">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-espresso dark:text-cream mb-4">
            {isAr ? 'قصة الطبق' : 'The Story'}
          </h2>
          <p className="text-espresso/60 dark:text-cream/60 leading-relaxed text-lg">
            {story}
          </p>
        </div>

        {chefNote && (
          <div className="rounded-2xl bg-caramel/5 border border-caramel/20 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">👨‍🍳</span>
              <div>
                <h3 className="font-medium text-espresso dark:text-cream mb-1">
                  {isAr ? 'ملاحظة الشيف' : "Chef's Note"}
                </h3>
                <p className="text-sm text-espresso/60 dark:text-cream/60 italic">
                  {chefNote}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-medium text-espresso dark:text-cream mb-3">
            {isAr ? 'المكونات' : 'Ingredients'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="rounded-full bg-cream px-4 py-2 text-sm text-espresso dark:bg-charcoal dark:text-cream"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
