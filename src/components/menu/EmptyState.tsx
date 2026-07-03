'use client';

import { motion } from 'framer-motion';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { fadeUp } from '@/lib/animations';

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-espresso/5 dark:bg-cream/5">
        <SearchX className="h-10 w-10 text-espresso/30 dark:text-cream/30" />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-espresso dark:text-cream">
        {isAr ? 'لم يتم العثور على أطباق' : 'No dishes found'}
      </h3>

      <p className="mb-6 max-w-sm text-sm text-espresso/50 dark:text-cream/50">
        {isAr
          ? 'جرّب تغيير الفلاتر أو البحث بكلمات مختلفة'
          : 'Try adjusting your filters or search with different keywords'}
      </p>

      <Button variant="outline" onClick={onReset} className="group">
        <RotateCcw className="mr-2 h-4 w-4 transition-transform group-hover:-rotate-180" />
        {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
      </Button>
    </motion.div>
  );
}
