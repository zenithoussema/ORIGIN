'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Plus, Clock } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import type { MenuItem } from '@/data/menu';

interface SearchResultCardProps {
  item: MenuItem;
  isHighlighted: boolean;
  onSelect: () => void;
}

export const SearchResultCard = forwardRef<HTMLDivElement, SearchResultCardProps>(
  function SearchResultCard({ item, isHighlighted, onSelect }, ref) {
    const { locale } = useLanguage();
    const addItem = useCartStore((s) => s.addItem);

    const name = locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.name;
    const description = locale === 'ar' ? item.descriptionAr : locale === 'fr' ? item.descriptionFr : item.description;

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
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

    return (
      <div ref={ref}>
        <Link
          href={`/menu/${item.id}`}
          onClick={onSelect}
          className={`flex items-center gap-4 rounded-xl px-4 py-3 text-left transition-all ${
            isHighlighted
              ? 'bg-caramel/10 ring-1 ring-caramel/30'
              : 'hover:bg-espresso/5 dark:hover:bg-cream/5'
          }`}
          role="option"
          aria-selected={isHighlighted}
        >
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
            <Image
              src={item.image}
              alt={name}
              width={56}
              height={56}
              sizes="56px"
              className="object-cover"
            />
            {item.isNew && (
              <span className="absolute left-0 top-0 rounded-br-lg bg-caramel px-1.5 py-0.5 text-[9px] font-bold text-espresso">
                NEW
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-espresso dark:text-cream">
                {name}
              </p>
              {item.tags.includes('chef-special') && (
                <span className="flex-shrink-0 rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-medium text-purple-600 dark:text-purple-400">
                  CHEF
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-espresso/50 dark:text-cream/50">
              {description}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-espresso/40 dark:text-cream/40">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-caramel text-caramel" />
                {item.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.prepTime}m
              </span>
              <span className="flex items-center gap-1 text-espresso/30 dark:text-cream/30">
                {item.calories} kcal
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-bold text-caramel">
              {formatPrice(item.price)}
            </span>
            <button
              onClick={handleAddToCart}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-caramel/10 text-caramel transition-colors hover:bg-caramel hover:text-espresso"
              aria-label={`Add ${name} to cart`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </Link>
      </div>
    );
  }
);
