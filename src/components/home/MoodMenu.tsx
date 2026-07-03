'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getItemsByMood } from '@/data/homepage';
import { FeaturedRow } from './FeaturedRow';
import { moodOptions } from '@/data/homepage';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function MoodMenu() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { locale } = useLanguage();

  const filteredItems = selectedMood
    ? getItemsByMood(moodOptions.find((m) => m.id === selectedMood)?.filter ?? [])
    : [];

  return (
    <section className="py-20 bg-cream/50 dark:bg-espresso/50">
      <Container size="xl">
        <SectionHeading
          title={locale === 'ar' ? 'كيف تشعر اليوم؟' : 'How Are You Feeling Today?'}
          subtitle={locale === 'ar' ? 'اختر مزاجك وسننصحك' : 'Pick your mood and we\'ll suggest the perfect dish'}
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto"
        >
          {moodOptions.map((mood) => (
            <motion.button
              key={mood.id}
              variants={fadeUp}
              onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
              className={`group flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-300 ${
                selectedMood === mood.id
                  ? 'border-caramel bg-caramel/10 shadow-lg shadow-caramel/20'
                  : 'border-espresso/10 bg-white hover:border-caramel/50 dark:border-cream/10 dark:bg-charcoal/50 dark:hover:border-caramel/50'
              }`}
            >
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                {mood.emoji}
              </span>
              <span className="font-medium text-espresso dark:text-cream">
                {locale === 'ar' ? mood.labelAr : mood.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedMood && filteredItems.length > 0 && (
            <motion.div
              key={selectedMood}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-12"
            >
              <FeaturedRow
                title="Suggested for You"
                titleAr="مقترح لك"
                items={filteredItems}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
