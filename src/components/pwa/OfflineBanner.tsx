'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

export function OfflineBanner() {
  const { isOffline } = useOnlineStatus();
  const { pendingCount } = useOfflineQueue();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[300]"
        >
          <div className="bg-espresso px-4 py-2.5">
            <div className="mx-auto flex max-w-4xl items-center justify-center gap-3">
              <WifiOff className="h-4 w-4 text-caramel" />
              <p className="text-sm font-medium text-cream">
                You&apos;re offline
                {pendingCount > 0 && (
                  <span className="ml-2 rounded-full bg-caramel/20 px-2 py-0.5 text-xs text-caramel">
                    {pendingCount} pending {pendingCount === 1 ? 'action' : 'actions'}
                  </span>
                )}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1 rounded-lg bg-cream/10 px-2 py-1 text-xs text-cream transition-colors hover:bg-cream/20"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default OfflineBanner;
