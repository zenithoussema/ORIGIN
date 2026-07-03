'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export function InstallBanner() {
  const { installPrompt, isInstalled, promptInstall, dismissInstall } = useServiceWorker();
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isInstalled || !installPrompt) return;

    // Check if user dismissed recently
    const dismissed = localStorage.getItem('origin-pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Show after 30 seconds on first visit
    const timer = setTimeout(() => setShowBanner(true), 30000);
    return () => clearTimeout(timer);
  }, [installPrompt, isInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const accepted = await promptInstall();
    setIsInstalling(false);

    if (accepted) {
      setShowBanner(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    dismissInstall();
  };

  if (isInstalled) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && installPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 z-[200] sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm"
          >
            <div className="rounded-2xl border border-caramel/20 bg-white p-4 shadow-2xl dark:bg-espresso sm:p-5">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-espresso/30 hover:text-espresso dark:text-cream/30 dark:hover:text-cream"
                aria-label="Dismiss install prompt"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-caramel/10">
                  <Smartphone className="h-6 w-6 text-caramel" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-espresso dark:text-cream">
                    Install ORIGIN
                  </h3>
                  <p className="mt-0.5 text-sm text-espresso/60 dark:text-cream/60">
                    Add to your home screen for quick access and offline browsing.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className="flex items-center gap-2 rounded-xl bg-caramel px-4 py-2 text-sm font-semibold text-espresso transition-colors hover:bg-caramel/90 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {isInstalling ? 'Installing...' : 'Install'}
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="rounded-xl px-4 py-2 text-sm font-medium text-espresso/60 transition-colors hover:text-espresso dark:text-cream/60 dark:hover:text-cream"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-[200] sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm"
          >
            <div className="rounded-2xl border border-green-500/20 bg-white p-4 shadow-2xl dark:bg-espresso">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <span className="text-lg">✅</span>
                </div>
                <div>
                  <p className="font-semibold text-espresso dark:text-cream">
                    Installed Successfully!
                  </p>
                  <p className="text-sm text-espresso/60 dark:text-cream/60">
                    ORIGIN is now on your home screen.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
export default InstallBanner;
