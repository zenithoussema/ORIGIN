'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCartStore } from '@/lib/cart-store';
import { fadeUp } from '@/lib/animations';
import type { ProductDetail } from '@/data/menu-items';

interface RelatedItemsProps {
  items: ProductDetail[];
}

export function RelatedItems({ items }: RelatedItemsProps) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const addItem = useCartStore((s) => s.addItem);

  if (items.length === 0) return null;

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-12 border-t border-espresso/10 dark:border-cream/10"
    >
      <h2 className="font-playfair text-2xl font-bold text-espresso dark:text-cream mb-6">
        {isAr ? 'أيضاً قد يعجبك' : 'You May Also Like'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const name = isAr ? item.nameAr : item.name;
          return (
            <div
              key={item.id}
              className="group rounded-2xl bg-cream/50 overflow-hidden dark:bg-charcoal/50 transition-all hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.images[0]}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <button
                  onClick={() =>
                    addItem({
                      id: item.id,
                      name: item.name,
                      nameAr: item.nameAr,
                      nameFr: item.nameFr,
                      price: item.price,
                      image: item.images[0],
                      category: item.category,
                    })
                  }
                  className="absolute bottom-3 left-3 right-3 rounded-xl bg-caramel py-2 text-sm font-semibold text-espresso opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                >
                  + {isAr ? 'أضف' : 'Add'}
                </button>
              </div>
              <div className="p-3">
                <p className="font-medium text-espresso dark:text-cream text-sm truncate">{name}</p>
                <p className="text-caramel font-semibold text-sm">{item.price} DT</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
