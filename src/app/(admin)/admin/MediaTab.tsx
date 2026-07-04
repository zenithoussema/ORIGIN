'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Video,
  FolderOpen,
  Search,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAdminStore } from '@/lib/admin-store';
import { type AdminMediaItem } from '@/data/admin-data';
import { staggerContainer, fadeUp } from '@/lib/animations';

const categoryFilters = ['all', 'menu', 'promotion', 'homepage'] as const;

export function MediaTab() {
  const { media, addMedia, deleteMedia, searchQuery } = useAdminStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredMedia = media.filter((m) => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q);
    }
    return true;
  });

  const totalSize = filteredMedia.reduce((sum, m) => sum + m.size, 0);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      addMedia({
        id: `media_${Date.now()}`,
        name: `upload-${Date.now()}.jpg`,
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
        type: 'image',
        size: Math.floor(Math.random() * 500000) + 100000,
        category: 'menu',
        createdAt: new Date().toISOString(),
      });
      setIsUploading(false);
    }, 1500);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-4">
          <p className="text-sm text-smoke-300 dark:text-cream/50">Total Files</p>
          <p className="text-2xl font-heading font-bold text-espresso dark:text-cream">{filteredMedia.length}</p>
        </div>
        <div className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-4">
          <p className="text-sm text-smoke-300 dark:text-cream/50">Total Size</p>
          <p className="text-2xl font-heading font-bold text-espresso dark:text-cream">{formatSize(totalSize)}</p>
        </div>
        <div className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 p-4">
          <p className="text-sm text-smoke-300 dark:text-cream/50">Images / Videos</p>
          <p className="text-2xl font-heading font-bold text-espresso dark:text-cream">
            {media.filter((m) => m.type === 'image').length} / {media.filter((m) => m.type === 'video').length}
          </p>
        </div>
      </div>

      {/* Upload + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                selectedCategory === cat
                  ? 'bg-caramel text-espresso shadow-sm'
                  : 'bg-white dark:bg-espresso-500 border border-espresso/10 dark:border-cream/10 text-smoke-300 dark:text-cream/50 hover:border-caramel hover:text-caramel'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm" leftIcon={<Upload size={14} />} onClick={handleUpload} isLoading={isUploading}>
          Upload File
        </Button>
      </div>

      {/* Media Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredMedia.map((item) => (
          <motion.div
            key={item.id}
            variants={fadeUp}
            className="bg-white dark:bg-espresso-500 rounded-xl border border-espresso/10 dark:border-cream/10 overflow-hidden group"
          >
            <div className="aspect-square bg-gradient-to-br from-caramel/10 to-espresso/5 relative flex items-center justify-center">
              {item.type === 'video' ? (
                <Video size={32} className="text-caramel/40" />
              ) : (
                <ImageIcon size={32} className="text-caramel/40" />
              )}
              <button
                onClick={() => setDeleteConfirm(item.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/20 backdrop-blur-sm flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
              <span className="absolute bottom-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/90 dark:bg-espresso/90 text-espresso dark:text-cream capitalize">
                {item.category}
              </span>
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-espresso dark:text-cream truncate">{item.name}</p>
              <p className="text-[10px] text-smoke-300 dark:text-cream/40">{formatSize(item.size)}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen size={40} className="mx-auto mb-3 text-smoke-200 dark:text-cream/20" />
          <p className="text-sm text-smoke-300 dark:text-cream/40">No media files found</p>
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
              <h3 className="font-heading font-semibold text-espresso dark:text-cream mb-2">Delete File?</h3>
              <p className="text-sm text-smoke-300 dark:text-cream/50 mb-4">This file will be permanently removed.</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    deleteMedia(deleteConfirm);
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
    </div>
  );
}
