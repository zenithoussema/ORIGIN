import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  RefundResult,
} from './types';

export class CashProvider implements PaymentProvider {
  readonly method = 'CASH' as const;

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      paymentId: `cash_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: 'PENDING',
      message: 'Cash payment recorded. Payment to be collected on delivery.',
    };
  }

  async verifyPayment(_transactionId: string): Promise<boolean> {
    return true;
  }

  async refundPayment(_paymentId: string, _amount: number): Promise<RefundResult> {
    return {
      success: true,
      refundId: `cash_refund_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      message: 'Cash refund processed. Refund to be given physically.',
    };
  }
}
