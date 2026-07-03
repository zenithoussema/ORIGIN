'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { fadeUp } from '@/lib/animations';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section className="py-20 bg-cream/50 dark:bg-espresso/50">
      <Container size="md">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="mb-4 inline-block text-sm font-medium uppercase tracking-wider text-caramel">
            {isAr ? 'النشرة الإخبارية' : 'Newsletter'}
          </span>
          <h2 className="mb-3 font-playfair text-3xl font-bold text-espresso dark:text-cream sm:text-4xl">
            {isAr ? 'احصل على عروض حصرية' : 'Get Exclusive Offers'}
          </h2>
          <p className="mb-8 text-espresso/60 dark:text-cream/60">
            {isAr
              ? 'اشترك لتحصل على أحدث العروض والتخفيضات'
              : 'Subscribe to receive the latest deals and promotions'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAr ? 'بريدك الإلكتروني' : 'Enter your email'}
              className="flex-1 rounded-xl border border-espresso/20 bg-white px-5 py-3.5 text-espresso placeholder:text-espresso/40 outline-none transition-colors focus:border-caramel focus:ring-1 focus:ring-caramel dark:border-cream/20 dark:bg-charcoal dark:text-cream dark:placeholder:text-cream/40"
              required
              aria-label={isAr ? 'البريد الإلكتروني' : 'Email address'}
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-caramel px-6 py-3.5 font-medium text-espresso transition-colors hover:bg-caramel/90 disabled:opacity-50"
              disabled={submitted}
            >
              {submitted ? (
                <>
                  <Check className="h-4 w-4" />
                  {isAr ? 'تم!' : 'Subscribed!'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {isAr ? 'اشترك' : 'Subscribe'}
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </Container>
    </section>
  );
}
export default NewsletterSection;
