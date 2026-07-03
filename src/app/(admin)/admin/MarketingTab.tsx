'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Megaphone,
  X,
  Globe,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminStore } from '@/lib/admin-store';
import { type AdminNewsPost, type AdminNewsStatus } from '@/data/admin-data';
import { staggerContainer, fadeUp } from '@/lib/animations';

const statusConfig: Record<AdminNewsStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-smoke-300', bg: 'bg-smoke-100 dark:bg-smoke-400/20' },
  scheduled: { label: 'Scheduled', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  expired: { label: 'Expired', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
};

export function MarketingTab() {
  const { news, addNews, updateNews, deleteNews, searchQuery, getFilteredNews } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminNewsPost | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredNews = getFilteredNews();

  const openCreate = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const openEdit = (post: AdminNewsPost) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-smoke-300 dark:text-cream/40">{filteredNews.length} posts</p>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>
          New Post
        </Button>
      </div>

      {/* News Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.map((post) => {
          const status = statusConfig[post.status];
          return (
            <motion.div
              key={post.id}
              variants={fadeUp}
              className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 overflow-hidden"
            >
              <div className="h-36 bg-gradient-to-br from-caramel/10 to-espresso/5 relative">
                {post.showOnHomepage && (
                  <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-caramel text-espresso">
                    Homepage Banner
                  </span>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => openEdit(post)}
                    className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-espresso hover:bg-white/30 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(post.id)}
                    className="w-7 h-7 rounded-lg bg-red-500/20 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm text-espresso dark:text-cream">{post.title}</h4>
                    <p className="text-xs text-smoke-300 dark:text-cream/40">{post.titleAr}</p>
                  </div>
                  <StatusBadge label={status.label} color={status.color} bg={status.bg} />
                </div>
                <p className="text-xs text-smoke-300 dark:text-cream/50 line-clamp-2 mb-3">{post.content}</p>
                <div className="flex items-center gap-3 text-[10px] text-smoke-300 dark:text-cream/40">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(post.startDate).toLocaleDateString()} – {new Date(post.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={10} />
                    {post.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <Megaphone size={40} className="mx-auto mb-3 text-smoke-200 dark:text-cream/20" />
          <p className="text-sm text-smoke-300 dark:text-cream/40">No news posts found</p>
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
              <h3 className="font-heading font-semibold text-espresso dark:text-cream mb-2">Delete Post?</h3>
              <p className="text-sm text-smoke-300 dark:text-cream/50 mb-4">This action cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    deleteNews(deleteConfirm);
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
          <NewsModal
            post={editingPost}
            onClose={() => {
              setIsModalOpen(false);
              setEditingPost(null);
            }}
            onSave={(data) => {
              if (editingPost) {
                updateNews(editingPost.id, data);
              } else {
                addNews({
                  ...data,
                  id: `news_${Date.now()}`,
                  createdAt: new Date().toISOString(),
                } as AdminNewsPost);
              }
              setIsModalOpen(false);
              setEditingPost(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewsModal({
  post,
  onClose,
  onSave,
}: {
  post: AdminNewsPost | null;
  onClose: () => void;
  onSave: (data: Partial<AdminNewsPost>) => void;
}) {
  const [form, setForm] = useState({
    title: post?.title || '',
    titleAr: post?.titleAr || '',
    content: post?.content || '',
    contentAr: post?.contentAr || '',
    startDate: post?.startDate || '',
    endDate: post?.endDate || '',
    isActive: post?.isActive ?? false,
    showOnHomepage: post?.showOnHomepage ?? false,
    status: (post?.status || 'draft') as AdminNewsStatus,
  });

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
            {post ? 'Edit Post' : 'New Post'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-smoke-300 dark:text-cream/40 hover:bg-smoke-50 dark:hover:bg-espresso/50">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Title (EN)</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Title (AR)</label>
              <input
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Content (EN)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-smoke-300 dark:text-cream/50 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as AdminNewsStatus })}
              className="w-full px-3 py-2 rounded-lg border border-espresso/20 dark:border-cream/20 bg-smoke-50 dark:bg-espresso/50 text-sm text-espresso dark:text-cream focus:outline-none focus:ring-2 focus:ring-caramel/50"
            >
              {(Object.keys(statusConfig) as AdminNewsStatus[]).map((s) => (
                <option key={s} value={s}>{statusConfig[s].label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-espresso/20 dark:border-cream/20 text-caramel focus:ring-caramel"
              />
              <span className="text-sm text-espresso dark:text-cream">Active (visible to users)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.showOnHomepage}
                onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })}
                className="rounded border-espresso/20 dark:border-cream/20 text-caramel focus:ring-caramel"
              />
              <span className="text-sm text-espresso dark:text-cream">Show on homepage banner</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-espresso/10 dark:border-cream/10">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => onSave(form)} className="flex-1">
            {post ? 'Save Changes' : 'Create Post'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
