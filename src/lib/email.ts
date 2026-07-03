type LoggerOpts = { userId?: string; requestId?: string };

type EmailLogger = Record<string, (...args: unknown[]) => void>;

let _loggerModule: EmailLogger | null = null;

async function getLogger() {
  if (_loggerModule) return _loggerModule;
  try {
    const mod = await import('@/lib/logger.server');
    _loggerModule = mod.logger as unknown as EmailLogger;
  } catch {
    _loggerModule = {};
  }
  return _loggerModule;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailProvider {
  private name: string;
  private logger: EmailLogger | null = null;

  constructor(name: string) {
    this.name = name;
  }

  protected async initLogger() {
    if (!this.logger) {
      this.logger = await getLogger();
    }
  }

  getName(): string {
    return this.name;
  }

  protected async log(level: keyof EmailLogger, message: string, meta?: Record<string, unknown>) {
    await this.initLogger();
    this.logger?.[level]?.(message, 'Email', meta);
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const start = Date.now();
    const url = process.env.EMAIL_API_URL || '';
    const apiKey = process.env.EMAIL_API_KEY || '';
    const from = process.env.EMAIL_FROM || 'noreply@origin.sa';

    if (!url || !apiKey) {
      await this.log('warn', 'Email provider not configured (missing EMAIL_API_URL/EMAIL_API_KEY)', {
        to: options.to,
        subject: options.subject,
      });
      return { success: false, error: 'Email provider not configured' };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, ''),
        }),
      });

      const duration = Date.now() - start;
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        await this.log('error', `Email send failed [${response.status}]`, {
          to: options.to,
          subject: options.subject,
          status: response.status,
          duration,
        });
        return { success: false, error: `HTTP ${response.status}: ${data.error || 'Unknown error'}` };
      }

      await this.log('success', 'Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: data.id,
        duration,
      });

      return { success: true, messageId: data.id };
    } catch (error) {
      const duration = Date.now() - start;
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.log('error', 'Email send exception', { to: options.to, subject: options.subject, error: errMsg, duration });
      return { success: false, error: errMsg };
    }
  }
}

const emailProvider = new EmailProvider('Resend');

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return emailProvider.sendEmail(options);
}

export { emailProvider, EmailProvider };
