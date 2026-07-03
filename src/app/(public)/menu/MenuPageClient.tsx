'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { MenuHero } from '@/components/menu/MenuHero';
import { FilterBar } from '@/components/menu/FilterBar';
import { MenuRow } from '@/components/menu/MenuRow';
import { QuickViewModal } from '@/components/menu/QuickViewModal';
import { EmptyState } from '@/components/menu/EmptyState';
import {
  menuItems,
  getItemsByCategory,
  getItemsByTag,
  getPopularItems,
  getNewItems,
  searchItems,
  sortItems,
  type MenuItem,
  type MenuCategory,
  type MenuTag,
  type SortOption,
} from '@/data/menu';

const defaultPriceRange: [number, number] = [0, 500];

export default function MenuPageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');
  const [activeTags, setActiveTags] = useState<MenuTag[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>(defaultPriceRange);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleTagToggle = useCallback((tag: MenuTag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleReset = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveTags([]);
    setSortBy('popular');
    setPriceRange(defaultPriceRange);
    setShowAvailableOnly(false);
  }, []);

  const filteredItems = useMemo(() => {
    let items = [...menuItems];

    if (searchQuery) {
      items = searchItems(searchQuery);
    }

    if (activeCategory !== 'all') {
      items = items.filter((item) => item.category === activeCategory);
    }

    if (activeTags.length > 0) {
      items = items.filter((item) =>
        activeTags.some((tag) => item.tags.includes(tag))
      );
    }

    items = items.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    if (showAvailableOnly) {
      items = items.filter((item) => item.isAvailable);
    }

    return sortItems(items, sortBy);
  }, [searchQuery, activeCategory, activeTags, priceRange, showAvailableOnly, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' ||
    activeCategory !== 'all' ||
    activeTags.length > 0 ||
    priceRange[0] !== defaultPriceRange[0] ||
    priceRange[1] !== defaultPriceRange[1] ||
    showAvailableOnly;

  const showRows = !hasActiveFilters;

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso">
      <MenuHero />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeTags={activeTags}
        onTagToggle={handleTagToggle}
        sortBy={sortBy}
        onSortChange={setSortBy}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        showAvailableOnly={showAvailableOnly}
        onShowAvailableChange={setShowAvailableOnly}
      />

      <div className="py-8">
        {showRows ? (
          <>
            <MenuRow
              title="Most Ordered"
              titleAr="الأكثر طلباً"
              items={getPopularItems(8)}
              emoji="🔥"
              onQuickView={setSelectedItem}
            />

            <MenuRow
              title="Coffee Selection"
              titleAr="تشكيلة القهوة"
              items={getItemsByCategory('coffee')}
              emoji="☕"
              onQuickView={setSelectedItem}
            />

            <MenuRow
              title="Main Dishes"
              titleAr="الأطباق الرئيسية"
              items={getItemsByCategory('food')}
              emoji="🍽️"
              onQuickView={setSelectedItem}
            />

            <MenuRow
              title="Desserts"
              titleAr="الحلويات"
              items={getItemsByCategory('desserts')}
              emoji="🍰"
              onQuickView={setSelectedItem}
            />

            <MenuRow
              title="Drinks"
              titleAr="المشروبات"
              items={getItemsByCategory('drinks')}
              emoji="🥤"
              onQuickView={setSelectedItem}
            />

            <MenuRow
              title="New Items"
              titleAr="جديدنا"
              items={getNewItems()}
              emoji="🆕"
              onQuickView={setSelectedItem}
            />

            <MenuRow
              title="Recommended"
              titleAr="مقترح لك"
              items={getItemsByTag('popular').slice(0, 6)}
              emoji="❤️"
              onQuickView={setSelectedItem}
            />
          </>
        ) : filteredItems.length > 0 ? (
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-espresso/50 dark:text-cream/50">
                {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'} found
              </p>
              <button
                onClick={handleReset}
                className="text-sm text-caramel hover:underline"
              >
                Clear all filters
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex justify-center">
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="relative aspect-[3/4] w-[260px] overflow-hidden rounded-2xl group">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="260px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-playfair text-lg font-semibold text-white mb-1">
                          {item.name}
                        </h3>
                        <p className="text-caramel font-bold">
                          {item.price} DT
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState onReset={handleReset} />
        )}
      </div>

      <QuickViewModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
