'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { galleryImages } from '@/data/homepage';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function ExperienceSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { locale } = useLanguage();

  return (
    <section className="py-24 bg-cream/50 dark:bg-espresso/50">
      <Container size="xl">
        <SectionHeading
          title={locale === 'ar' ? 'تجربة أوريجين' : 'The ORIGIN Experience'}
          subtitle={locale === 'ar' ? 'لحظات من الأناقة والذوق الرفيع' : 'Moments of elegance and refined taste'}
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="columns-2 gap-4 sm:columns-3 lg:columns-4"
        >
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="mb-4 break-inside-avoid"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="group relative overflow-hidden rounded-2xl">
                <Image
                  src={image.src}
                  alt={image.caption}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-end bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent p-4"
                    >
                      <span className="text-sm font-medium text-white">
                        {image.caption}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
export default ExperienceSection;
