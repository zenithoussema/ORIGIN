'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Clock, Globe, Palette, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAdminStore } from '@/lib/admin-store';
import { staggerContainer, fadeUp } from '@/lib/animations';

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function SettingsTab() {
  const { settings, updateSettings } = useAdminStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      {/* Restaurant Info */}
      <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-6">
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-5 flex items-center gap-2">
          <Globe size={18} className="text-caramel" />
          Restaurant Information
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Name (EN)</label>
              <input
                value={form.restaurantName}
                onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Name (AR)</label>
              <input
                value={form.restaurantNameAr}
                onChange={(e) => setForm({ ...form, restaurantNameAr: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
                dir="rtl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Address (EN)</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Email</label>
              <input
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Phone</label>
              <input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-6">
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-5 flex items-center gap-2">
          <Palette size={18} className="text-caramel" />
          Theme Colors
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-espresso/20 dark:border-cream/20 cursor-pointer"
              />
              <input
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Secondary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-espresso/20 dark:border-cream/20 cursor-pointer"
              />
              <input
                value={form.secondaryColor}
                onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Opening Hours */}
      <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-6">
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-5 flex items-center gap-2">
          <Clock size={18} className="text-caramel" />
          Opening Hours
        </h3>
        <div className="space-y-3">
          {form.openingHours.map((day, i) => (
            <div key={i} className="flex items-center gap-4">
              <label className="flex items-center gap-2 w-28">
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(e) => {
                    const newHours = [...form.openingHours];
                    newHours[i] = { ...newHours[i], isOpen: e.target.checked };
                    setForm({ ...form, openingHours: newHours });
                  }}
                  className="rounded border-espresso/20 dark:border-cream/20 text-caramel focus:ring-caramel"
                />
                <span className={`text-sm ${day.isOpen ? 'text-espresso dark:text-cream' : 'text-smoke-300 dark:text-cream/30'}`}>
                  {dayNames[i]}
                </span>
              </label>
              <input
                type="time"
                value={day.open}
                disabled={!day.isOpen}
                onChange={(e) => {
                  const newHours = [...form.openingHours];
                  newHours[i] = { ...newHours[i], open: e.target.value };
                  setForm({ ...form, openingHours: newHours });
                }}
                className="px-3 py-1.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 disabled:opacity-30"
              />
              <span className="text-smoke-300 dark:text-cream/30">to</span>
              <input
                type="time"
                value={day.close}
                disabled={!day.isOpen}
                onChange={(e) => {
                  const newHours = [...form.openingHours];
                  newHours[i] = { ...newHours[i], close: e.target.value };
                  setForm({ ...form, openingHours: newHours });
                }}
                className="px-3 py-1.5 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 disabled:opacity-30"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Payment Settings */}
      <motion.div variants={fadeUp} className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-6">
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-5 flex items-center gap-2">
          <CreditCard size={18} className="text-caramel" />
          Payment & Delivery
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
            >
              <option value="TND">TND (DT)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Delivery Fee</label>
            <input
              type="number"
              value={form.deliveryFee}
              onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Min. Order</label>
            <input
              type="number"
              value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" leftIcon={<Save size={14} />} onClick={handleSave}>
          Save Settings
        </Button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-sage font-medium"
          >
            Settings saved!
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
