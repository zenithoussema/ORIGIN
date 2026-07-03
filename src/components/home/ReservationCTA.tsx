'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { fadeUp, staggerContainer } from '@/lib/animations';

export function ReservationCTA() {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const timeSlots = ['7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-espresso via-charcoal to-espresso" />
      <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-caramel/10 blur-[100px]" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-caramel/5 blur-[80px]" />

      <Container size="lg" className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-caramel/30 bg-caramel/10 px-4 py-2 text-sm font-medium text-caramel">
                <Calendar className="h-4 w-4" />
                {isAr ? 'احجز الآن' : 'Book Now'}
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="mb-4 font-playfair text-3xl font-bold text-cream sm:text-4xl lg:text-5xl"
            >
              {isAr ? 'احجز طاولتك في ثوانٍ' : 'Book Your Table in Seconds'}
            </motion.h2>

            <motion.p variants={fadeUp} className="mb-8 text-cream/60 leading-relaxed">
              {isAr
                ? 'اختر الوقت المناسب لك واستمتع بتجربة لا تُنسى'
                : 'Choose your preferred time and enjoy an unforgettable experience'}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="flex items-center gap-2 rounded-xl border border-cream/20 bg-cream/5 px-4 py-2 text-sm text-cream/80"
                >
                  <Clock className="h-3.5 w-3.5 text-caramel" />
                  {time}
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link href="/reservations">
                <Button size="lg" className="group">
                  {isAr ? 'احجز الآن' : 'Reserve Now'}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="relative rounded-3xl border border-cream/10 bg-cream/5 p-8 backdrop-blur-sm">
              <div className="grid grid-cols-7 gap-1 mb-6">
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 2;
                  const isToday = day === 15;
                  const isAvailable = day > 0 && day <= 30;
                  return (
                    <div
                      key={i}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm ${
                        isToday
                          ? 'bg-caramel text-espresso font-bold'
                          : isAvailable
                            ? 'text-cream/60 hover:bg-cream/10 cursor-pointer'
                            : 'text-cream/20'
                      }`}
                    >
                      {isAvailable ? day : ''}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-sm text-cream/40">
                <span>{isAr ? 'يناير 2025' : 'January 2025'}</span>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-caramel" />
                  <span>{isAr ? '2-8 أشخاص' : '2-8 guests'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
export default ReservationCTA;
