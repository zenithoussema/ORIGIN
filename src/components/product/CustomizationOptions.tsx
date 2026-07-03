'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { fadeUp } from '@/lib/animations';
import type { ProductDetail } from '@/data/menu-items';

interface CustomizationOptionsProps {
  product: ProductDetail;
  selectedSize: string | null;
  onSizeChange: (sizeId: string) => void;
  selectedExtras: string[];
  onExtrasChange: (extras: string[]) => void;
  removedIngredients: string[];
  onRemovedIngredientsChange: (ids: string[]) => void;
}

export function CustomizationOptions({
  product,
  selectedSize,
  onSizeChange,
  selectedExtras,
  onExtrasChange,
  removedIngredients,
  onRemovedIngredientsChange,
}: CustomizationOptionsProps) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const toggleExtra = (extraId: string) => {
    onExtrasChange(
      selectedExtras.includes(extraId)
        ? selectedExtras.filter((id) => id !== extraId)
        : [...selectedExtras, extraId]
    );
  };

  const toggleRemovedIngredient = (id: string) => {
    onRemovedIngredientsChange(
      removedIngredients.includes(id)
        ? removedIngredients.filter((i) => i !== id)
        : [...removedIngredients, id]
    );
  };

  if (!product.sizes && !product.extras && !product.removableIngredients) {
    return null;
  }

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-12 border-t border-espresso/10 dark:border-cream/10"
    >
      <h2 className="font-playfair text-2xl font-bold text-espresso dark:text-cream mb-6">
        {isAr ? 'تخصيص طلبك' : 'Customize Your Order'}
      </h2>

      <div className="space-y-8">
        {product.sizes && (
          <div>
            <h3 className="font-medium text-espresso dark:text-cream mb-3">
              {isAr ? 'الحجم' : 'Size'}
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => onSizeChange(size.id)}
                  className={`flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all ${
                    selectedSize === size.id
                      ? 'border-caramel bg-caramel/10 text-caramel'
                      : 'border-espresso/20 text-espresso hover:border-caramel/50 dark:border-cream/20 dark:text-cream'
                  }`}
                >
                  {selectedSize === size.id && <Check className="h-4 w-4" />}
                  <span>{isAr ? size.nameAr : size.name}</span>
                  <span className="text-xs opacity-60">
                    {size.priceModifier > 0 ? `+${size.priceModifier}` : size.priceModifier < 0 ? size.priceModifier : ''} DT
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {product.extras && product.extras.length > 0 && (
          <div>
            <h3 className="font-medium text-espresso dark:text-cream mb-3">
              {isAr ? 'إضافات' : 'Extras'}
            </h3>
            <div className="space-y-2">
              {product.extras.map((extra) => (
                <label
                  key={extra.id}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                    selectedExtras.includes(extra.id)
                      ? 'border-caramel bg-caramel/10'
                      : 'border-espresso/10 hover:border-caramel/30 dark:border-cream/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra.id)}
                      onChange={() => toggleExtra(extra.id)}
                      className="h-4 w-4 rounded border-espresso/30 text-caramel focus:ring-caramel accent-caramel"
                    />
                    <span className="text-sm text-espresso dark:text-cream">
                      {isAr ? extra.nameAr : extra.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-caramel">
                    +{extra.price} DT
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {product.removableIngredients && product.removableIngredients.length > 0 && (
          <div>
            <h3 className="font-medium text-espresso dark:text-cream mb-3">
              {isAr ? 'إزالة مكونات' : 'Remove Ingredients'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.removableIngredients.map((ing) => (
                <button
                  key={ing.id}
                  onClick={() => toggleRemovedIngredient(ing.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all ${
                    removedIngredients.includes(ing.id)
                      ? 'bg-red-500 text-white line-through'
                      : 'bg-espresso/5 text-espresso hover:bg-espresso/10 dark:bg-cream/5 dark:text-cream dark:hover:bg-cream/10'
                  }`}
                >
                  {isAr ? ing.nameAr : ing.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
