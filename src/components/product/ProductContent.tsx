'use client';

import { useState, useMemo } from 'react';
import { ProductHero } from './ProductHero';
import { DescriptionSection } from './DescriptionSection';
import { CustomizationOptions } from './CustomizationOptions';
import { NutritionInfo } from './NutritionInfo';
import { ReviewsSection } from './ReviewsSection';
import { RelatedItems } from './RelatedItems';
import { ProductRecommendations } from './ProductRecommendations';
import { useCartStore } from '@/lib/cart-store';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { useEffect } from 'react';
import type { ProductDetail } from '@/data/menu-items';

interface ProductContentProps {
  product: ProductDetail;
  relatedProducts: ProductDetail[];
}

export function ProductContent({ product, relatedProducts }: ProductContentProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes?.[1]?.id ?? product.sizes?.[0]?.id ?? null
  );
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const addItem = useCartStore((s) => s.addItem);
  const { locale } = useLanguage();
  const { trackView } = useInteractionTracking();

  useEffect(() => {
    trackView(product.id, product.category, product.tags);
  }, [product.id, product.category, product.tags, trackView]);

  const totalPrice = useMemo(() => {
    let base = product.price;
    if (selectedSize && product.sizes) {
      const size = product.sizes.find((s) => s.id === selectedSize);
      if (size) base += size.priceModifier;
    }
    for (const extraId of selectedExtras) {
      const extra = product.extras?.find((e) => e.id === extraId);
      if (extra) base += extra.price;
    }
    return base * quantity;
  }, [product.price, selectedSize, selectedExtras, quantity, product.sizes, product.extras]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      nameFr: product.nameFr,
      price: product.price,
      image: product.images[0],
      category: product.category,
      quantity,
    } as Parameters<typeof addItem>[0] & { quantity?: number });
  };

  return (
    <>
      <ProductHero
        product={product}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        totalPrice={totalPrice}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <DescriptionSection product={product} />
          <CustomizationOptions
            product={product}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            selectedExtras={selectedExtras}
            onExtrasChange={setSelectedExtras}
            removedIngredients={removedIngredients}
            onRemovedIngredientsChange={setRemovedIngredients}
          />
          <NutritionInfo product={product} />
          <ReviewsSection product={product} />
          <RelatedItems items={relatedProducts} />
          <ProductRecommendations productId={product.id} />
        </div>
      </div>
    </>
  );
}
