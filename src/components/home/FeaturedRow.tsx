'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Plus, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { formatPrice } from '@/lib/utils';
import { fadeUp, staggerContainer } from '@/lib/animations';
import type { HomepageMenuItem } from '@/data/homepage';

interface FeaturedRowProps {
  title: string;
  titleAr: string;
  items: HomepageMenuItem[];
  emoji?: string;
}

function ItemCard({ item, index }: { item: HomepageMenuItem; index: number }) {
  const { locale } = useLanguage();
  const name = locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.name;

  return (
    <motion.div
      variants={fadeUp}
      className="group relative w-[280px] flex-shrink-0 snap-start"
    >
      <Link href={`/menu?item=${item.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
          <Image
            src={item.image}
            alt={name}
            fill
            sizes="280px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'absolute inset-0 flex items-center justify-center bg-espresso/10 dark:bg-cream/10';
                fallback.innerHTML = '<span class="text-4xl">☕</span>';
                parent.appendChild(fallback);
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {item.viewers && item.viewers > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
              <Eye className="h-3 w-3" />
              {item.viewers} viewing
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(item.rating) ? 'fill-caramel text-caramel' : 'text-white/30'}`}
                />
              ))}
              <span className="ml-1 text-xs text-white/60">{item.rating}</span>
            </div>
            <h3 className="font-playfair text-lg font-semibold text-white mb-1 line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-caramel font-bold">{formatPrice(item.price)}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-caramel text-espresso opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110"
            aria-label={`Add ${name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

export function FeaturedRow({ title, titleAr, items, emoji }: FeaturedRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  const displayTitle = locale === 'ar' ? titleAr : title;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -600 : 600;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="py-6">
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {emoji && <span className="text-2xl">{emoji}</span>}
            <h2 className="font-playfair text-2xl font-bold text-espresso dark:text-cream sm:text-3xl">
              {displayTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso/20 text-espresso transition-colors hover:bg-espresso/5 dark:border-cream/20 dark:text-cream dark:hover:bg-cream/5"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso/20 text-espresso transition-colors hover:bg-espresso/5 dark:border-cream/20 dark:text-cream dark:hover:bg-cream/5"
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
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => (
            <ItemCard key={item.id} item={item} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
