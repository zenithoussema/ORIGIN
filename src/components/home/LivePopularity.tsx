'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, TrendingUp, Clock } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

interface LiveMetric {
  id: string;
  icon: typeof Eye;
  text: string;
  textAr: string;
  value: number;
  suffix: string;
}

const baseMetrics: Omit<LiveMetric, 'value'>[] = [
  {
    id: 'viewers',
    icon: Eye,
    text: 'people are viewing the menu right now',
    textAr: 'شخص يتصفح القائمة الآن',
    suffix: '',
  },
  {
    id: 'orders',
    icon: TrendingUp,
    text: 'orders placed in the last 10 minutes',
    textAr: 'طلب في آخر 10 دقائق',
    suffix: '',
  },
  {
    id: 'popular',
    icon: Clock,
    text: 'Most ordered today: Saffron Latte',
    textAr: 'الأكثر طلباً اليوم: لاتيه الزعفران',
    suffix: '',
  },
];

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const mounted = useIsMounted();

  useEffect(() => {
    if (!mounted) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, mounted]);

  return <span className="font-bold text-caramel tabular-nums">{count}</span>;
}

export function LivePopularity() {
  const [metrics, setMetrics] = useState<LiveMetric[]>(() =>
    baseMetrics.map((m) => ({
      ...m,
      value: m.id === 'viewers' ? 47 : m.id === 'orders' ? 23 : 0,
    }))
  );
  const mounted = useIsMounted();

  const updateMetrics = useCallback(() => {
    setMetrics((prev) =>
      prev.map((m) => {
        if (m.id === 'viewers') {
          const delta = Math.floor(Math.random() * 7) - 3;
          return { ...m, value: Math.max(30, Math.min(80, m.value + delta)) };
        }
        if (m.id === 'orders') {
          const delta = Math.floor(Math.random() * 5) - 1;
          return { ...m, value: Math.max(15, Math.min(50, m.value + delta)) };
        }
        return m;
      })
    );
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [mounted, updateMetrics]);

  return (
    <section className="py-16 bg-gradient-to-r from-espresso via-charcoal to-espresso">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-3"
        >
          <AnimatePresence>
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.id}
                  layout
                  className="flex items-center gap-4 rounded-2xl border border-cream/10 bg-cream/5 p-5 backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-caramel/20">
                    <Icon className="h-5 w-5 text-caramel" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      {metric.value > 0 && <AnimatedCounter target={metric.value} />}
                      <span className="text-sm text-cream/60">{metric.suffix}</span>
                    </div>
                    <p className="text-xs text-cream/40 leading-tight">
                      {metric.textAr}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
