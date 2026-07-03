import { cacheGet, cacheSet, cacheDelete, CachePrefix } from '@/lib/cache';
import { logger } from '@/lib/logger.server';

const FLAGS_CACHE_KEY = 'feature_flags';
const FLAGS_CACHE_TTL = 300; // 5 minutes

export interface FeatureFlags {
  enableOnlineOrdering: boolean;
  enableReservations: boolean;
  maintenanceMode: boolean;
  enableNotifications: boolean;
  enableWalletTopup: boolean;
  enablePromotions: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  enableOnlineOrdering: true,
  enableReservations: true,
  maintenanceMode: false,
  enableNotifications: true,
  enableWalletTopup: true,
  enablePromotions: true,
};

let runtimeFlags: FeatureFlags = { ...DEFAULT_FLAGS };

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const cached = await cacheGet<FeatureFlags>(CachePrefix.SESSION, FLAGS_CACHE_KEY);
  if (cached) {
    runtimeFlags = { ...DEFAULT_FLAGS, ...cached };
    return runtimeFlags;
  }

  return runtimeFlags;
}

export async function setFeatureFlags(flags: Partial<FeatureFlags>): Promise<void> {
  runtimeFlags = { ...runtimeFlags, ...flags };
  await cacheSet(CachePrefix.SESSION, FLAGS_CACHE_KEY, runtimeFlags, FLAGS_CACHE_TTL);

  logger.info('Feature flags updated', 'FeatureFlags', { flags });
}

export async function getFlag<K extends keyof FeatureFlags>(flag: K): Promise<FeatureFlags[K]> {
  const flags = await getFeatureFlags();
  return flags[flag];
}

export async function isMaintenanceMode(): Promise<boolean> {
  return getFlag('maintenanceMode');
}

export async function isOnlineOrderingEnabled(): Promise<boolean> {
  const maintenance = await isMaintenanceMode();
  if (maintenance) return false;
  return getFlag('enableOnlineOrdering');
}

export async function isReservationsEnabled(): Promise<boolean> {
  const maintenance = await isMaintenanceMode();
  if (maintenance) return false;
  return getFlag('enableReservations');
}

export async function isNotificationsEnabled(): Promise<boolean> {
  return getFlag('enableNotifications');
}

export async function isWalletTopupEnabled(): Promise<boolean> {
  const maintenance = await isMaintenanceMode();
  if (maintenance) return false;
  return getFlag('enableWalletTopup');
}

export async function isPromotionsEnabled(): Promise<boolean> {
  return getFlag('enablePromotions');
}

export function getMaintenancePageHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance - ORIGIN</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1C0A00;
      color: #F5ECD7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container { text-align: center; padding: 2rem; max-width: 500px; }
    .icon { font-size: 4rem; margin-bottom: 1.5rem; }
    h1 { font-family: Georgia, serif; font-size: 2rem; color: #C8882A; margin-bottom: 1rem; }
    p { color: #F5ECD7AA; line-height: 1.6; margin-bottom: 1.5rem; }
    .status { display: inline-block; padding: 0.5rem 1rem; border-radius: 9999px; background: #C8882A20; color: #C8882A; font-size: 0.875rem; }
    .status::before { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #C8882A; margin-right: 0.5rem; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔧</div>
    <h1>We'll be right back</h1>
    <p>ORIGIN is currently undergoing scheduled maintenance. We're working hard to improve your experience.</p>
    <div class="status">Maintenance in progress</div>
  </div>
</body>
</html>`;
}
