import { logger } from '@/lib/logger.server';
import { sendEmail } from '@/lib/email';

interface ErrorRateWindow {
  count: number;
  total: number;
  windowStart: number;
}

interface AlertConfig {
  errorRateThreshold: number;
  errorRateWindowMs: number;
  dbFailuresBeforeAlert: number;
  webhookFailuresBeforeAlert: number;
}

const DEFAULT_CONFIG: AlertConfig = {
  errorRateThreshold: 0.05,
  errorRateWindowMs: 5 * 60 * 1000,
  dbFailuresBeforeAlert: 1,
  webhookFailuresBeforeAlert: 3,
};

const errorRateWindows = new Map<string, ErrorRateWindow>();
const dbFailureCount = { count: 0, lastReset: Date.now() };
const webhookFailureCount = new Map<string, number>();

function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || 'admin@origin.sa';
}

async function sendAdminAlert(params: {
  subject: string;
  category: string;
  severity: 'warning' | 'critical';
  details: Record<string, unknown>;
}): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    logger.warn(`[Alert] ${params.category}: ${params.subject}`, 'Alerting', params.details);
    return;
  }

  try {
    const detailsHtml = Object.entries(params.details)
      .map(([key, value]) => `<tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:600;">${key}</td><td style="padding:6px 12px;border:1px solid #ddd;"><pre style="white-space:pre-wrap;margin:0;">${JSON.stringify(value, null, 2)}</pre></td></tr>`)
      .join('');

    await sendEmail({
      to: getAdminEmail(),
      subject: `[${params.severity.toUpperCase()}] ORIGIN ${params.category} - ${params.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:20px;background:#f5f0e8;">
          <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
            <div style="background:${params.severity === 'critical' ? '#dc2626' : '#f59e0b'};padding:20px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:18px;">ORIGIN ${params.category} Alert</h1>
            </div>
            <div style="padding:24px;">
              <h2 style="color:#1C0A00;margin-top:0;">${params.subject}</h2>
              <p style="color:#6b5b50;line-height:1.6;">
                A ${params.severity} alert was triggered on the ORIGIN platform.
              </p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                ${detailsHtml}
              </table>
              <p style="color:#999;font-size:12px;margin-top:24px;">
                Timestamp: ${new Date().toISOString()}<br>
                Environment: ${process.env.NODE_ENV || 'development'}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    logger.error('Failed to send admin alert email', 'Alerting', error);
  }
}

export function trackErrorRate(category: string, isError: boolean): void {
  const now = Date.now();
  const window = errorRateWindows.get(category);

  if (!window || now - window.windowStart > DEFAULT_CONFIG.errorRateWindowMs) {
    errorRateWindows.set(category, {
      count: isError ? 1 : 0,
      total: 1,
      windowStart: now,
    });
    return;
  }

  window.total++;
  if (isError) window.count++;

  const errorRate = window.count / window.total;
  if (errorRate > DEFAULT_CONFIG.errorRateThreshold && window.total >= 10) {
    sendAdminAlert({
      subject: `Error rate ${Math.round(errorRate * 100)}% exceeds threshold`,
      category,
      severity: errorRate > 0.2 ? 'critical' : 'warning',
      details: {
        errorRate: `${Math.round(errorRate * 100)}%`,
        threshold: `${Math.round(DEFAULT_CONFIG.errorRateThreshold * 100)}%`,
        totalRequests: window.total,
        errorCount: window.count,
        windowMinutes: DEFAULT_CONFIG.errorRateWindowMs / 60000,
      },
    });

    errorRateWindows.set(category, {
      count: 0,
      total: 0,
      windowStart: now,
    });
  }
}

export function trackDbFailure(): void {
  const now = Date.now();
  if (now - dbFailureCount.lastReset > 60000) {
    dbFailureCount.count = 0;
    dbFailureCount.lastReset = now;
  }

  dbFailureCount.count++;

  if (dbFailureCount.count >= DEFAULT_CONFIG.dbFailuresBeforeAlert) {
    sendAdminAlert({
      subject: 'Database connection failure detected',
      category: 'Database',
      severity: 'critical',
      details: {
        failureCount: dbFailureCount.count,
        lastFailure: new Date().toISOString(),
      },
    });
    dbFailureCount.count = 0;
  }
}

export function trackWebhookFailure(webhookType: string): void {
  const current = webhookFailureCount.get(webhookType) || 0;
  const newCount = current + 1;
  webhookFailureCount.set(webhookType, newCount);

  if (newCount >= DEFAULT_CONFIG.webhookFailuresBeforeAlert) {
    sendAdminAlert({
      subject: `Webhook "${webhookType}" failed ${newCount} times`,
      category: 'Webhook',
      severity: 'critical',
      details: {
        webhookType,
        failureCount: newCount,
        threshold: DEFAULT_CONFIG.webhookFailuresBeforeAlert,
      },
    });
    webhookFailureCount.set(webhookType, 0);
  }
}

export function trackNewUserRegistration(params: {
  email: string;
  name: string;
  method: string;
}): void {
  if (process.env.ENABLE_REGISTRATION_ALERTS !== 'true') return;

  sendAdminAlert({
    subject: 'New user registered',
    category: 'Registration',
    severity: 'warning',
    details: {
      email: params.email,
      name: params.name,
      method: params.method,
    },
  });
}

export function getAlertingStatus(): {
  errorRateWindows: Record<string, { count: number; total: number; rate: number }>;
  dbFailures: number;
  webhookFailures: Record<string, number>;
} {
  const windows: Record<string, { count: number; total: number; rate: number }> = {};
  errorRateWindows.forEach((value, key) => {
    windows[key] = {
      count: value.count,
      total: value.total,
      rate: value.total > 0 ? value.count / value.total : 0,
    };
  });

  const webhooks: Record<string, number> = {};
  webhookFailureCount.forEach((value, key) => {
    webhooks[key] = value;
  });

  return {
    errorRateWindows: windows,
    dbFailures: dbFailureCount.count,
    webhookFailures: webhooks,
  };
}
