'use client';

import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedRow } from '@/components/home/FeaturedRow';
import { MoodMenu } from '@/components/home/MoodMenu';
import { LivePopularity } from '@/components/home/LivePopularity';
import {
  featuredItems,
  coffeeCollection,
  chefSpecials,
  dessertItems,
} from '@/data/homepage';

function FallbackNull() {
  return null;
}

const RecommendationSection = dynamic(
  () => import('@/components/home/RecommendationSection').then((m) => m.default).catch(() => FallbackNull),
  { ssr: false }
);

const ChefStorySection = dynamic(
  () => import('@/components/home/ChefStorySection').then((m) => m.default).catch(() => FallbackNull),
  { ssr: false }
);

const ExperienceSection = dynamic(
  () => import('@/components/home/ExperienceSection').then((m) => m.default).catch(() => FallbackNull),
  { ssr: false }
);

const ReservationCTA = dynamic(
  () => import('@/components/home/ReservationCTA').then((m) => m.default).catch(() => FallbackNull),
  { ssr: false }
);

const TestimonialsSection = dynamic(
  () => import('@/components/home/TestimonialsSection').then((m) => m.default).catch(() => FallbackNull),
  { ssr: false }
);

const NewsletterSection = dynamic(
  () => import('@/components/home/NewsletterSection').then((m) => m.default).catch(() => FallbackNull),
  { ssr: false }
);

export function HomePageClient() {
  return (
    <>
      <HeroSection />

      <LivePopularity />

      <div className="py-8 space-y-2">
        <RecommendationSection
          title="Recommended For You"
          titleAr="مقترح لك"
          emoji="❤️"
          fetchUrl="/api/recommendations"
          limit={8}
          minItems={2}
        />

        <RecommendationSection
          title="Trending Today"
          titleAr="الرائج اليوم"
          emoji="🔥"
          fetchUrl="/api/recommendations/trending"
          limit={8}
          minItems={2}
        />

        <FeaturedRow
          title="Coffee Collection"
          titleAr="تشكيلة القهوة"
          items={coffeeCollection}
          emoji="☕"
        />

        <FeaturedRow
          title="Chef Specials"
          titleAr="أطباق الشيف الخاصة"
          items={chefSpecials}
          emoji="🍽️"
        />

        <RecommendationSection
          title="New Arrivals"
          titleAr="وصل حديثاً"
          emoji="🆕"
          fetchUrl="/api/recommendations?section=new_arrivals"
          limit={6}
          minItems={1}
        />

        <FeaturedRow
          title="Desserts"
          titleAr="الحلويات"
          items={dessertItems}
          emoji="🍰"
        />

        <RecommendationSection
          title="Chef's Picks"
          titleAr="اختيارات الشيف"
          emoji="👨‍🍳"
          fetchUrl="/api/recommendations?section=chefs_picks"
          limit={6}
          minItems={2}
        />
      </div>

      <MoodMenu />

      <ChefStorySection />

      <ExperienceSection />

      <ReservationCTA />

      <TestimonialsSection />

      <NewsletterSection />
    </>
  );
}
