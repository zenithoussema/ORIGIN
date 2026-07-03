'use client';

import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { searchItems, getSuggestions, getSearchableItemName } from '@/lib/search-engine';
import { SearchResultCard } from './SearchResultCard';
import { SearchSuggestions } from './SearchSuggestions';
import { SearchEmptyState } from './SearchEmptyState';
import { modalVariants, overlayVariants, staggerContainer, fadeUp } from '@/lib/animations';

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { locale, t } = useLanguage();
  const router = useRouter();
  const { recentSearches, addSearch, clearSearches } = useRecentSearches();

  const debouncedQuery = useDebounce(query, 200);

  const results = useMemo(() => {
    if (debouncedQuery.length === 0) return [];
    return searchItems(debouncedQuery, { ...defaultFilters, sort: 'relevance' }, locale);
  }, [debouncedQuery, locale]);

  const suggestions = useMemo(() => {
    if (debouncedQuery.length < 2) return [];
    return getSuggestions(debouncedQuery);
  }, [debouncedQuery]);

  const showSuggestions = query.length > 0 && suggestions.length > 0 && results.length === 0;
  const showResults = query.length > 0 && results.length > 0;

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }, []);

  const navigateToResult = useCallback(
    (item: (typeof results)[number]['item']) => {
      addSearch(query);
      closeModal();
      router.push(`/menu/${item.id}`);
    },
    [query, addSearch, closeModal, router]
  );

  const navigateToSearchPage = useCallback(() => {
    if (query.trim().length > 0) {
      addSearch(query);
      closeModal();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, addSearch, closeModal, router]);

  const totalItems = results.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeModal();
        } else {
          openModal();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openModal, closeModal]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset selection on query change
    setActiveIndex(-1);
  }, [debouncedQuery]);

  useEffect(() => {
    if (activeIndex >= 0 && activeIndex < totalItems && resultRefs.current[activeIndex]) {
      resultRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, totalItems]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < results.length) {
            navigateToResult(results[activeIndex].item);
          } else if (query.trim().length > 0) {
            navigateToSearchPage();
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeModal();
          break;
        case 'Tab':
          if (query.trim().length > 0) {
            navigateToSearchPage();
          }
          break;
      }
    },
    [activeIndex, totalItems, results, query, navigateToResult, navigateToSearchPage, closeModal]
  );

  return (
    <>
      <IconButton onClick={openModal} aria-label="Search (Ctrl+K)">
        <Search className="h-5 w-5" />
      </IconButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[10vh] sm:pt-[15vh]"
            onClick={closeModal}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-4 overflow-hidden rounded-2xl border border-espresso/10 bg-white shadow-2xl dark:border-cream/10 dark:bg-espresso"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
            >
              <div className="flex items-center gap-3 border-b border-espresso/10 px-6 py-4 dark:border-cream/10">
                <Search className="h-5 w-5 text-espresso/40 dark:text-cream/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('search.placeholder') ?? 'Search dishes, ingredients, categories...'}
                  className="flex-1 bg-transparent text-lg text-espresso placeholder:text-espresso/40 outline-none dark:text-cream dark:placeholder:text-cream/40"
                  aria-label="Search"
                  aria-expanded={showResults || showSuggestions}
                  aria-controls="search-results"
                  aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
                  role="combobox"
                  autoComplete="off"
                />
                <kbd className="hidden rounded-md border border-espresso/20 px-2 py-1 text-xs text-espresso/40 sm:inline-block dark:border-cream/20 dark:text-cream/40">
                  ESC
                </kbd>
                <IconButton onClick={closeModal} size="sm" aria-label="Close search">
                  <X className="h-4 w-4" />
                </IconButton>
              </div>

              <div
                ref={listRef}
                id="search-results"
                role="listbox"
                className="max-h-[60vh] overflow-y-auto"
                onKeyDown={handleKeyDown}
              >
                {query.length === 0 ? (
                  <SearchSuggestions
                    recentSearches={recentSearches}
                    onSelectRecent={(q) => {
                      setQuery(q);
                      addSearch(q);
                    }}
                    onClearRecent={clearSearches}
                  />
                ) : showSuggestions ? (
                  <div className="p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-espresso/30 dark:text-cream/30">
                      {locale === 'ar' ? 'اقتراحات' : 'Suggestions'}
                    </p>
                    <div className="space-y-1">
                      {suggestions.map((s, i) => (
                        <button
                          key={s}
                          onClick={() => {
                            setQuery(s);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-espresso transition-colors hover:bg-espresso/5 dark:text-cream dark:hover:bg-cream/5"
                          role="option"
                          aria-selected={false}
                        >
                          <Search className="h-4 w-4 text-espresso/30 dark:text-cream/30" />
                          <span className="flex-1">{s}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-espresso/20 dark:text-cream/20" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : showResults ? (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="p-2"
                  >
                    {results.map((result, i) => (
                      <motion.div key={result.item.id} variants={fadeUp}>
                        <SearchResultCard
                          ref={(el) => { resultRefs.current[i] = el; }}
                          item={result.item}
                          isHighlighted={i === activeIndex}
                          onSelect={() => navigateToResult(result.item)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <SearchEmptyState
                    query={query}
                    onSuggestion={(s) => setQuery(s)}
                  />
                )}
              </div>

              <div className="border-t border-espresso/10 px-6 py-3 dark:border-cream/10">
                <div className="flex items-center justify-between text-xs text-espresso/40 dark:text-cream/40">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-espresso/20 px-1.5 py-0.5 dark:border-cream/20">
                        <CornerDownLeft className="h-3 w-3" />
                      </kbd>
                      {locale === 'ar' ? 'اختيار' : 'select'}
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-espresso/20 px-1.5 py-0.5 dark:border-cream/20">↑↓</kbd>
                      {locale === 'ar' ? 'تنقل' : 'navigate'}
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-espresso/20 px-1.5 py-0.5 dark:border-cream/20">Tab</kbd>
                      {locale === 'ar' ? 'صفحة البحث' : 'search page'}
                    </span>
                  </div>
                  {query.length > 0 && (
                    <button
                      onClick={navigateToSearchPage}
                      className="flex items-center gap-1 text-caramel hover:text-caramel/80 transition-colors font-medium"
                    >
                      {locale === 'ar' ? 'عرض الكل' : 'View all'}
                      <span className="text-[10px] opacity-60">({results.length})</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
export default SearchModal;

const defaultFilters = {
  categories: [],
  tags: [],
  priceRange: [0, 500] as [number, number],
  maxPrepTime: 60,
  maxCalories: 1000,
  minRating: 0,
  onlyAvailable: true,
  sort: 'relevance' as const,
};
