"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Users, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ReservationForm {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  specialRequests: string;
}

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30",
  "19:00", "19:30", "20:00", "20:30", "21:00",
];

const GUEST_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

export default function ReservationsClient() {
  const { t, mounted } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState<ReservationForm>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    specialRequests: "",
  });

  const update = (field: keyof ReservationForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    form.name.trim().length >= 2 &&
    form.date &&
    form.time &&
    form.guests &&
    form.email.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
            date: form.date,
            time: form.time,
            guests: parseInt(form.guests, 10),
            specialRequests: form.specialRequests.trim() || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create reservation");
        }

        setStatus("success");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
      }
    });
  };

  if (status === "success") {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[var(--background)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium p-10"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-espresso dark:text-cream mb-2">
              {mounted ? t('reservations.success.title') : 'Reservation Confirmed!'}
            </h2>
            <p className="text-smoke-300 dark:text-cream/50 mb-6">
              {mounted ? t('reservations.success.message') : 'We will contact you shortly to confirm your booking.'}
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setStatus("idle");
                setForm({ name: "", email: "", phone: "", date: "", time: "", guests: "", specialRequests: "" });
              }}
            >
              {mounted ? t('reservations.success.newReservation') : 'Make Another Reservation'}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[var(--background)]">
      <div className="relative bg-espresso py-20 mb-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, rgba(200,136,42,0.4) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-caramel text-sm tracking-wider uppercase mb-3"
          >
            {mounted ? t('reservations.hero.subtitle') : 'احجز طاولتك'}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-cream mb-4"
          >
            {mounted ? t('reservations.hero.title') : 'نحجز لك أجمل الأماكن'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-cream/60 max-w-xl mx-auto text-base"
          >
            {mounted ? t('reservations.hero.description') : 'اختر التاريخ والوقت المناسب لك، وسنُهيئ لك تجربة لا تُنسى'}
          </motion.p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-8 sm:p-10 space-y-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <AnimatePresence>
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
                role="alert"
              >
                <AlertCircle size={16} />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              {mounted ? t('reservations.form.name') : 'الاسم الكامل'}
            </label>
            <div className="relative">
              <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-300" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder={mounted ? t('reservations.form.namePlaceholder') : 'أدخل اسمك الكامل'}
                className="w-full pr-10 pl-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              {mounted ? t('reservations.form.email') : 'البريد الإلكتروني'}
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder={mounted ? t('reservations.form.emailPlaceholder') : 'أدخل بريدك الإلكتروني'}
              className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              {mounted ? t('reservations.form.phone') : 'رقم الهاتف (اختياري)'}
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder={mounted ? t('reservations.form.phonePlaceholder') : '+216 XX XXX XXX'}
              className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
                {mounted ? t('reservations.form.date') : 'التاريخ'}
              </label>
              <div className="relative">
                <CalendarDays size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-300" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
                {mounted ? t('reservations.form.time') : 'الوقت'}
              </label>
              <div className="relative">
                <Clock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-300" />
                <select
                  required
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm appearance-none"
                >
                  <option value="">{mounted ? t('reservations.form.timePlaceholder') : 'اختر الوقت'}</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              {mounted ? t('reservations.form.guests') : 'عدد الأشخاص'}
            </label>
            <div className="relative">
              <Users size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-300" />
              <select
                required
                value={form.guests}
                onChange={(e) => update("guests", e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm appearance-none"
              >
                <option value="">{mounted ? t('reservations.form.guestsPlaceholder') : 'اختر العدد'}</option>
                {GUEST_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} {mounted ? t('reservations.form.guestsSuffix') : 'أشخاص'}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
              {mounted ? t('reservations.form.specialRequests') : 'طلبات خاصة (اختياري)'}
            </label>
            <textarea
              rows={3}
              value={form.specialRequests}
              onChange={(e) => update("specialRequests", e.target.value)}
              placeholder={mounted ? t('reservations.form.specialRequestsPlaceholder') : 'مثلاً: طاولة هادئة، مناسبة خاصة...'}
              className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm resize-none"
            />
          </div>

          <Button variant="primary" size="lg" fullWidth type="submit" disabled={!isValid || isPending}>
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {mounted ? t('reservations.form.submitting') : 'جارٍ الحجز...'}
              </span>
            ) : (
              mounted ? t('reservations.form.submit') : 'تأكيد الحجز'
            )}
          </Button>

          <p className="text-center text-sm text-smoke-300 dark:text-cream/40">
            {mounted ? t('reservations.form.note') : 'سنتواصل معك خلال ساعة لتأكيد حجزك'}
          </p>
        </motion.form>
      </div>
    </div>
  );
}
