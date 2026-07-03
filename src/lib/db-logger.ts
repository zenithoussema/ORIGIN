import { logger } from '@/lib/logger.server';

interface QueryLogEntry {
  query: string;
  duration: number;
  timestamp: string;
  model?: string;
  action?: string;
}

const queryLog: QueryLogEntry[] = [];
const MAX_LOG_SIZE = 100;
const SLOW_QUERY_THRESHOLD_MS = 500;

export function logQueryTime(
  query: string,
  duration: number,
  model?: string,
  action?: string
): void {
  const entry: QueryLogEntry = {
    query: query.slice(0, 200),
    duration,
    timestamp: new Date().toISOString(),
    model,
    action,
  };

  queryLog.push(entry);
  if (queryLog.length > MAX_LOG_SIZE) {
    queryLog.shift();
  }

  if (duration > SLOW_QUERY_THRESHOLD_MS) {
    logger.warn(`Slow query detected [${duration}ms]`, 'DB', {
      query: query.slice(0, 100),
      duration,
      model,
      action,
    });
  }
}

export function getQueryStats(): {
  totalQueries: number;
  slowQueries: number;
  averageDuration: number;
  recentSlowQueries: QueryLogEntry[];
} {
  const slowQueries = queryLog.filter((q) => q.duration > SLOW_QUERY_THRESHOLD_MS);
  const totalDuration = queryLog.reduce((sum, q) => sum + q.duration, 0);

  return {
    totalQueries: queryLog.length,
    slowQueries: slowQueries.length,
    averageDuration: queryLog.length > 0 ? Math.round(totalDuration / queryLog.length) : 0,
    recentSlowQueries: slowQueries.slice(-10),
  };
}

export function clearQueryLog(): void {
  queryLog.length = 0;
}
