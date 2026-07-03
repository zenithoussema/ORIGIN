'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Brain,
  Save,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Pin,
  EyeOff,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { menuItems } from '@/data/menu';
import { formatPrice } from '@/lib/utils';

interface RecConfig {
  enabled: boolean;
  weights: Record<string, number>;
  pinnedItems: string[];
  excludedItems: string[];
}

export function RecommendationsTab() {
  const [config, setConfig] = useState<RecConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetch('/api/recommendations/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setConfig(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/recommendations/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch {
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePin = (itemId: string) => {
    if (!config) return;
    const pinned = config.pinnedItems.includes(itemId)
      ? config.pinnedItems.filter((id) => id !== itemId)
      : [...config.pinnedItems, itemId];
    setConfig({ ...config, pinnedItems: pinned });
  };

  const toggleExclude = (itemId: string) => {
    if (!config) return;
    const excluded = config.excludedItems.includes(itemId)
      ? config.excludedItems.filter((id) => id !== itemId)
      : [...config.excludedItems, itemId];
    setConfig({ ...config, excludedItems: excluded });
  };

  const updateWeight = (key: string, value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      weights: { ...config.weights, [key]: Math.max(0, Math.min(10, value)) },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-caramel" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-20 text-smoke-300 dark:text-cream/50">
        Failed to load recommendation settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain size={24} className="text-caramel" />
          <h2 className="font-heading text-xl font-bold text-espresso dark:text-cream">
            Recommendation Engine
          </h2>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-caramel px-4 py-2 text-sm font-semibold text-espresso transition-all hover:bg-caramel-400 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-3 text-sm ${
            saveMessage.includes('Failed')
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
              : 'bg-sage/10 text-sage'
          }`}
        >
          {saveMessage}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
            <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
              Engine Status
            </h3>
            <button
              type="button"
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
              className="flex items-center gap-3 w-full"
            >
              {config.enabled ? (
                <ToggleRight size={32} className="text-sage" />
              ) : (
                <ToggleLeft size={32} className="text-smoke-300" />
              )}
              <span className="text-sm font-medium text-espresso dark:text-cream">
                {config.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>

          <div className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
            <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
              Algorithm Weights
            </h3>
            <div className="space-y-4">
              {Object.entries(config.weights).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-espresso dark:text-cream capitalize">
                      {key.replace('_', ' ')}
                    </label>
                    <span className="text-xs text-smoke-300 dark:text-cream/50">{value}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={value}
                    onChange={(e) => updateWeight(key, parseFloat(e.target.value))}
                    className="w-full h-2 bg-espresso/10 dark:bg-cream/10 rounded-lg appearance-none cursor-pointer accent-caramel"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
            <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4 flex items-center gap-2">
              <BarChart3 size={18} />
              Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-smoke-300 dark:text-cream/50">Pinned items</span>
                <span className="font-medium text-espresso dark:text-cream">{config.pinnedItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-smoke-300 dark:text-cream/50">Excluded items</span>
                <span className="font-medium text-espresso dark:text-cream">{config.excludedItems.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6">
            <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
              Menu Items
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
              {menuItems.map((item) => {
                const isPinned = config.pinnedItems.includes(item.id);
                const isExcluded = config.excludedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      isExcluded
                        ? 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10'
                        : isPinned
                          ? 'border-caramel/30 bg-caramel/5'
                          : 'border-espresso/10 dark:border-cream/10 hover:border-espresso/20'
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      sizes="40px"
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-espresso dark:text-cream truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-smoke-300 dark:text-cream/50">
                        {formatPrice(item.price)} · {item.category}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => togglePin(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isPinned
                            ? 'bg-caramel/20 text-caramel'
                            : 'text-espresso/30 hover:text-caramel dark:text-cream/30'
                        }`}
                        title={isPinned ? 'Unpin' : 'Pin to homepage'}
                      >
                        <Pin size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExclude(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isExcluded
                            ? 'bg-red-100 text-red-500 dark:bg-red-900/30'
                            : 'text-espresso/30 hover:text-red-500 dark:text-cream/30'
                        }`}
                        title={isExcluded ? 'Include' : 'Exclude from recommendations'}
                      >
                        <EyeOff size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
