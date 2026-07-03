"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import Button from "@/components/ui/Button";

const contactMethods = [
  {
    icon: MapPin,
    title: "العنوان",
    detail: "شارع الملك فهد، حي الروضة\nالرياض، المملكة العربية السعودية",
    action: null,
  },
  {
    icon: Phone,
    title: "الهاتف",
    detail: "+966 11 234 5678\n+966 50 123 4567",
    action: "tel:+966112345678",
  },
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    detail: "info@restaurant.com\nreservations@restaurant.com",
    action: "mailto:info@restaurant.com",
  },
];

export default function ContactClient() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[var(--background)]">
      {/* Page Header */}
      <div className="text-center mb-14 px-4">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-caramel text-sm tracking-wider uppercase mb-3"
        >
          تواصل معنا
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-espresso dark:text-cream mb-4"
        >
          نسعد بتواصلكم
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-smoke-300 dark:text-cream/60 max-w-xl mx-auto text-base"
        >
          سواء كان لديك استفسار أو ملاحظة أو ترغب في حجز مناسبة خاصة، فريقنا
          جاهز لخدمتك
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="card-premium p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-caramel/10 dark:bg-caramel/20 flex items-center justify-center shrink-0">
                  <method.icon size={22} className="text-caramel" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-base text-espresso dark:text-cream mb-1">
                    {method.title}
                  </h3>
                  {method.detail.split("\n").map((line, i) => (
                    <p
                      key={i}
                      className="text-smoke-300 dark:text-cream/50 text-sm"
                      dir={method.title === "الهاتف" ? "ltr" : "rtl"}
                    >
                      {method.action && i === 0 ? (
                        <a
                          href={method.action}
                          className="hover:text-caramel transition-colors"
                        >
                          {line}
                        </a>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <form className="card-premium p-8 sm:p-10 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
                    الاسم
                  </label>
                  <input
                    type="text"
                    placeholder="اسمك الكامل"
                    className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
                  الموضوع
                </label>
                <input
                  type="text"
                  placeholder="موضوع الرسالة"
                  className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso dark:text-cream mb-2">
                  الرسالة
                </label>
                <textarea
                  rows={5}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-espresso dark:text-cream placeholder:text-smoke-300 dark:placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-caramel/50 transition-all text-sm resize-none"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                type="submit"
                rightIcon={<Send size={18} />}
              >
                إرسال الرسالة
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-xl overflow-hidden border border-[var(--border)] h-72 sm:h-96 bg-cream-300 dark:bg-espresso-200 flex items-center justify-center"
        >
          <div className="text-center">
            <MapPin size={40} className="text-caramel/40 mx-auto mb-3" />
            <p className="text-smoke-300 dark:text-cream/40 text-sm">
              خريطة الموقع — شارع الملك فهد، حي الروضة، الرياض
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
