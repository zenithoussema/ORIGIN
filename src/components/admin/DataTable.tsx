'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  pageSize = 10,
  searchPlaceholder,
  searchValue,
  onSearch,
  onRowClick,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const startIdx = (page - 1) * pageSize;
  const pageData = data.slice(startIdx, startIdx + pageSize);

  return (
    <div className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 overflow-hidden">
      {onSearch && (
        <div className="p-4 border-b border-espresso/10 dark:border-cream/10">
          <div className="flex items-center gap-2 bg-smoke-50 dark:bg-espresso/50 rounded-lg px-3 py-2 max-w-sm">
            <Search size={16} className="text-smoke-300 dark:text-cream/30" />
            <input
              type="text"
              placeholder={searchPlaceholder || 'Search...'}
              value={searchValue || ''}
              onChange={(e) => onSearch(e.target.value)}
              className="bg-transparent text-sm text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/30 focus:outline-none w-full"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-espresso/10 dark:border-cream/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left text-xs font-medium text-smoke-300 dark:text-cream/50 uppercase tracking-wider px-4 py-3',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-smoke-300 dark:text-cream/40">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pageData.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'border-b border-espresso/5 dark:border-cream/5 last:border-0 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-smoke-50 dark:hover:bg-espresso/30'
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 text-sm', col.className)}>
                        {col.render
                          ? col.render(item)
                          : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-espresso/10 dark:border-cream/10">
          <p className="text-xs text-smoke-300 dark:text-cream/40">
            Showing {startIdx + 1}–{Math.min(startIdx + pageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-smoke-300 dark:text-cream/40 hover:bg-smoke-50 dark:hover:bg-espresso/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page <= 3 ? i + 1 : page + i - 2;
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                    pageNum === page
                      ? 'bg-caramel text-espresso'
                      : 'text-smoke-300 dark:text-cream/40 hover:bg-smoke-50 dark:hover:bg-espresso/50'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-smoke-300 dark:text-cream/40 hover:bg-smoke-50 dark:hover:bg-espresso/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
