'use client';

import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger.client';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras({
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });

    logger.error('Error boundary caught error', 'ErrorBoundary', error, {
      componentStack: errorInfo.componentStack || undefined,
    });

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="font-heading text-xl font-bold text-espresso dark:text-cream mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-smoke-300 dark:text-cream/50 mb-6">
              We encountered an unexpected error. Please try again.
            </p>
            {this.props.showDetails && this.state.error && (
              <p className="text-xs text-smoke-300/50 dark:text-cream/30 mb-4 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              className="rounded-xl bg-caramel px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-caramel-400"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
