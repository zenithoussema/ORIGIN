import * as Sentry from '@sentry/nextjs';

export function onRequestError(
  error: Error,
  { routeSource, route }: { routeSource: 'server-component' | 'server-action' | 'middleware' | 'error-boundary' | 'pages-dir'; route?: string }
) {
  Sentry.withScope((scope) => {
    scope.setTag('routeSource', routeSource);
    if (route) scope.setTag('route', route);
    Sentry.captureException(error);
  });
}

export function register() {
}
