'use client';

import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface SearchEmptyStateProps {
  query: string;
  onSuggestion: (suggestion: string) => void;
}

const suggestions = [
  { en: 'something sweet', ar: 'شيء حلو' },
  { en: 'cheap coffee', ar: 'قهوة رخيصة' },
  { en: 'spicy food', ar: 'طعام حار' },
  { en: 'vegan meal', ar: 'وجبة نباتية' },
  { en: 'under 50 dinars', ar: 'أقل من 50 دينار' },
  { en: 'best dessert', ar: 'أفضل حلوى' },
];

export function SearchEmptyState({ query, onSuggestion }: SearchEmptyStateProps) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-espresso/5 dark:bg-cream/5">
          <Search className="h-10 w-10 text-espresso/20 dark:text-cream/20" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -right-1 -top-1"
        >
          <Sparkles className="h-6 w-6 text-caramel/40" />
        </motion.div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-espresso dark:text-cream">
        {isAr ? 'لم يتم العثور على نتائج' : 'No dishes found'}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-espresso/50 dark:text-cream/50">
        {isAr
          ? `لا توجد نتائج لـ "${query}". جرّب كلمات مختلفة أو اreset الفلاتر.`
          : `No results for "${query}". Try different keywords or reset filters.`}
      </p>

      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
          {isAr ? 'جرّب البحث عن' : 'Try searching for'}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s.en}
              onClick={() => onSuggestion(isAr ? s.ar : s.en)}
              className="flex items-center gap-1.5 rounded-full border border-espresso/10 px-3 py-1.5 text-xs text-espresso/60 transition-colors hover:border-caramel/50 hover:text-caramel dark:border-cream/10 dark:text-cream/60 dark:hover:text-caramel"
            >
              {isAr ? s.ar : s.en}
              <ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
