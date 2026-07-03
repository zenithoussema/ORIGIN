export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'COOKING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TrackingOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalPrice: number;
  deliveryType: string;
  paymentMethod: string;
  paymentStatus: string;
  address: string | null;
  notes: string | null;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    name: string;
    nameAr: string;
    nameFr: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
  }>;
}

export interface TrackingStep {
  key: OrderStatus;
  label: string;
  icon: string;
  message: string;
  estimatedMinutes: number | null;
}

export const TRACKING_STEPS: TrackingStep[] = [
  {
    key: 'PENDING',
    label: 'Order Received',
    icon: '📋',
    message: 'Your order has been received and is awaiting confirmation.',
    estimatedMinutes: null,
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    icon: '✅',
    message: 'Restaurant has confirmed your order!',
    estimatedMinutes: null,
  },
  {
    key: 'PREPARING',
    label: 'Preparing',
    icon: '👨‍🍳',
    message: 'Chef is preparing your meal with care.',
    estimatedMinutes: 15,
  },
  {
    key: 'COOKING',
    label: 'Cooking',
    icon: '🔥',
    message: 'Your food is being cooked. Almost there!',
    estimatedMinutes: 10,
  },
  {
    key: 'READY',
    label: 'Ready',
    icon: '🍽️',
    message: 'Your order is ready! Come and enjoy.',
    estimatedMinutes: null,
  },
  {
    key: 'COMPLETED',
    label: 'Completed',
    icon: '🎉',
    message: 'Order completed. Thank you for choosing ORIGIN!',
    estimatedMinutes: null,
  },
];

export const CANCELLED_STEP: TrackingStep = {
  key: 'CANCELLED',
  label: 'Cancelled',
  icon: '❌',
  message: 'This order has been cancelled.',
  estimatedMinutes: null,
};

export const STATUS_ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'COOKING',
  'READY',
  'COMPLETED',
];

export function getStepIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

export function getStepByStatus(status: OrderStatus): TrackingStep {
  if (status === 'CANCELLED') return CANCELLED_STEP;
  return TRACKING_STEPS.find((s) => s.key === status) || TRACKING_STEPS[0];
}

export function getStatusColor(status: OrderStatus): {
  bg: string;
  text: string;
  ring: string;
} {
  switch (status) {
    case 'PENDING':
      return { bg: 'bg-smoke-100 dark:bg-smoke-400/20', text: 'text-smoke-300 dark:text-cream/40', ring: 'ring-smoke-200 dark:ring-smoke-400/30' };
    case 'CONFIRMED':
      return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-200 dark:ring-blue-800' };
    case 'PREPARING':
      return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-200 dark:ring-amber-800' };
    case 'COOKING':
      return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-800' };
    case 'READY':
      return { bg: 'bg-sage-50 dark:bg-sage/10', text: 'text-sage dark:text-sage', ring: 'ring-sage-200 dark:ring-sage/20' };
    case 'COMPLETED':
      return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-200 dark:ring-green-800' };
    case 'CANCELLED':
      return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500 dark:text-red-400', ring: 'ring-red-200 dark:ring-red-800' };
  }
}

export function getEstimatedMinutes(status: OrderStatus): number | null {
  switch (status) {
    case 'PENDING': return 2;
    case 'CONFIRMED': return 15;
    case 'PREPARING': return 10;
    case 'COOKING': return 8;
    case 'READY': return 0;
    case 'COMPLETED': return 0;
    case 'CANCELLED': return null;
  }
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Ready now';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
