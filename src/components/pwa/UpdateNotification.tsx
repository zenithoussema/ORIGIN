'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export function UpdateNotification() {
  const { updateAvailable, applyUpdate } = useServiceWorker();
  const [updating, setUpdating] = useState(false);

  const handleUpdate = () => {
    setUpdating(true);
    applyUpdate();
  };

  if (!updateAvailable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-[250]"
      >
        <div className="bg-caramel px-4 py-3">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">🆕</span>
              <p className="text-sm font-medium text-espresso">
                A new version of ORIGIN is available.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex items-center gap-1.5 rounded-lg bg-espresso px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-espresso/90 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${updating ? 'animate-spin' : ''}`} />
                {updating ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={handleUpdate}
                className="text-espresso/50 hover:text-espresso"
                aria-label="Dismiss update notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
export default UpdateNotification;
