'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { menuCategories, type MenuCategory, type MenuTag, type SortOption } from '@/data/menu';
import type { SearchFilters as SearchFiltersType } from '@/lib/search-engine';
import { defaultFilters } from '@/lib/search-engine';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
  resultCount: number;
}

const ALL_TAGS: { id: MenuTag; en: string; ar: string }[] = [
  { id: 'vegan', en: 'Vegan', ar: 'نباتي' },
  { id: 'spicy', en: 'Spicy', ar: 'حار' },
  { id: 'gluten-free', en: 'Gluten-Free', ar: 'بدون غلوتين' },
  { id: 'light', en: 'Light', ar: 'خفيف' },
  { id: 'premium', en: 'Premium', ar: 'فاخر' },
  { id: 'chef-special', en: "Chef's Special", ar: 'اختيار الشيف' },
];

const SORT_OPTIONS: { id: SortOption; en: string; ar: string }[] = [
  { id: 'relevance', en: 'Relevance', ar: 'الصلة' },
  { id: 'popular', en: 'Most Popular', ar: 'الأكثر شعبية' },
  { id: 'rating', en: 'Highest Rated', ar: 'الأعلى تقييماً' },
  { id: 'price-asc', en: 'Price: Low → High', ar: 'السعر: من الأقل للأعلى' },
  { id: 'price-desc', en: 'Price: High → Low', ar: 'السعر: من الأعلى للأقل' },
  { id: 'newest', en: 'Newest', ar: 'الأحدث' },
];

const PRICE_RANGES: { label: { en: string; ar: string }; range: [number, number] }[] = [
  { label: { en: 'Under 25 DT', ar: 'أقل من 25 دينار' }, range: [0, 25] },
  { label: { en: '25 - 50 DT', ar: '25 - 50 دينار' }, range: [25, 50] },
  { label: { en: '50 - 100 DT', ar: '50 - 100 دينار' }, range: [50, 100] },
  { label: { en: '100 - 200 DT', ar: '100 - 200 دينار' }, range: [100, 200] },
  { label: { en: '200+ DT', ar: 'أكثر من 200 دينار' }, range: [200, 500] },
];

export function SearchFilters({ filters, onChange, resultCount }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const toggleCategory = (cat: MenuCategory) => {
    const current = filters.categories;
    const updated = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    onChange({ ...filters, categories: updated });
  };

  const toggleTag = (tag: MenuTag) => {
    const current = filters.tags;
    const updated = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    onChange({ ...filters, tags: updated });
  };

  const setPriceRange = (range: [number, number]) => {
    const isSame = filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1];
    onChange({ ...filters, priceRange: isSame ? [0, 500] : range });
  };

  const setSort = (sort: SortOption) => {
    onChange({ ...filters, sort });
  };

  const resetFilters = () => {
    onChange({ ...defaultFilters });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 500 ||
    filters.minRating > 0 ||
    filters.maxPrepTime < 60;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-espresso/20 px-4 py-2.5 text-sm text-espresso transition-colors hover:border-caramel/50 dark:border-cream/20 dark:text-cream lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {isAr ? 'الفلاتر' : 'Filters'}
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-caramel text-[10px] font-bold text-espresso">
            {filters.categories.length + filters.tags.length + (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500 ? 1 : 0)}
          </span>
        )}
      </button>

      <div className="hidden lg:block">
        <FilterContent
          filters={filters}
          resultCount={resultCount}
          isAr={isAr}
          toggleCategory={toggleCategory}
          toggleTag={toggleTag}
          setPriceRange={setPriceRange}
          setSort={setSort}
          resetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: isAr ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? '-100%' : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 z-[111] w-80 bg-white p-6 shadow-2xl dark:bg-espresso lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-espresso dark:text-cream">
                  {isAr ? 'الفلاتر' : 'Filters'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-espresso/5 dark:hover:bg-cream/5"
                >
                  <X className="h-5 w-5 text-espresso dark:text-cream" />
                </button>
              </div>
              <FilterContent
                filters={filters}
                resultCount={resultCount}
                isAr={isAr}
                toggleCategory={toggleCategory}
                toggleTag={toggleTag}
                setPriceRange={setPriceRange}
                setSort={setSort}
                resetFilters={resetFilters}
                hasActiveFilters={hasActiveFilters}
                onApply={() => setIsOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface FilterContentProps {
  filters: SearchFiltersType;
  resultCount: number;
  isAr: boolean;
  toggleCategory: (cat: MenuCategory) => void;
  toggleTag: (tag: MenuTag) => void;
  setPriceRange: (range: [number, number]) => void;
  setSort: (sort: SortOption) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  onApply?: () => void;
}

function FilterContent({
  filters,
  resultCount,
  isAr,
  toggleCategory,
  toggleTag,
  setPriceRange,
  setSort,
  resetFilters,
  hasActiveFilters,
  onApply,
}: FilterContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto pb-6">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
            {isAr ? 'الترتيب' : 'Sort by'}
          </p>
          <div className="space-y-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSort(opt.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  filters.sort === opt.id
                    ? 'bg-caramel/10 font-medium text-caramel'
                    : 'text-espresso/60 hover:bg-espresso/5 dark:text-cream/60 dark:hover:bg-cream/5'
                }`}
              >
                {isAr ? opt.ar : opt.en}
                {filters.sort === opt.id && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-espresso/10 dark:border-cream/10 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
            {isAr ? 'الفئة' : 'Category'}
          </p>
          <div className="space-y-1">
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  filters.categories.includes(cat.id)
                    ? 'bg-caramel/10 font-medium text-caramel'
                    : 'text-espresso/60 hover:bg-espresso/5 dark:text-cream/60 dark:hover:bg-cream/5'
                }`}
              >
                <span className="text-base">{cat.emoji}</span>
                <span>{isAr ? cat.nameAr : cat.name}</span>
                {filters.categories.includes(cat.id) && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-espresso/10 dark:border-cream/10 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
            {isAr ? 'السعر' : 'Price Range'}
          </p>
          <div className="space-y-1">
            {PRICE_RANGES.map((pr) => {
              const isActive = filters.priceRange[0] === pr.range[0] && filters.priceRange[1] === pr.range[1];
              return (
                <button
                  key={pr.range[0]}
                  onClick={() => setPriceRange(pr.range)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-caramel/10 font-medium text-caramel'
                      : 'text-espresso/60 hover:bg-espresso/5 dark:text-cream/60 dark:hover:bg-cream/5'
                  }`}
                >
                  {isAr ? pr.label.ar : pr.label.en}
                  {isActive && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-espresso/10 dark:border-cream/10 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
            {isAr ? 'النوع' : 'Dietary'}
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  filters.tags.includes(tag.id)
                    ? 'bg-caramel text-espresso'
                    : 'border border-espresso/20 text-espresso/60 hover:border-caramel/50 dark:border-cream/20 dark:text-cream/60'
                }`}
              >
                {isAr ? tag.ar : tag.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-espresso/10 pt-4 dark:border-cream/10">
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs text-espresso/40 hover:text-caramel dark:text-cream/40 dark:hover:text-caramel transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            {isAr ? 'إعادة ضبط' : 'Reset'}
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-espresso/40 dark:text-cream/40">
            {resultCount} {isAr ? 'نتيجة' : 'results'}
          </span>
          {onApply && (
            <button
              onClick={onApply}
              className="rounded-xl bg-caramel px-6 py-2 text-sm font-semibold text-espresso transition-colors hover:bg-caramel/90"
            >
              {isAr ? 'تطبيق' : 'Apply'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
