'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  X,
  Search,
  Tag,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAdminStore } from '@/lib/admin-store';
import { menuCategoryConfig, adminTags, type AdminMenuItem, type AdminMenuCategory } from '@/data/admin-data';
import { formatPrice } from '@/lib/utils';
import { staggerContainer, fadeUp } from '@/lib/animations';

const categoryFilters: (AdminMenuCategory | 'all')[] = ['all', 'COFFEE', 'FOOD', 'DESSERTS', 'BEVERAGES', 'SPECIALS'];

export function MenuTab() {
  const {
    menuItems,
    menuCategoryFilter,
    setMenuCategoryFilter,
    searchQuery,
    setSearchQuery,
    toggleMenuItemAvailability,
    deleteMenuItem,
    addMenuItem,
    updateMenuItem,
    getFilteredMenuItems,
  } = useAdminStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredItems = getFilteredMenuItems();

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminMenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((cat) => {
            const isActive = menuCategoryFilter === cat;
            const config = cat === 'all' ? null : menuCategoryConfig[cat];
            return (
              <button
                key={cat}
                onClick={() => setMenuCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-caramel text-espresso shadow-sm'
                    : 'bg-white dark:bg-espresso-500 border border-espresso/10 dark:border-cream/10 text-smoke-300 dark:text-cream/50 hover:border-caramel hover:text-caramel'
                }`}
              >
                {cat === 'all' ? 'All' : `${config?.icon} ${config?.label}`}
              </button>
            );
          })}
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={openCreateModal}>
          Add Item
        </Button>
      </div>

      {/* Menu Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            variants={fadeUp}
            className={`bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 overflow-hidden group ${
              !item.isAvailable ? 'opacity-60' : ''
            }`}
          >
            <div className="relative h-36 bg-espresso/5 dark:bg-cream/5">
              <div className="w-full h-full bg-gradient-to-br from-caramel/10 to-espresso/5" />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => toggleMenuItemAvailability(item.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors ${
                    item.isAvailable
                      ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                  }`}
                  title={item.isAvailable ? 'Hide' : 'Show'}
                >
                  {item.isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => openEditModal(item)}
                  className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-espresso hover:bg-white/30 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  className="w-7 h-7 rounded-lg bg-red-500/20 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/90 dark:bg-espresso/90 text-espresso dark:text-cream">
                  {menuCategoryConfig[item.category].icon} {menuCategoryConfig[item.category].label}
                </span>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-medium text-sm text-espresso dark:text-cream leading-tight">{item.name}</h4>
                <span className="font-heading font-bold text-sm text-caramel">{formatPrice(item.price)}</span>
              </div>
              <p className="text-xs text-smoke-300 dark:text-cream/40 mb-2 line-clamp-1">{item.description}</p>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-caramel/10 text-caramel">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-smoke-300 dark:text-cream/30 mt-2">{item.orderCount} orders</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Search size={40} className="mx-auto mb-3 text-smoke-200 dark:text-cream/20" />
          <p className="text-sm text-smoke-300 dark:text-cream/40">No menu items found</p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-espresso-500 rounded-xl p-5 shadow-2xl w-full max-w-sm"
            >
              <h3 className="font-heading font-semibold text-espresso dark:text-cream mb-2">Delete Item?</h3>
              <p className="text-sm text-smoke-300 dark:text-cream/50 mb-4">
                This action cannot be undone. The item will be permanently removed.
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    deleteMenuItem(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <MenuItemModal
            item={editingItem}
            onClose={() => {
              setIsModalOpen(false);
              setEditingItem(null);
            }}
            onSave={(item) => {
              if (editingItem) {
                updateMenuItem(editingItem.id, item);
              } else {
                addMenuItem({
                  ...item,
                  id: `mi_${Date.now()}`,
                  orderCount: 0,
                  createdAt: new Date().toISOString(),
                } as AdminMenuItem);
              }
              setIsModalOpen(false);
              setEditingItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItemModal({
  item,
  onClose,
  onSave,
}: {
  item: AdminMenuItem | null;
  onClose: () => void;
  onSave: (item: Partial<AdminMenuItem>) => void;
}) {
  const [form, setForm] = useState({
    name: item?.name || '',
    nameAr: item?.nameAr || '',
    nameFr: item?.nameFr || '',
    description: item?.description || '',
    descriptionAr: item?.descriptionAr || '',
    descriptionFr: item?.descriptionFr || '',
    price: item?.price || 0,
    category: (item?.category || 'COFFEE') as AdminMenuCategory,
    tags: item?.tags || [] as string[],
    isAvailable: item?.isAvailable ?? true,
  });

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-espresso/10 dark:border-cream/10">
          <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream">
            {item ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-smoke-300 dark:text-cream/40 hover:bg-smoke-50 dark:hover:bg-espresso/50">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Name (EN)</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Name (AR)</label>
              <input
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Description (EN)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Price (TND)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as AdminMenuCategory })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              >
                {(Object.keys(menuCategoryConfig) as AdminMenuCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {menuCategoryConfig[cat].icon} {menuCategoryConfig[cat].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {adminTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    form.tags.includes(tag)
                      ? 'bg-caramel text-espresso'
                      : 'border border-espresso/10 dark:border-cream/10 text-smoke-300 dark:text-cream/50 hover:border-caramel'
                  }`}
                >
                  <Tag size={10} />
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              className="rounded border-espresso/20 dark:border-cream/20 text-caramel focus:ring-caramel"
            />
            <label htmlFor="available" className="text-sm text-espresso dark:text-cream">Available for order</label>
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-espresso/10 dark:border-cream/10">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSave(form)}
            className="flex-1"
          >
            {item ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
