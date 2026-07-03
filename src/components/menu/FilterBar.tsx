'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, SlidersHorizontal, ChevronDown,
  Coffee, UtensilsCrossed, CakeSlice, Wine, Leaf, Flame, Star, Sparkles
} from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { MenuCategory, MenuTag, SortOption } from '@/data/menu';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: MenuCategory | 'all';
  onCategoryChange: (category: MenuCategory | 'all') => void;
  activeTags: MenuTag[];
  onTagToggle: (tag: MenuTag) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  showAvailableOnly: boolean;
  onShowAvailableChange: (show: boolean) => void;
}

const categories: { id: MenuCategory | 'all'; label: string; labelAr: string; icon: typeof Coffee; emoji: string }[] = [
  { id: 'all', label: 'All', labelAr: 'الكل', icon: Search, emoji: '🍽️' },
  { id: 'coffee', label: 'Coffee', labelAr: 'القهوة', icon: Coffee, emoji: '☕' },
  { id: 'food', label: 'Food', labelAr: 'الطعام', icon: UtensilsCrossed, emoji: '🍽️' },
  { id: 'desserts', label: 'Desserts', labelAr: 'الحلويات', icon: CakeSlice, emoji: '🍰' },
  { id: 'drinks', label: 'Drinks', labelAr: 'المشروبات', icon: Wine, emoji: '🥤' },
];

const tags: { id: MenuTag; label: string; labelAr: string; icon: typeof Leaf }[] = [
  { id: 'vegan', label: 'Vegan', labelAr: 'نباتي', icon: Leaf },
  { id: 'spicy', label: 'Spicy', labelAr: 'حار', icon: Flame },
  { id: 'popular', label: 'Popular', labelAr: 'رائج', icon: Star },
  { id: 'new', label: 'New', labelAr: 'جديد', icon: Sparkles },
];

const sortOptions: { value: SortOption; label: string; labelAr: string }[] = [
  { value: 'popular', label: 'Most Popular', labelAr: 'الأكثر شعبية' },
  { value: 'price-asc', label: 'Price: Low → High', labelAr: 'السعر: منخفض → مرتفع' },
  { value: 'price-desc', label: 'Price: High → Low', labelAr: 'السعر: مرتفع → منخفض' },
  { value: 'newest', label: 'Newest', labelAr: 'الأحدث' },
  { value: 'rating', label: 'Top Rated', labelAr: 'الأعلى تقييماً' },
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeTags,
  onTagToggle,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  showAvailableOnly,
  onShowAvailableChange,
}: FilterBarProps) {
  const [showSort, setShowSort] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { locale } = useLanguage();
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sticky top-20 z-40 border-b border-espresso/10 bg-white/80 backdrop-blur-xl dark:border-cream/10 dark:bg-espresso/80">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/40 dark:text-cream/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={locale === 'ar' ? 'ابحث في القائمة...' : 'Search menu...'}
                className="w-full rounded-xl border border-espresso/20 bg-white py-2.5 pl-10 pr-10 text-sm text-espresso placeholder:text-espresso/40 outline-none transition-colors focus:border-caramel focus:ring-1 focus:ring-caramel dark:border-cream/20 dark:bg-charcoal dark:text-cream dark:placeholder:text-cream/40"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso dark:text-cream/40 dark:hover:text-cream"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 rounded-xl border border-espresso/20 bg-white px-4 py-2.5 text-sm text-espresso transition-colors hover:border-caramel dark:border-cream/20 dark:bg-charcoal dark:text-cream"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {sortOptions.find((s) => s.value === sortBy)?.[locale === 'ar' ? 'labelAr' : 'label']}
                <ChevronDown className={`h-4 w-4 transition-transform ${showSort ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-espresso/10 bg-white shadow-xl dark:border-cream/10 dark:bg-espresso"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onSortChange(option.value);
                          setShowSort(false);
                        }}
                        className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${
                          sortBy === option.value
                            ? 'bg-caramel/10 text-caramel font-medium'
                            : 'text-espresso hover:bg-espresso/5 dark:text-cream dark:hover:bg-cream/5'
                        }`}
                      >
                        {locale === 'ar' ? option.labelAr : option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                showAdvanced
                  ? 'border-caramel bg-caramel/10 text-caramel'
                  : 'border-espresso/20 bg-white text-espresso hover:border-caramel dark:border-cream/20 dark:bg-charcoal dark:text-cream'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {locale === 'ar' ? 'متقدم' : 'Filters'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-caramel text-espresso shadow-lg shadow-caramel/20'
                    : 'bg-espresso/5 text-espresso hover:bg-espresso/10 dark:bg-cream/5 dark:text-cream dark:hover:bg-cream/10'
                }`}
              >
                <span>{cat.emoji}</span>
                {locale === 'ar' ? cat.labelAr : cat.label}
              </button>
            ))}

            <div className="hidden sm:block w-px bg-espresso/20 dark:bg-cream/20 mx-1" />

            {tags.map((tag) => {
              const Icon = tag.icon;
              return (
                <button
                  key={tag.id}
                  onClick={() => onTagToggle(tag.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all ${
                    activeTags.includes(tag.id)
                      ? 'bg-caramel text-espresso shadow-lg shadow-caramel/20'
                      : 'bg-espresso/5 text-espresso/60 hover:bg-espresso/10 dark:bg-cream/5 dark:text-cream/60 dark:hover:bg-cream/10'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {locale === 'ar' ? tag.labelAr : tag.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-6 rounded-xl border border-espresso/10 bg-cream/50 p-4 dark:border-cream/10 dark:bg-charcoal/50">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/40 dark:text-cream/40 mb-2">
                      {locale === 'ar' ? 'نطاق السعر' : 'Price Range'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={500}
                        value={priceRange[0]}
                        onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
                        className="flex-1 accent-caramel"
                      />
                      <span className="text-sm text-espresso dark:text-cream whitespace-nowrap">
                        {priceRange[0]} - {priceRange[1]} DT
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={500}
                        value={priceRange[1]}
                        onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                        className="flex-1 accent-caramel"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAvailableOnly}
                      onChange={(e) => onShowAvailableChange(e.target.checked)}
                      className="h-4 w-4 rounded border-espresso/30 text-caramel focus:ring-caramel accent-caramel"
                    />
                    <span className="text-sm text-espresso dark:text-cream">
                      {locale === 'ar' ? 'المتوفر فقط' : 'Available only'}
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
