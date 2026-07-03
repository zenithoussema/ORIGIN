import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redisHealthCheck } from '@/lib/redis';
import { getQueryStats } from '@/lib/db-logger';
import { trackDbFailure, getAlertingStatus } from '@/lib/alerting';

interface HealthCheck {
  status: string;
  latency?: number;
  error?: string;
}

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, HealthCheck> = {};

  // Database check
  try {
    const dbStart = Date.now();
    if (prisma) {
      await prisma.$executeRawUnsafe('SELECT 1');
      checks.database = { status: 'healthy', latency: Date.now() - dbStart };
    } else {
      checks.database = { status: 'unavailable', error: 'Prisma client not initialized' };
      trackDbFailure();
    }
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    trackDbFailure();
  }

  // Redis check
  const redisResult = await redisHealthCheck();
  checks.redis = redisResult;

  // Memory check
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const rssMB = Math.round(memUsage.rss / 1024 / 1024);
  const externalMB = Math.round(memUsage.external / 1024 / 1024);

  checks.memory = {
    status: heapUsedMB > 512 ? 'warning' : 'healthy',
    latency: heapUsedMB,
  };

  // DB Query stats
  const queryStats = getQueryStats();

  const totalLatency = Date.now() - startTime;
  const isHealthy = checks.database?.status === 'healthy';
  const isDegraded = checks.memory?.status === 'warning' || checks.redis?.status === 'unhealthy';

  const status = isHealthy ? (isDegraded ? 'degraded' : 'healthy') : 'unhealthy';

  const alerting = getAlertingStatus();

  return NextResponse.json(
    {
      status,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(process.uptime()),
        formatted: formatUptime(Math.floor(process.uptime())),
      },
      latency: totalLatency,
      memory: {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        rss: `${rssMB}MB`,
        external: `${externalMB}MB`,
        usage: `${Math.round((heapUsedMB / heapTotalMB) * 100)}%`,
      },
      database: {
        queries: {
          total: queryStats.totalQueries,
          slow: queryStats.slowQueries,
          averageMs: queryStats.averageDuration,
        },
      },
      checks,
      alerting: {
        activeErrorRateWindows: Object.keys(alerting.errorRateWindows).length,
        recentDbFailures: alerting.dbFailures,
        activeWebhookFailures: Object.keys(alerting.webhookFailures).length,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}
