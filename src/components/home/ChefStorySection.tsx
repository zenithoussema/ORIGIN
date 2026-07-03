'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { chefStory } from '@/data/homepage';
import { slideLeft, slideRight } from '@/lib/animations';

export function ChefStorySection() {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  return (
    <section className="py-24 overflow-hidden">
      <Container size="xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
              <Image
                src={chefStory.image}
                alt={isAr ? chefStory.nameAr : chefStory.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 rounded-2xl bg-caramel p-6 text-espresso shadow-2xl lg:-right-10">
              <div className="text-3xl font-bold font-playfair">20+</div>
              <div className="text-sm opacity-80">Years of Excellence</div>
            </div>
          </motion.div>

          <motion.div
            variants={slideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-wider text-caramel">
              {isAr ? 'قصة الشيف' : 'Chef\'s Story'}
            </span>
            <h2 className="mb-4 font-playfair text-3xl font-bold text-espresso dark:text-cream sm:text-4xl lg:text-5xl">
              {isAr ? chefStory.nameAr : chefStory.name}
            </h2>
            <p className="mb-2 text-lg font-medium text-caramel">
              {isAr ? chefStory.titleAr : chefStory.title}
            </p>
            <p className="mb-8 text-espresso/60 dark:text-cream/60 leading-relaxed">
              {isAr ? chefStory.bioAr : chefStory.bio}
            </p>

            <div className="relative mb-8 rounded-2xl bg-cream/50 p-6 dark:bg-charcoal/50">
              <Quote className="absolute top-4 left-4 h-8 w-8 text-caramel/20" />
              <p className="relative pl-8 font-playfair text-lg italic text-espresso dark:text-cream">
                {isAr ? chefStory.philosophyAr : chefStory.philosophy}
              </p>
            </div>

            <Link href="/about">
              <Button variant="outline" size="lg" className="group">
                {isAr ? 'تعرّف على الشيف' : 'Meet Our Chef'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
export default ChefStorySection;
