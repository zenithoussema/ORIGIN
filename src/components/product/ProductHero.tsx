'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { formatPrice } from '@/lib/utils';
import { fadeUp } from '@/lib/animations';
import type { ProductDetail } from '@/data/menu-items';

interface ProductHeroProps {
  product: ProductDetail;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
  totalPrice: number;
}

export function ProductHero({ product, quantity, onQuantityChange, onAddToCart, totalPrice }: ProductHeroProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { locale } = useLanguage();

  const name = locale === 'ar' ? product.nameAr : locale === 'fr' ? product.nameFr : product.name;
  const description = locale === 'ar' ? product.descriptionAr : locale === 'fr' ? product.descriptionFr : product.description;

  return (
    <section className="pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={product.images[currentImage]}
                  alt={name}
                  className="h-full w-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-black/40 text-white backdrop-blur-sm'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 flex gap-2 justify-center">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentImage ? 'w-8 bg-caramel' : 'w-2 bg-espresso/20 dark:bg-cream/20'
                    }`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {product.isNew && (
                <span className="rounded-full bg-caramel px-3 py-1 text-xs font-bold text-espresso">NEW</span>
              )}
              {product.tags.includes('popular') && (
                <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">POPULAR</span>
              )}
              {product.tags.includes('chef-special') && (
                <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">CHEF&apos;S PICK</span>
              )}
              {product.isVegan && (
                <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">VEGAN</span>
              )}
            </div>

            <h1 className="font-playfair text-3xl font-bold text-espresso dark:text-cream sm:text-4xl mb-2">
              {name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-caramel text-caramel' : 'text-espresso/20 dark:text-cream/20'}`}
                  />
                ))}
                <span className="ml-2 text-sm text-espresso/60 dark:text-cream/60">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            <p className="text-espresso/60 dark:text-cream/60 leading-relaxed mb-6">
              {description}
            </p>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-bold text-caramel">{formatPrice(totalPrice)}</span>
              {quantity > 1 && (
                <span className="text-sm text-espresso/40 dark:text-cream/40">
                  ({formatPrice(product.price)} × {quantity})
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center rounded-xl border border-espresso/20 dark:border-cream/20">
                <button
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="flex h-12 w-12 items-center justify-center text-lg font-medium text-espresso dark:text-cream hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 text-center text-lg font-medium text-espresso dark:text-cream">
                  {quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="flex h-12 w-12 items-center justify-center text-lg font-medium text-espresso dark:text-cream hover:bg-espresso/5 dark:hover:bg-cream/5 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={onAddToCart}
                disabled={!product.isAvailable}
                className="flex-1 rounded-xl bg-caramel py-3.5 text-base font-semibold text-espresso transition-colors hover:bg-caramel/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.isAvailable
                  ? locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'
                  : locale === 'ar' ? 'غير متاح' : 'Unavailable'}
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-espresso/50 dark:text-cream/50">
              <span className="flex items-center gap-1.5">
                <span className="text-base">⏱️</span>
                {product.prepTime} min
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-base">🔥</span>
                {product.popularity}% popularity
              </span>
              {product.spicyLevel !== undefined && product.spicyLevel > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="text-base">🌶️</span>
                  {product.spicyLevel}/3
                </span>
              )}
              {product.allergens.length > 0 && (
                <span className="flex items-center gap-1.5 text-orange-500">
                  <span className="text-base">⚠️</span>
                  {product.allergens.join(', ')}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
