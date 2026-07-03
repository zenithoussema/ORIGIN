'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { staggerContainer, fadeUp } from '@/lib/animations';

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-caramel/30"
          style={{
            left: `${(i * 5.3) % 100}%`,
            top: `${(i * 7.1) % 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #1C0A00 0%, #2E1A10 25%, #1C0A00 50%, #3D2318 75%, #0D0500 100%)',
          }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          animate={mounted ? { scale: 1.08 } : {}}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(200, 136, 42, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(200, 136, 42, 0.12) 0%, transparent 40%)',
            backgroundSize: '100% 100%',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/60 via-transparent to-espresso/80" />
        <Particles />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-caramel/30 bg-caramel/10 px-5 py-2 text-sm font-medium text-caramel backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-caramel animate-pulse" />
              Premium Dining Experience
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mb-6 font-playfair text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Where Every Dish
            <br />
            <span className="text-gradient">Tells a Story</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mb-4 text-xl text-white/50 font-playfair"
            dir="rtl"
          >
            حيث تبدأ كل تجربة
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/60"
          >
            Experience culinary excellence in an atmosphere of refined luxury. Every plate, every sip, every moment — crafted to perfection.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/menu">
              <Button size="lg" className="group">
                Explore Menu
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/reservations">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white hover:text-espresso"
              >
                Reserve Table
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
