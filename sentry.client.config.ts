import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
  beforeSend(event) {
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error) {
        const value = error.value || '';
        if (value.includes('NEXT_NOT_FOUND') || value.includes('NEXT_REDIRECT')) {
          return null;
        }
      }
    }
    return event;
  },
});
