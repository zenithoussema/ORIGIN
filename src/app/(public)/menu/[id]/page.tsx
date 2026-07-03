import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { productDetails, getAllProductIds, getRelatedProducts } from '@/data/menu-items';
import { ProductContent } from '@/components/product/ProductContent';
import { JsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllProductIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = productDetails[id];
  if (!product) return { title: 'Not Found' };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      url: `https://origin.sa/menu/${id}`,
      images: product.images[0] ? [{ url: product.images[0], width: 800, height: 600, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
    alternates: { canonical: `https://origin.sa/menu/${id}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = productDetails[id];

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(id);

  return (
    <>
      <JsonLd
        type="Menu"
        data={{
          name: product.name,
          description: product.description,
          image: product.images[0],
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'TND',
            availability: product.isAvailable
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
          aggregateRating: product.reviewCount > 0
            ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              }
            : undefined,
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://origin.sa' },
          { name: 'Menu', url: 'https://origin.sa/menu' },
          { name: product.name, url: `https://origin.sa/menu/${id}` },
        ]}
      />
      <ProductContent product={product} relatedProducts={relatedProducts} />
    </>
  );
}
