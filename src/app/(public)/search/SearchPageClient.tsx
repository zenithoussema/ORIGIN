'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { searchItems, type SearchFilters, defaultFilters } from '@/lib/search-engine';
import { SearchFilters as SearchFiltersPanel } from '@/components/search/SearchFilters';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { SearchEmptyState } from '@/components/search/SearchEmptyState';
import { fadeUp, staggerContainer } from '@/lib/animations';

const ITEMS_PER_PAGE = 12;

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    sort: 'relevance',
  });
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 200);

  const allResults = useMemo(() => {
    return searchItems(debouncedQuery, filters, locale);
  }, [debouncedQuery, filters, locale]);

  const totalPages = Math.ceil(allResults.length / ITEMS_PER_PAGE);
  const paginatedResults = allResults.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const [prevDeps, setPrevDeps] = useState({ query: debouncedQuery, filters });
  if (prevDeps.query !== debouncedQuery || JSON.stringify(prevDeps.filters) !== JSON.stringify(filters)) {
    setPrevDeps({ query: debouncedQuery, filters });
    setPage(1);
  }

  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (prevInitialQuery !== initialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    const params = new URLSearchParams();
    if (value.trim()) params.set('q', value.trim());
    router.replace(`/search${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  }, [router]);

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso">
      <div className="pt-24 pb-16">
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/menu"
              className="mb-4 inline-flex items-center gap-2 text-sm text-espresso/50 transition-colors hover:text-caramel dark:text-cream/50"
            >
              <ChevronLeft className="h-4 w-4" />
              {isAr ? 'القائمة' : 'Menu'}
            </Link>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-espresso/30 dark:text-cream/30" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={isAr ? 'ابحث عن أطباق، مكونات، فئات...' : 'Search dishes, ingredients, categories...'}
                className="w-full rounded-2xl border border-espresso/10 bg-white py-4 pl-12 pr-12 text-lg text-espresso placeholder:text-espresso/30 outline-none transition-colors focus:border-caramel/50 focus:ring-2 focus:ring-caramel/20 dark:border-cream/10 dark:bg-charcoal dark:text-cream dark:placeholder:text-cream/30 dark:focus:border-caramel/50"
                aria-label="Search dishes"
              />
              {query.length > 0 && (
                <button
                  onClick={() => handleQueryChange('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-espresso/5 dark:hover:bg-cream/5"
                >
                  <X className="h-4 w-4 text-espresso/40 dark:text-cream/40" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SearchFiltersPanel
                  filters={filters}
                  onChange={setFilters}
                  resultCount={allResults.length}
                />
              </div>

              <p className="text-sm text-espresso/40 dark:text-cream/40">
                {allResults.length} {isAr ? 'نتيجة' : 'results'}
                {query && (
                  <span className="ml-1">
                    {isAr ? 'لـ' : 'for'} &ldquo;{query}&rdquo;
                  </span>
                )}
              </p>
            </div>
          </motion.div>

          <div className="grid gap-1 lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <SearchFiltersPanel
                  filters={filters}
                  onChange={setFilters}
                  resultCount={allResults.length}
                />
              </div>
            </div>

            <div className="min-h-[50vh]">
              {debouncedQuery.length === 0 && allResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Search className="mb-4 h-16 w-16 text-espresso/10 dark:text-cream/10" />
                  <h2 className="mb-2 text-xl font-semibold text-espresso dark:text-cream">
                    {isAr ? 'ابدأ البحث' : 'Start Searching'}
                  </h2>
                  <p className="text-sm text-espresso/40 dark:text-cream/40">
                    {isAr
                      ? 'اكتب اسم طبق أو مكون أو فئة للبحث'
                      : 'Type a dish name, ingredient, or category to search'}
                  </p>
                </div>
              ) : paginatedResults.length > 0 ? (
                <>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    {paginatedResults.map((result) => (
                      <motion.div key={result.item.id} variants={fadeUp}>
                        <SearchResultCard
                          item={result.item}
                          isHighlighted={false}
                          onSelect={() => {}}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-espresso/10 text-espresso transition-colors hover:border-caramel/50 hover:text-caramel disabled:opacity-30 dark:border-cream/10 dark:text-cream"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                            page === i + 1
                              ? 'bg-caramel text-espresso'
                              : 'border border-espresso/10 text-espresso/60 hover:border-caramel/50 dark:border-cream/10 dark:text-cream/60'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-espresso/10 text-espresso transition-colors hover:border-caramel/50 hover:text-caramel disabled:opacity-30 dark:border-cream/10 dark:text-cream"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <SearchEmptyState
                  query={debouncedQuery}
                  onSuggestion={(s) => handleQueryChange(s)}
                />
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
