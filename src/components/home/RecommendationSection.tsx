'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import type { RecommendationItem } from '@/hooks/useRecommendations';

interface RecommendationSectionProps {
  title: string;
  titleAr?: string;
  emoji?: string;
  fetchUrl: string;
  limit?: number;
  minItems?: number;
}

export function RecommendationSection({
  title,
  titleAr,
  emoji,
  fetchUrl,
  limit = 8,
  minItems = 2,
}: RecommendationSectionProps) {
  const { locale } = useLanguage();
  const { trackView, trackClick } = useInteractionTracking();
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = fetchUrl.includes('?')
      ? `${fetchUrl}&limit=${limit}`
      : `${fetchUrl}?limit=${limit}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setItems(data?.items || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [fetchUrl, limit]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }, []);

  if (isLoading || items.length < minItems) return null;

  return (
    <section className="relative py-4">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-espresso dark:text-cream">
          {emoji && <span className="mr-2">{emoji}</span>}
          {locale === 'ar' && titleAr ? titleAr : title}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-espresso/5 dark:bg-cream/5 hover:bg-espresso/10 dark:hover:bg-cream/10 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} className="text-espresso dark:text-cream" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-espresso/5 dark:bg-cream/5 hover:bg-espresso/10 dark:hover:bg-cream/10 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} className="text-espresso dark:text-cream" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 snap-start"
          >
            <Link
              href={`/menu/${item.id}`}
              className="block w-[200px] sm:w-[240px] group"
              onMouseEnter={() => trackView(item.id, item.category)}
              onClick={() => trackClick(item.id, item.category)}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-smoke-50 dark:bg-espresso-500 mb-2">
                <Image
                  src={item.image}
                  alt={locale === 'ar' ? item.nameAr : item.name}
                  fill
                  sizes="(max-width: 640px) 200px, 240px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent" />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-espresso/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <Star size={12} className="text-caramel fill-caramel" />
                  <span className="text-xs text-cream font-medium">{item.rating}</span>
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 rounded-full bg-caramel text-espresso">
                    <ShoppingCart size={14} />
                  </div>
                </div>
              </div>
              <h3 className="font-medium text-sm text-espresso dark:text-cream truncate">
                {locale === 'ar' ? item.nameAr : item.name}
              </h3>
              <p className="text-sm font-bold text-caramel">{formatPrice(item.price)}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
export default RecommendationSection;
