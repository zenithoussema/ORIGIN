'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, Star, Trash2, Flame } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getTrendingItems, getPopularItems, getNewItems } from '@/lib/search-engine';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface SearchSuggestionsProps {
  recentSearches: string[];
  onSelectRecent: (query: string) => void;
  onClearRecent: () => void;
}

export function SearchSuggestions({ recentSearches, onSelectRecent, onClearRecent }: SearchSuggestionsProps) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const trending = getTrendingItems(4);
  const popular = getPopularItems(4);
  const newItems = getNewItems(4);

  return (
    <div className="space-y-6 p-4">
      {recentSearches.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
              <Clock className="h-3.5 w-3.5" />
              {isAr ? 'عمليات البحث الأخيرة' : 'Recent Searches'}
            </div>
            <button
              onClick={onClearRecent}
              className="text-[10px] text-espresso/30 hover:text-caramel dark:text-cream/30 dark:hover:text-caramel transition-colors"
            >
              {isAr ? 'مسح الكل' : 'Clear all'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((query) => (
              <button
                key={query}
                onClick={() => onSelectRecent(query)}
                className="group flex items-center gap-2 rounded-full border border-espresso/10 px-3 py-1.5 text-sm text-espresso/60 transition-all hover:border-caramel/50 hover:text-caramel dark:border-cream/10 dark:text-cream/60"
              >
                <Clock className="h-3 w-3 text-espresso/20 group-hover:text-caramel dark:text-cream/20" />
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
          <TrendingUp className="h-3.5 w-3.5" />
          {isAr ? 'الأكثر رواجاً' : 'Trending'}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {trending.map((item) => (
            <Link
              key={item.id}
              href={`/menu/${item.id}`}
              className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-espresso/5 dark:hover:bg-cream/5"
            >
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                <Image src={item.image} alt={item.name} width={40} height={40} sizes="40px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-espresso dark:text-cream">
                  {isAr ? item.nameAr : item.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-espresso/40 dark:text-cream/40">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-caramel text-caramel" />
                    {item.rating}
                  </span>
                  <span>{formatPrice(item.price)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {newItems.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
            <Flame className="h-3.5 w-3.5" />
            {isAr ? 'جديد' : 'New Arrivals'}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {newItems.map((item) => (
              <Link
                key={item.id}
                href={`/menu/${item.id}`}
                className="group flex-shrink-0 w-36 rounded-xl border border-espresso/10 p-2 transition-all hover:border-caramel/30 dark:border-cream/10"
              >
                <div className="mb-2 aspect-square overflow-hidden rounded-lg">
                  <Image src={item.image} alt={item.name} fill sizes="144px" className="object-cover transition-transform group-hover:scale-105" />
                </div>
                <p className="truncate text-xs font-medium text-espresso dark:text-cream">
                  {isAr ? item.nameAr : item.name}
                </p>
                <p className="text-[10px] font-bold text-caramel">{formatPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {popular.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
            <Star className="h-3.5 w-3.5" />
            {isAr ? 'الأكثر طلباً' : 'Most Ordered'}
          </div>
          <div className="space-y-1">
            {popular.slice(0, 3).map((item, i) => (
              <Link
                key={item.id}
                href={`/menu/${item.id}`}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-espresso/5 dark:hover:bg-cream/5"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-caramel/10 text-[10px] font-bold text-caramel">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-espresso dark:text-cream">
                    {isAr ? item.nameAr : item.name}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-caramel">{formatPrice(item.price)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
