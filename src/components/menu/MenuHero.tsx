'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function MenuHero() {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-espresso via-charcoal to-transparent pt-32 pb-16">
      <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-caramel/10 blur-[100px]" />
      <div className="absolute bottom-0 left-0 h-[200px] w-[200px] rounded-full bg-caramel/5 blur-[80px]" />

      <Container size="xl" className="relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.span
            variants={fadeUp}
            className="mb-4 inline-block rounded-full border border-caramel/30 bg-caramel/10 px-4 py-1.5 text-sm font-medium text-caramel"
          >
            {isAr ? 'منيو أوريجين' : 'ORIGIN Menu'}
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mb-4 font-playfair text-4xl font-bold text-cream sm:text-5xl lg:text-6xl"
          >
            {isAr ? 'استكشف قائمتنا' : 'Explore Our Menu'}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            dir="rtl"
            className="mb-2 text-lg text-cream/40 font-playfair"
          >
            {isAr ? 'اكتشف نكهات صنعت بشغف' : 'Discover flavors crafted with passion'}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-xl text-cream/50"
          >
            {isAr
              ? 'من أجود أنواع القهوة إلى أطباق الشيف الحصرية، كل قطعة تحكى قصة.'
              : 'From premium coffee to exclusive chef creations, every dish tells a story.'}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
