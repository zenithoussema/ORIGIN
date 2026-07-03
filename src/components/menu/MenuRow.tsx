'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { MenuItemCard } from './MenuItemCard';
import { fadeUp, staggerContainer } from '@/lib/animations';
import type { MenuItem } from '@/data/menu';

interface MenuRowProps {
  title: string;
  titleAr: string;
  items: MenuItem[];
  emoji?: string;
  onQuickView: (item: MenuItem) => void;
}

export function MenuRow({ title, titleAr, items, emoji, onQuickView }: MenuRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  const displayTitle = locale === 'ar' ? titleAr : title;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -540 : 540;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section className="py-4">
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {emoji && <span className="text-xl">{emoji}</span>}
            <h2 className="font-playfair text-xl font-bold text-espresso dark:text-cream sm:text-2xl">
              {displayTitle}
            </h2>
            <span className="rounded-full bg-espresso/10 px-2.5 py-0.5 text-xs font-medium text-espresso/60 dark:bg-cream/10 dark:text-cream/60">
              {items.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso/20 text-espresso transition-colors hover:bg-espresso/5 dark:border-cream/20 dark:text-cream dark:hover:bg-cream/5"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso/20 text-espresso transition-colors hover:bg-espresso/5 dark:border-cream/20 dark:text-cream dark:hover:bg-cream/5"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <motion.div
          ref={scrollRef}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} onQuickView={onQuickView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
