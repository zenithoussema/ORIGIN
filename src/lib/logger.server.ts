import * as Sentry from '@sentry/nextjs';
import { sendCriticalAlert } from '@/lib/critical-alert';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical' | 'security' | 'audit';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  error?: string;
  stack?: string;
  requestId?: string;
}

interface LoggerOptions {
  userId?: string;
  requestId?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
  security: 5,
  audit: 6,
};

const MIN_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL as LogLevel] || LOG_LEVELS.info;
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
const isProduction = process.env.NODE_ENV === 'production';

let logFilePath: string | null = null;

function getLogFilePath(): string | null {
  if (logFilePath) return logFilePath;
  if (isEdgeRuntime) return null;
  try {
    const path = require('path') as typeof import('path');
    const fs = require('fs') as typeof import('fs');
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const date = new Date().toISOString().split('T')[0];
    logFilePath = path.join(logsDir, `origin-${date}.log`);
    return logFilePath;
  } catch {
    return null;
  }
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const context = entry.context ? ` [${entry.context}]` : '';
  const user = entry.userId ? ` [user:${entry.userId}]` : '';
  const request = entry.requestId ? ` [req:${entry.requestId}]` : '';
  const action = entry.action ? ` action=${entry.action}` : '';
  const msg = ` ${entry.message}`;
  const meta = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
  const error = entry.error ? ` error="${entry.error}"` : '';
  const stack = entry.stack ? `\n  Stack: ${entry.stack.split('\n').slice(0, 5).join(' | ')}` : '';
  return `${base}${context}${user}${request}${action}${msg}${meta}${error}${stack}`;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  metadata?: Record<string, unknown>,
  error?: unknown,
  options?: LoggerOptions
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    metadata,
    userId: options?.userId,
    requestId: options?.requestId,
  };
  if (error instanceof Error) {
    entry.error = error.message;
    entry.stack = error.stack;
  } else if (typeof error === 'string') {
    entry.error = error;
  }
  return entry;
}

function writeToFile(entry: LogEntry): void {
  if (!isProduction || isEdgeRuntime) return;
  const filePath = getLogFilePath();
  if (!filePath) return;
  try {
    const fs = require('fs') as typeof import('fs');
    const formatted = formatLog(entry);
    fs.appendFileSync(filePath, formatted + '\n', { encoding: 'utf-8' });
  } catch {
    // Silent fail
  }
}

function sendToSentry(entry: LogEntry): void {
  if (!isProduction) return;
  if (entry.level === 'error' || entry.level === 'critical') {
    Sentry.withScope((scope) => {
      if (entry.context) scope.setTag('context', entry.context);
      if (entry.userId) scope.setUser({ id: entry.userId });
      if (entry.requestId) scope.setTag('requestId', entry.requestId);
      if (entry.action) scope.setTag('action', entry.action);
      if (entry.metadata) scope.setExtras(entry.metadata);
      scope.setLevel(entry.level === 'critical' ? 'fatal' : 'error');
      if (entry.stack) {
        Sentry.captureException(new Error(entry.message), { extra: { originalStack: entry.stack } });
      } else {
        Sentry.captureMessage(entry.message, entry.level === 'critical' ? 'fatal' : 'error');
      }
    });
  }
}

function sendCriticalAlertImpl(entry: LogEntry): void {
  if (!isProduction || isEdgeRuntime) return;
  if (entry.level !== 'critical') return;
  sendCriticalAlert({
    context: entry.context,
    message: entry.message,
    userId: entry.userId,
    requestId: entry.requestId,
    error: entry.error,
    stack: entry.stack,
    metadata: entry.metadata,
  });
}

function writeLog(entry: LogEntry): void {
  if (LOG_LEVELS[entry.level] < MIN_LOG_LEVEL) return;

  writeToFile(entry);

  if (!isProduction) {
    const formatted = formatLog(entry);
    switch (entry.level) {
      case 'error':
      case 'critical':
      case 'security':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  if (isProduction) {
    sendToSentry(entry);
  }

  if (entry.level === 'critical') {
    sendCriticalAlertImpl(entry);
  }
}

export const logger = {
  debug(message: string, context?: string, metadata?: Record<string, unknown>, options?: LoggerOptions) {
    writeLog(createLogEntry('debug', message, context, metadata, undefined, options));
  },

  info(message: string, context?: string, metadata?: Record<string, unknown>, options?: LoggerOptions) {
    writeLog(createLogEntry('info', message, context, metadata, undefined, options));
  },

  warn(message: string, context?: string, metadata?: Record<string, unknown>, options?: LoggerOptions) {
    writeLog(createLogEntry('warn', message, context, metadata, undefined, options));
  },

  error(message: string, context?: string, error?: unknown, metadata?: Record<string, unknown>, options?: LoggerOptions) {
    writeLog(createLogEntry('error', message, context, metadata, error, options));
  },

  critical(message: string, context?: string, error?: unknown, metadata?: Record<string, unknown>, options?: LoggerOptions) {
    writeLog(createLogEntry('critical', message, context, metadata, error, options));
  },

  security(message: string, context?: string, metadata?: Record<string, unknown>, options?: LoggerOptions) {
    writeLog(createLogEntry('security', message, context, metadata, undefined, options));
  },

  audit(message: string, context?: string, metadata?: Record<string, unknown>, options?: LoggerOptions) {
    writeLog(createLogEntry('audit', message, context, metadata, undefined, options));
  },

  performance(message: string, duration: number, context?: string, metadata?: Record<string, unknown>, options?: LoggerOptions) {
    const level: LogLevel = duration > 2000 ? 'warn' : 'info';
    writeLog(createLogEntry(level, `${message} [${duration}ms]`, context, { ...metadata, duration }, undefined, options));
  },

  apiRequest(params: {
    method: string;
    path: string;
    status: number;
    duration: number;
    userId?: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
  }) {
    const level: LogLevel = params.status >= 500 ? 'error' : params.status >= 400 ? 'warn' : params.duration > 2000 ? 'warn' : 'info';
    writeLog(createLogEntry(
      level,
      `${params.method} ${params.path} ${params.status} [${params.duration}ms]`,
      'API',
      {
        method: params.method,
        path: params.path,
        status: params.status,
        duration: params.duration,
        ...params.metadata,
      },
      undefined,
      { userId: params.userId, requestId: params.requestId }
    ));
  },
};
