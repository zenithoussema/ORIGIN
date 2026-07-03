// Offline indicator component
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function OfflineBanner() {
  const { isOffline } = useOnlineStatus();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-espresso text-cream p-3 px-4 shadow-lg transform transition-transform duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📡</span>
          <div>
            <p className="font-semibold">You&apos;re Offline</p>
            <p className="text-sm opacity-90">Browsing cached content</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-caramel hover:bg-caramel-400 text-espresso px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
