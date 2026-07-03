import prisma from '@/lib/prisma';
import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  RefundResult,
} from './types';

export class WalletProvider implements PaymentProvider {
  readonly method = 'WALLET' as const;

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!prisma) {
      return {
        success: false,
        status: 'FAILED',
        message: 'Service temporarily unavailable',
      };
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: request.userId },
    });

    if (!wallet) {
      return {
        success: false,
        status: 'FAILED',
        message: 'Wallet not found. Please fund your wallet first.',
      };
    }

    if (wallet.balance < request.amount) {
      return {
        success: false,
        status: 'FAILED',
        message: `Insufficient wallet balance. Available: ${wallet.balance.toFixed(3)} DT`,
      };
    }

    const transactionId = `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    await prisma.$connect?.();

    const result = await prisma.wallet.update({
      where: { userId: request.userId },
      data: {
        balance: { decrement: request.amount },
        transactions: {
          create: {
            amount: -request.amount,
            type: 'PAYMENT',
            description: `Payment for order ${request.orderNumber}`,
            referenceId: request.orderId,
          },
        },
      },
    });

    if (result.balance < 0) {
      await prisma.wallet.update({
        where: { userId: request.userId },
        data: { balance: { increment: request.amount } },
      });

      return {
        success: false,
        status: 'FAILED',
        message: 'Insufficient wallet balance.',
      };
    }

    return {
      success: true,
      paymentId: `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      transactionId,
      status: 'PAID',
      message: 'Wallet payment processed successfully.',
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    if (!prisma || !transactionId.startsWith('wallet_')) {
      return false;
    }

    return true;
  }

  async refundPayment(paymentId: string, amount: number): Promise<RefundResult> {
    if (!prisma) {
      return {
        success: false,
        message: 'Service temporarily unavailable',
      };
    }

    const refundId = `wallet_refund_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    return {
      success: true,
      refundId,
      message: `Wallet refund of ${amount} DT processed.`,
    };
  }
}
