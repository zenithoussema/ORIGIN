'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Minus, Plus, AlertTriangle, Leaf } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { overlayVariants, modalVariants } from '@/lib/animations';
import type { MenuItem } from '@/data/menu';

interface QuickViewModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function QuickViewModal({ item, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { locale } = useLanguage();
  const addItem = useCartStore((s) => s.addItem);

  if (!item) return null;

  const name = locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.name;
  const description = locale === 'ar' ? item.descriptionAr : locale === 'fr' ? item.descriptionFr : item.description;
  const ingredients = locale === 'ar' ? item.ingredientsAr : item.ingredients;

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      nameFr: item.nameFr,
      price: item.price,
      image: item.image,
      category: item.category,
      quantity,
    } as Parameters<typeof addItem>[0] & { quantity?: number });
    onClose();
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-4 z-[105] mx-auto my-auto max-w-3xl overflow-hidden rounded-3xl border border-espresso/10 bg-white shadow-2xl dark:border-cream/10 dark:bg-espresso sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            role="dialog"
            aria-modal="true"
            aria-label={name}
          >
            <div className="flex flex-col sm:flex-row max-h-[90vh] overflow-y-auto">
              <div className="relative sm:w-1/2 aspect-square sm:aspect-auto sm:min-h-[500px]">
                <Image
                  src={item.image}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent sm:bg-gradient-to-r" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col p-6 sm:w-1/2">
                <div className="flex items-center gap-2 mb-2">
                  {item.isNew && (
                    <span className="rounded-full bg-caramel px-2.5 py-0.5 text-xs font-bold text-espresso">
                      NEW
                    </span>
                  )}
                  {item.tags.includes('popular') && (
                    <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                      POPULAR
                    </span>
                  )}
                  {item.tags.includes('spicy') && (
                    <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white">
                      SPICY
                    </span>
                  )}
                  {item.tags.includes('vegan') && (
                    <span className="rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-white">
                      VEGAN
                    </span>
                  )}
                </div>

                <h2 className="font-playfair text-2xl font-bold text-espresso dark:text-cream mb-1">
                  {name}
                </h2>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'fill-caramel text-caramel' : 'text-espresso/20 dark:text-cream/20'}`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-espresso/60 dark:text-cream/60">
                      {item.rating} ({item.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <p className="text-sm text-espresso/60 dark:text-cream/60 leading-relaxed mb-4">
                  {description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-espresso/60 dark:text-cream/60">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-caramel" />
                    {item.prepTime} min
                  </span>
                  {item.calories && (
                    <span>{item.calories} cal</span>
                  )}
                  {!item.isAvailable && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      {locale === 'ar' ? 'غير متاح' : 'Unavailable'}
                    </span>
                  )}
                </div>

                {item.allergens.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-espresso/40 dark:text-cream/40 mb-1">
                      {locale === 'ar' ? 'مسببات الحساسية' : 'Allergens'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {item.allergens.map((allergen) => (
                        <span
                          key={allergen}
                          className="rounded-lg bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-espresso/40 dark:text-cream/40 mb-1">
                    {locale === 'ar' ? 'المكونات' : 'Ingredients'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="flex items-center gap-1 rounded-lg bg-cream px-2 py-0.5 text-xs text-espresso dark:bg-charcoal dark:text-cream"
                      >
                        <Leaf className="h-3 w-3 text-green-500" />
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-espresso/10 dark:border-cream/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-caramel">
                      {formatPrice(item.price * quantity)}
                    </span>
                    <div className="flex items-center gap-3 rounded-xl border border-espresso/20 dark:border-cream/20">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="flex h-10 w-10 items-center justify-center text-espresso dark:text-cream hover:bg-espresso/5 dark:hover:bg-cream/5"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-espresso dark:text-cream">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="flex h-10 w-10 items-center justify-center text-espresso dark:text-cream hover:bg-espresso/5 dark:hover:bg-cream/5"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={!item.isAvailable}
                    className="w-full rounded-xl bg-caramel py-3.5 text-base font-semibold text-espresso transition-colors hover:bg-caramel/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {item.isAvailable
                      ? locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'
                      : locale === 'ar' ? 'غير متاح' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
