import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  RefundResult,
} from './types';

export class CardProvider implements PaymentProvider {
  readonly method = 'CARD' as const;

  async processPayment(_request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      status: 'PENDING',
      message: 'Card payment initiated. Awaiting Stripe confirmation.',
    };
  }

  async verifyPayment(_transactionId: string): Promise<boolean> {
    return true;
  }

  async refundPayment(_paymentId: string, _amount: number): Promise<RefundResult> {
    return {
      success: true,
      message: 'Card refund initiated via Stripe.',
    };
  }
}
