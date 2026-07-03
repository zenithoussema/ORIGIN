"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, Award, Coffee, Users } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "شغف لا ينتهي",
    description:
      "كل طبق نقدمه هو نتاج حبنا للطبخ وإيماننا بأن الطعام الجيد يجمع القلوب ويصنع الذكريات",
  },
  {
    icon: Award,
    title: "جودة لا تُساوم",
    description:
      "نختار مكوناتنا بعناية فائقة من أفضل المزارع المحلية والعالمية لنضمن لك أعلى معايير الجودة",
  },
  {
    icon: Coffee,
    title: "قهوة استثنائية",
    description:
      "نحمّص حبوب البن بأنفسنا يومياً لضمان نضارة لا مثيل لها في كل فنجان نقدمه لعملائنا الكرام",
  },
  {
    icon: Users,
    title: "ضيافة عربية أصيلة",
    description:
      "الكرم العربي هو أساس ضيافتنا. نستقبلكم كضيوف كرام ونحرص على راحتكم في كل لحظة",
  },
];

export default function AboutClient() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[var(--background)]">
      {/* Story Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-caramel text-sm tracking-wider uppercase mb-3">
            قصتنا
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-espresso dark:text-cream mb-6">
            من المطبخ إلى قلوبكم
          </h1>
          <div className="w-16 h-1 bg-caramel mx-auto rounded-full mb-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 text-lg leading-relaxed text-smoke-400 dark:text-cream/70 max-w-3xl mx-auto"
        >
          <p>
            بدأت رحلتنا في عام ٢٠١٨ من رؤية بسيطة: أن نقدم تجربة طعام عربية
            أصيلة في جودة عالمية. مؤسسنا الشيف أحمد، الذي تعلّم فنون الطبخ من
            جدّته في مطبخ العائلة، آمن بأن النكهات العربية تستحق أن تُقدم في
            أبهى صورة.
          </p>
          <p>
            بدأنا بمقهى صغير في حي الروضة بالرياض، وكنا نحمّص البن بأنفسنا
            ونُعد الأطباق بوصفات عائلية تنتقل من جيل لجيل. مع كل يوم، كسبنا
            ثقة المزيد من الضيوف الذين أصبحوا عائلتنا الممتدة.
          </p>
          <p>
            اليوم، نفتخر بتقديم تجربة متكاملة تجمع بين المأكولات العربية
            التقليدية والمشروبات العالمية الحديثة، كلها في أجواء تصميمية راقية
            تحكي قصة تراثنا العريق مع لمسة عصرية أنيقة.
          </p>
        </motion.div>
      </div>

      {/* Values Section */}
      <section className="bg-cream dark:bg-espresso-300 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading font-bold text-3xl text-espresso dark:text-cream text-center mb-14"
          >
            قيمنا
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--surface-elevated)] rounded-xl p-8 border border-espresso/5 dark:border-cream/5"
              >
                <div className="w-12 h-12 rounded-xl bg-caramel/10 dark:bg-caramel/20 flex items-center justify-center mb-5">
                  <value.icon size={24} className="text-caramel" />
                </div>
                <h3 className="font-heading font-bold text-xl text-espresso dark:text-cream mb-3">
                  {value.title}
                </h3>
                <p className="text-smoke-300 dark:text-cream/50 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { number: "٦+", label: "سنوات من التميز" },
              { number: "١٠٠+", label: "صنف في المنيو" },
              { number: "٥٠K+", label: "ضيف سعيد" },
              { number: "١٥", label: "شيف محترف" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="font-heading font-bold text-3xl sm:text-4xl text-caramel mb-2">
                  {stat.number}
                </div>
                <div className="text-smoke-300 dark:text-cream/50 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
