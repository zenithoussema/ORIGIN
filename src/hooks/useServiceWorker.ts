'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __ORIGIN_SW_READY?: boolean;
    __ORIGIN_UPDATE_AVAILABLE?: boolean;
  }
}

function getBrowserSupport() {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator;
}

function getInstallState() {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInstalledViaPrompt = localStorage.getItem('origin-pwa-installed');
  return isStandalone || !!isInstalledViaPrompt;
}

export function useServiceWorker() {
  const [isSupported] = useState(getBrowserSupport);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled] = useState(getInstallState);
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!isSupported || hasRegistered.current) return;
    hasRegistered.current = true;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        setIsRegistered(true);
        window.__ORIGIN_SW_READY = true;

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              window.__ORIGIN_UPDATE_AVAILABLE = true;
            }
          });
        });
      })
      .catch(() => {
        // SW registration failed
      });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      localStorage.setItem('origin-pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isSupported]);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      setInstallPrompt(null);
      return outcome === 'accepted';
    } catch {
      return false;
    }
  }, [installPrompt]);

  const dismissInstall = useCallback(() => {
    setInstallPrompt(null);
    localStorage.setItem('origin-pwa-install-dismissed', Date.now().toString());
  }, []);

  const applyUpdate = useCallback(() => {
    if (!updateAvailable) return;

    navigator.serviceWorker?.controller?.postMessage({ type: 'SKIP_WAITING' });

    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, [updateAvailable]);

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    installPrompt,
    isInstalled,
    promptInstall,
    dismissInstall,
    applyUpdate,
  };
}
