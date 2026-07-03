export type PaymentMethod = 'CASH' | 'CARD' | 'WALLET';

export type PaymentRecordStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  status: PaymentRecordStatus;
  message?: string;
  redirectUrl?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message?: string;
}

export interface PaymentProvider {
  readonly method: PaymentMethod;
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<boolean>;
  refundPayment(paymentId: string, amount: number): Promise<RefundResult>;
}
