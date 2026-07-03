'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShoppingBag,
  Check,
  Loader2,
  AlertCircle,
  MessageSquare,
  Store,
  UtensilsCrossed,
  Truck,
  Receipt,
  Plus,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import { computeTotals, getCartItemName, type CartItem } from '@/lib/cart-utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useUserStore } from '@/lib/user-store';
import { formatPrice } from '@/lib/utils';
import { DELIVERY_FEE, TAX_RATE } from '@/lib/currency';
import { checkoutSchema, type CheckoutInput } from '@/lib/validations';
import { PaymentSelector, type PaymentMethod } from '@/components/payment/PaymentSelector';
import { useCheckoutUpsells } from '@/hooks/useRecommendations';

const deliveryTypes = [
  { value: 'DINE_IN' as const, label: 'Dine In', icon: UtensilsCrossed, time: '25-35 min' },
  { value: 'PICKUP' as const, label: 'Pickup', icon: Store, time: '15-25 min' },
  { value: 'DELIVERY' as const, label: 'Delivery', icon: Truck, time: '35-50 min', extraFee: DELIVERY_FEE },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, addItem, clearCart, _hydrated } = useCartStore();
  const { setActiveTab } = useUserStore();
  const { locale } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CheckoutInput>({
    customerName: session?.user?.name || '',
    customerEmail: session?.user?.email || '',
    customerPhone: '',
    deliveryType: 'PICKUP',
    address: '',
    notes: '',
    paymentMethod: 'CASH',
    items: [],
  });

  const totals = useMemo(() => computeTotals(items), [items]);
  const cartItemIds = useMemo(() => items.map((i) => i.id), [items]);
  const { items: upsellItems } = useCheckoutUpsells(cartItemIds);

  const pricing = useMemo(() => {
    const subtotal = totals.subtotal;
    const deliveryFee = form.deliveryType === 'DELIVERY' ? DELIVERY_FEE : 0;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
    return { subtotal, deliveryFee, tax, total };
  }, [totals.subtotal, form.deliveryType]);

  const updateForm = useCallback(
    <K extends keyof CheckoutInput>(key: K, value: CheckoutInput[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (fieldErrors[key]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
      setError('');
    },
    [fieldErrors]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const checkoutItems = items.map((item) => ({ id: item.id, quantity: item.quantity }));
    const payload: CheckoutInput = {
      ...form,
      items: checkoutItems,
      customerName: form.customerName || session?.user?.name || '',
      customerEmail: form.customerEmail || session?.user?.email || '',
    };

    const validation = checkoutSchema.safeParse(payload);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 429) {
        setError(data.error || 'Too many attempts. Please wait.');
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      clearCart();

      if (form.paymentMethod === 'CARD' && data.stripe?.sessionUrl) {
        window.location.href = data.stripe.sessionUrl;
        return;
      }

      setActiveTab('orders');
      router.push('/profile');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!_hydrated || status === 'loading') {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-caramel" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream dark:bg-espresso flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag size={64} className="mx-auto mb-4 text-espresso/15 dark:text-cream/15" />
          <h1 className="font-heading text-2xl font-bold text-espresso dark:text-cream mb-2">
            Your cart is empty
          </h1>
          <p className="text-smoke-300 dark:text-cream/40 mb-6">
            Add some items before checking out
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-xl bg-caramel px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-caramel-400"
          >
            <ArrowLeft size={16} />
            Browse Menu
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-espresso pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm text-smoke-300 dark:text-cream/40 hover:text-caramel transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </Link>
          <h1 className="font-heading text-3xl font-bold text-espresso dark:text-cream">
            Checkout
          </h1>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4"
          >
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
              >
                <h2 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
                  Order Type
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {deliveryTypes.map((dt) => {
                    const isActive = form.deliveryType === dt.value;
                    return (
                      <button
                        key={dt.value}
                        type="button"
                        onClick={() => updateForm('deliveryType', dt.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          isActive
                            ? 'border-caramel bg-caramel/5'
                            : 'border-espresso/10 dark:border-cream/10 hover:border-caramel/50'
                        }`}
                      >
                        <dt.icon size={24} className={isActive ? 'text-caramel' : 'text-smoke-300 dark:text-cream/40'} />
                        <span className={`text-sm font-medium ${isActive ? 'text-caramel' : 'text-espresso dark:text-cream'}`}>
                          {dt.label}
                        </span>
                        <span className="text-[10px] text-smoke-300 dark:text-cream/40 flex items-center gap-1">
                          <Clock size={10} />
                          {dt.time}
                        </span>
                        {dt.extraFee && (
                          <span className="text-[10px] text-caramel">+{formatPrice(dt.extraFee)} fee</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
              >
                <h2 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={(e) => updateForm('customerName', e.target.value)}
                      placeholder="Ahmed Mohammed"
                      className={`w-full px-3 py-2.5 rounded-lg border bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all ${
                        fieldErrors.customerName ? 'border-red-500' : 'border-espresso/20 dark:border-cream/20'
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.customerName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => updateForm('customerPhone', e.target.value)}
                      placeholder="+966 50 123 4567"
                      className={`w-full px-3 py-2.5 rounded-lg border bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all ${
                        fieldErrors.customerPhone ? 'border-red-500' : 'border-espresso/20 dark:border-cream/20'
                      }`}
                    />
                    {fieldErrors.customerPhone && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.customerPhone}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => updateForm('customerEmail', e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full px-3 py-2.5 rounded-lg border bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all ${
                        fieldErrors.customerEmail ? 'border-red-500' : 'border-espresso/20 dark:border-cream/20'
                      }`}
                    />
                    {fieldErrors.customerEmail && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.customerEmail}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {form.deliveryType === 'DELIVERY' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
                      <h2 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-caramel" />
                        Delivery Address
                      </h2>
                      <textarea
                        value={form.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                        placeholder="Enter your full delivery address..."
                        rows={3}
                        className={`w-full px-3 py-2.5 rounded-lg border bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all resize-none ${
                          fieldErrors.address ? 'border-red-500' : 'border-espresso/20 dark:border-cream/20'
                        }`}
                      />
                      {fieldErrors.address && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.address}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
              >
                <h2 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-caramel" />
                  Notes for Kitchen
                  <span className="text-xs font-normal text-smoke-300 dark:text-cream/40">(optional)</span>
                </h2>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  placeholder="Any special requests or allergies..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all resize-none"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
              >
                <PaymentSelector
                  selectedMethod={form.paymentMethod as PaymentMethod}
                  onSelect={(method) => updateForm('paymentMethod', method)}
                  amount={pricing.total}
                  disabled={isSubmitting}
                />
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6 sticky top-24"
              >
                <h2 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <OrderSummaryItem key={item.id} item={item} locale={locale} />
                  ))}
                </div>

                {upsellItems.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-smoke-300 dark:text-cream/50 mb-2 uppercase tracking-wide">
                      {locale === 'ar' ? 'أكمل وجبتك' : 'Complete your order'}
                    </p>
                    <div className="space-y-2">
                      {upsellItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-espresso/5 dark:bg-cream/5 hover:bg-espresso/10 dark:hover:bg-cream/10 transition-colors cursor-pointer"
                          onClick={() => {
                            addItem({
                              id: item.id,
                              name: item.name,
                              nameAr: item.nameAr,
                              nameFr: item.name,
                              price: item.price,
                              image: item.image,
                              category: item.category,
                            });
                          }}
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={32}
                            height={32}
                            sizes="32px"
                            className="rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-espresso dark:text-cream truncate">
                              {locale === 'ar' ? item.nameAr : item.name}
                            </p>
                            <p className="text-[10px] text-caramel">{formatPrice(item.price)}</p>
                          </div>
                          <div className="p-1 rounded-full bg-caramel/20 text-caramel flex-shrink-0">
                            <Plus size={10} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-espresso/10 dark:border-cream/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-smoke-300 dark:text-cream/50">Subtotal</span>
                    <span className="text-espresso dark:text-cream">{formatPrice(pricing.subtotal)}</span>
                  </div>
                  {pricing.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-smoke-300 dark:text-cream/50">Delivery Fee</span>
                      <span className="text-espresso dark:text-cream">{formatPrice(pricing.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-smoke-300 dark:text-cream/50">Tax (15%)</span>
                    <span className="text-espresso dark:text-cream">{formatPrice(pricing.tax)}</span>
                  </div>
                  <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t border-espresso/10 dark:border-cream/10">
                    <span className="text-espresso dark:text-cream">Total</span>
                    <span className="text-caramel">{formatPrice(pricing.total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-caramel py-3.5 text-sm font-semibold text-espresso transition-all hover:bg-caramel-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-caramel/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Pay {formatPrice(pricing.total)}
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[10px] text-smoke-300/60 dark:text-cream/30">
                  By placing this order, you agree to our terms of service
                </p>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderSummaryItem({ item, locale }: { item: CartItem; locale: string }) {
  const name = getCartItemName(item, locale);

  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-espresso/5 dark:bg-cream/5">
        <Image src={item.image} alt={name} width={40} height={40} sizes="40px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-espresso dark:text-cream truncate">{name}</p>
        <p className="text-[10px] text-smoke-300 dark:text-cream/40">Qty: {item.quantity}</p>
      </div>
      <span className="text-xs font-medium text-espresso dark:text-cream">
        {formatPrice(item.price * item.quantity)}
      </span>
    </div>
  );
}
