'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useIsMounted } from '@/hooks/useIsMounted';
import { testimonials } from '@/data/homepage';
import { fadeUp } from '@/lib/animations';

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const mounted = useIsMounted();
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [mounted, next]);

  const testimonial = testimonials[current];

  return (
    <section className="py-24">
      <Container size="lg">
        <SectionHeading
          title={isAr ? 'ماذا يقول ضيوفنا' : 'What Our Guests Say'}
          subtitle={isAr ? 'تجارب حقيقية من زبائننا الكرام' : 'Real experiences from our valued guests'}
        />

        <div className="relative mx-auto max-w-3xl">
          <div className="absolute -top-8 left-0 text-caramel/20">
            <Quote className="h-20 w-20" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="relative text-center"
            >
              <div className="mb-6 flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? 'fill-caramel text-caramel' : 'text-espresso/20 dark:text-cream/20'}`}
                  />
                ))}
              </div>

              <p className="mb-8 text-xl leading-relaxed text-espresso dark:text-cream sm:text-2xl font-playfair italic">
                &ldquo;{isAr ? testimonial.textAr : testimonial.text}&rdquo;
              </p>

              <div className="flex items-center justify-center gap-4">
                <Image
                  src={testimonial.avatar}
                  alt={isAr ? testimonial.nameAr : testimonial.name}
                  width={48}
                  height={48}
                  sizes="48px"
                  className="rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-medium text-espresso dark:text-cream">
                    {isAr ? testimonial.nameAr : testimonial.name}
                  </div>
                  <div className="text-sm text-espresso/40 dark:text-cream/40">
                    {testimonial.date}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-espresso/20 text-espresso transition-colors hover:bg-espresso/5 dark:border-cream/20 dark:text-cream dark:hover:bg-cream/5"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-caramel' : 'w-2 bg-espresso/20 dark:bg-cream/20'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-espresso/20 text-espresso transition-colors hover:bg-espresso/5 dark:border-cream/20 dark:text-cream dark:hover:bg-cream/5"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
export default TestimonialsSection;
