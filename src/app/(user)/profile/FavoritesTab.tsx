'use client';

import { motion } from 'framer-motion';
import { Heart, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useUserStore } from '@/lib/user-store';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function FavoritesTab() {
  const { favorites, removeFavorite } = useUserStore();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (item: typeof favorites[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      nameFr: item.nameFr,
      price: item.price,
      image: item.image,
      category: item.category,
    });
  };

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-12 text-center"
      >
        <Heart size={48} className="mx-auto mb-4 text-smoke-300 dark:text-cream/20" />
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-2">
          No favorites yet
        </h3>
        <p className="text-sm text-smoke-300 dark:text-cream/40 mb-6">
          Save your favorite dishes for quick access.
        </p>
        <Link href="/menu">
          <Button variant="primary" leftIcon={<UtensilsCrossed size={16} />}>
            Explore Menu
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {favorites.map((item) => (
        <motion.div
          key={item.id}
          variants={fadeUp}
          className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 overflow-hidden hover-lift group"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <button
              onClick={() => removeFavorite(item.id)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-espresso/90 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
              aria-label={`Remove ${item.name} from favorites`}
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="p-4">
            <h3 className="font-heading font-semibold text-espresso dark:text-cream mb-1 truncate">
              {item.name}
            </h3>
            <p className="text-sm text-smoke-300 dark:text-cream/40 capitalize mb-3">
              {item.category}
            </p>
            <div className="flex items-center justify-between">
              <p className="font-heading font-bold text-caramel">
                {formatPrice(item.price)}
              </p>
              <Button
                variant="pill"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => handleAddToCart(item)}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
