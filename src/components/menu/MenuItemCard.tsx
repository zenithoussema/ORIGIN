'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, Plus, Eye, Heart } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import type { MenuItem } from '@/data/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onQuickView: (item: MenuItem) => void;
}

const tagConfig: Record<string, { label: string; labelAr: string; className: string }> = {
  'new': { label: 'New', labelAr: 'جديد', className: 'bg-caramel text-espresso' },
  'popular': { label: 'Popular', labelAr: 'رائج', className: 'bg-red-500 text-white' },
  'spicy': { label: 'Spicy', labelAr: 'حار', className: 'bg-orange-500 text-white' },
  'vegan': { label: 'Vegan', labelAr: 'نباتي', className: 'bg-green-500 text-white' },
  'chef-special': { label: 'Chef\'s Pick', labelAr: 'اختيار الشيف', className: 'bg-purple-500 text-white' },
};

export function MenuItemCard({ item, onQuickView }: MenuItemCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { locale, t } = useLanguage();
  const addItem = useCartStore((s) => s.addItem);

  const name = locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.name;
  const activeTags = item.tags.filter((tag) => tag in tagConfig);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      nameFr: item.nameFr,
      price: item.price,
      image: item.image,
      category: item.category,
    });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <motion.div
      layout
      className="group relative w-[260px] flex-shrink-0 snap-start cursor-pointer"
      onClick={() => onQuickView(item)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-espresso/10 dark:bg-cream/10 animate-pulse" />
        )}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-espresso/10 dark:bg-cream/10">
            <span className="text-4xl">☕</span>
          </div>
        )}
        <Image
          src={item.image}
          alt={name}
          fill
          sizes="260px"
          className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadingComplete={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {activeTags.map((tag) => {
            const config = tagConfig[tag];
            return (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${config.className}`}
              >
                {locale === 'ar' ? config.labelAr : config.label}
              </span>
            );
          })}
        </div>

        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 backdrop-blur-sm'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 group-hover:-translate-y-2">
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(item.rating) ? 'fill-caramel text-caramel' : 'text-white/30'}`}
              />
            ))}
            <span className="ml-1 text-xs text-white/60">{item.rating}</span>
            <span className="text-xs text-white/40">({item.reviewCount})</span>
          </div>

          <h3 className="font-playfair text-lg font-semibold text-white mb-1 line-clamp-1">
            {name}
          </h3>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-caramel font-bold">{formatPrice(item.price)}</span>
            <span className="flex items-center gap-1 text-xs text-white/50">
              <Clock className="h-3 w-3" />
              {item.prepTime}min
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-caramel py-2.5 text-sm font-semibold text-espresso transition-colors hover:bg-caramel/90"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(item);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
