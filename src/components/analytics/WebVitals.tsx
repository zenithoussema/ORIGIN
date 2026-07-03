'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

export function WebVitals() {
  useEffect(() => {
    function report(metric: Metric) {
      const body = JSON.stringify({
        event: 'web-vitals',
        name: metric.name,
        value: metric.id.includes('-final') ? metric.value : metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        rating:
          metric.name === 'CLS'
            ? metric.value <= 0.1
              ? 'good'
              : metric.value <= 0.25
              ? 'needs-improvement'
              : 'poor'
            : metric.value <= 200
            ? 'good'
            : metric.value <= 500
            ? 'needs-improvement'
            : 'poor',
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/web-vitals', body);
      } else {
        fetch('/api/web-vitals', { body, method: 'POST', keepalive: true }).catch(() => {});
      }
    }

    onCLS(report);
    onFCP(report);
    onINP(report);
    onLCP(report);
    onTTFB(report);
  }, []);

  return null;
}
