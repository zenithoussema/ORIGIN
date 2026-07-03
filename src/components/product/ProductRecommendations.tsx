'use client';

import { useProductRecommendations } from '@/hooks/useRecommendations';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Plus } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface ProductRecommendationsProps {
  productId: string;
}

export function ProductRecommendations({ productId }: ProductRecommendationsProps) {
  const { similar, fbt, meal, isLoading } = useProductRecommendations(productId);
  const { locale } = useLanguage();
  const { trackView, trackClick } = useInteractionTracking();
  const addItem = useCartStore((s) => s.addItem);

  if (isLoading) return null;

  const sections = [
    { title: 'Frequently Bought Together', titleAr: 'يُشترى معاً thường xuyên', items: fbt },
    { title: 'Complete Your Meal', titleAr: 'أكمل وجبتك', items: meal },
    { title: 'Similar Items', titleAr: 'منتجات مشابهة', items: similar },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="space-y-8 mt-8">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="font-heading text-lg font-bold text-espresso dark:text-cream mb-4">
            {locale === 'ar' ? section.titleAr : section.title}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {section.items.map((item) => (
              <div
                key={item.id}
                className="group"
                onMouseEnter={() => trackView(item.id, item.category)}
              >
                <Link
                  href={`/menu/${item.id}`}
                  onClick={() => trackClick(item.id, item.category)}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-smoke-50 dark:bg-espresso-500 mb-2">
                    <Image
                      src={item.image}
                      alt={locale === 'ar' ? item.nameAr : item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-espresso/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                      <Star size={10} className="text-caramel fill-caramel" />
                      <span className="text-[10px] text-cream font-medium">{item.rating}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-espresso dark:text-cream truncate">
                    {locale === 'ar' ? item.nameAr : item.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-bold text-caramel">{formatPrice(item.price)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem({
                          id: item.id,
                          name: item.name,
                          nameAr: item.nameAr,
                          nameFr: item.name,
                          price: item.price,
                          image: item.image,
                          category: item.category,
                        });
                      }}
                      className="p-1.5 rounded-full bg-caramel/10 text-caramel hover:bg-caramel hover:text-espresso transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
