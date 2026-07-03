import * as Sentry from '@sentry/nextjs';

export const onRouterTransitionStart = typeof Sentry.captureRouterTransitionStart === 'function'
  ? Sentry.captureRouterTransitionStart
  : undefined;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  beforeSend(event) {
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error) {
        const type = error.type || '';
        const value = error.value || '';
        if (type === 'NotFoundError' || value.includes('ResizeObserver')) {
          return null;
        }
      }
    }
    return event;
  },
});
