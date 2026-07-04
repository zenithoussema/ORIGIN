import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const serverEnvSchema = {
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(16, 'NEXTAUTH_SECRET must be at least 16 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required in production').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required in production').optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'critical', 'security', 'audit']).default('info'),
  RATE_LIMIT_ENABLED: z.enum(['true', 'false']).default('true'),
  PWA_ENABLED: z.enum(['true', 'false']).default('true'),
  ANALYZE: z.enum(['true', 'false']).optional(),
  BACKUP_S3_BUCKET: z.string().optional(),
};

const clientEnvSchema = {
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
};

function createEnvInstance() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`);
      console.error('[ENV] Application cannot start without required variables.');
      process.exit(1);
    }
  }

  return createEnv({
    server: serverEnvSchema,
    client: clientEnvSchema,
    runtimeEnv: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      LOG_LEVEL: process.env.LOG_LEVEL,
      RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED,
      PWA_ENABLED: process.env.PWA_ENABLED,
      ANALYZE: process.env.ANALYZE,
      BACKUP_S3_BUCKET: process.env.BACKUP_S3_BUCKET,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL,
    },
    skipValidation: process.env.NODE_ENV === 'test',
  });
}

let _env: ReturnType<typeof createEnvInstance> | undefined;

export function getEnv() {
  if (!_env) {
    _env = createEnvInstance();
  }
  return _env;
}

function safeGetEnv() {
  try {
    return getEnv();
  } catch {
    return undefined;
  }
}

export const env = new Proxy({} as ReturnType<typeof createEnvInstance>, {
  get(_, prop) {
    const instance = safeGetEnv();
    if (!instance) return undefined;
    return instance[prop as keyof ReturnType<typeof createEnvInstance>];
  },
});

export function validateEnvOnStartup(): { valid: boolean; errors: string[] } {
  try {
    getEnv();
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof Error) {
      const errors = error.message.split('\n').filter(Boolean);
      return { valid: false, errors };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

export function getRequiredEnvVars(): string[] {
  return ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
}

export function getOptionalEnvVars(): string[] {
  return [
    'SENTRY_DSN', 'SENTRY_ORG', 'SENTRY_PROJECT',
    'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
    'ADMIN_EMAIL', 'RESEND_API_KEY', 'EMAIL_FROM',
    'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
    'BACKUP_S3_BUCKET',
  ];
}
