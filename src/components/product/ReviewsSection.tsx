'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { fadeUp } from '@/lib/animations';
import type { ProductDetail } from '@/data/menu-items';

interface ReviewsSectionProps {
  product: ProductDetail;
}

export function ReviewsSection({ product }: ReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const reviews = product.reviews ?? [];
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (reviews.length === 0) return null;

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-12 border-t border-espresso/10 dark:border-cream/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-2xl font-bold text-espresso dark:text-cream">
          {isAr ? 'التقييمات' : 'Reviews'}
        </h2>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-caramel text-caramel" />
          <span className="text-lg font-semibold text-espresso dark:text-cream">{product.rating}</span>
          <span className="text-sm text-espresso/40 dark:text-cream/40">
            ({product.reviewCount})
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {displayedReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-cream/50 p-5 dark:bg-charcoal/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-caramel/20 text-caramel text-sm font-bold">
                    {review.avatar ? (
                      <Image src={review.avatar} alt={review.name} width={40} height={40} sizes="40px" className="rounded-full object-cover" />
                    ) : (
                      getInitials(isAr ? review.nameAr : review.name)
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-espresso dark:text-cream text-sm">
                      {isAr ? review.nameAr : review.name}
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-3 w-3 ${j < review.rating ? 'fill-caramel text-caramel' : 'text-espresso/20 dark:text-cream/20'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-espresso/30 dark:text-cream/30">
                  {review.date}
                </span>
              </div>

              <p className="text-sm text-espresso/60 dark:text-cream/60 leading-relaxed">
                {isAr ? review.commentAr : review.comment}
              </p>

              {review.image && (
                <div className="mt-3 rounded-xl overflow-hidden max-w-xs">
                  <Image src={review.image} alt="Review" width={320} height={240} sizes="320px" className="w-full h-auto" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm font-medium text-caramel hover:text-caramel/80 transition-colors"
        >
          {showAll
            ? isAr ? 'عرض أقل' : 'Show Less'
            : isAr ? `عرض جميع التقييمات (${reviews.length})` : `View All Reviews (${reviews.length})`}
        </button>
      )}
    </motion.section>
  );
}
