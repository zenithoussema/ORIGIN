import prisma from '@/lib/prisma';
import { getPaymentProvider, type PaymentMethod, type PaymentResult } from '@/lib/payment-providers';

interface OrderItemForValidation {
  id: string;
  quantity: number;
  price?: number;
}

interface ServerValidatedAmount {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export async function validateOrderAmount(
  items: OrderItemForValidation[],
  deliveryType: string
): Promise<{ valid: boolean; amount?: ServerValidatedAmount; error?: string }> {
  if (!prisma) {
    return { valid: false, error: 'Service temporarily unavailable' };
  }

  const menuItemIds = items.map((item) => item.id);

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  if (menuItems.length !== menuItemIds.length) {
    const foundIds = new Set(menuItems.map((item) => item.id));
    const missingIds = menuItemIds.filter((id) => !foundIds.has(id));
    return {
      valid: false,
      error: `Items not found: ${missingIds.join(', ')}`,
    };
  }

  for (const menuItem of menuItems) {
    if (!menuItem.isAvailable) {
      return {
        valid: false,
        error: `"${menuItem.name}" is currently unavailable`,
      };
    }
  }

  const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

  let subtotal = 0;
  for (const item of items) {
    const menuItem = menuItemMap.get(item.id);
    if (!menuItem) {
      return { valid: false, error: `Item ${item.id} not found` };
    }
    subtotal += menuItem.price * item.quantity;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const deliveryFee = deliveryType === 'DELIVERY' ? 15 : 0;
  const tax = Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  return {
    valid: true,
    amount: { subtotal, deliveryFee, tax, total },
  };
}

export async function createPayment(
  orderId: string,
  userId: string,
  method: PaymentMethod,
  amount: number,
  stripePaymentIntentId?: string
): Promise<PaymentResult & { paymentId?: string }> {
  if (!prisma) {
    return { success: false, status: 'FAILED', message: 'Service unavailable' };
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findFirst({
      where: { orderId, status: 'PAID' },
    });

    if (existingPayment) {
      return { success: false, status: 'FAILED' as const, message: 'This order has already been paid for.' };
    }

    const order = await tx.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return { success: false, status: 'FAILED' as const, message: 'Order not found' };
    }

    if (order.userId !== userId) {
      return { success: false, status: 'FAILED' as const, message: 'Unauthorized' };
    }

    if (order.paymentStatus === 'PAID') {
      return { success: false, status: 'FAILED' as const, message: 'Order is already paid.' };
    }

    const amountDiff = Math.abs(order.totalPrice - amount);
    if (amountDiff > 0.01) {
      return { success: false, status: 'FAILED' as const, message: 'Amount mismatch. Please refresh and try again.' };
    }

    const provider = getPaymentProvider(method);

    const payment = await tx.payment.create({
      data: {
        orderId,
        userId,
        amount,
        method,
        status: 'PENDING',
        stripePaymentIntentId: stripePaymentIntentId || null,
      },
    });

    const providerResult = await provider.processPayment({
      orderId,
      orderNumber: order.orderNumber,
      userId,
      amount,
      method,
    });

    if (!providerResult.success) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      return { success: false, status: 'FAILED' as const, message: providerResult.message || 'Payment failed' };
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: providerResult.status === 'PAID' ? 'PAID' : 'PENDING',
        transactionId: providerResult.transactionId || null,
      },
    });

    if (providerResult.status === 'PAID') {
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' },
      });
    }

    return {
      success: true,
      paymentId: payment.id,
      transactionId: providerResult.transactionId,
      status: providerResult.status,
      message: providerResult.message,
    };
  });

  return result;
}

export async function confirmPayment(
  paymentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!prisma) {
    return { success: false, error: 'Service unavailable' };
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    if (payment.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (payment.status === 'PAID') {
      return { success: true };
    }

    if (payment.status === 'FAILED' || payment.status === 'REFUNDED') {
      return { success: false, error: `Payment is ${payment.status.toLowerCase()}` };
    }

    const provider = getPaymentProvider(payment.method as PaymentMethod);

    if (payment.transactionId) {
      const verified = await provider.verifyPayment(payment.transactionId);
      if (verified) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: 'PAID' },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'PAID' },
        });

        return { success: true };
      }
    }

    return { success: false, error: 'Payment verification pending' };
  });

  return result;
}

export async function refundPayment(
  paymentId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (!prisma) {
    return { success: false, error: 'Service unavailable' };
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    if (payment.userId !== userId && !isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    if (payment.status !== 'PAID') {
      return { success: false, error: 'Only paid payments can be refunded' };
    }

    const provider = getPaymentProvider(payment.method as PaymentMethod);
    const refundResult = await provider.refundPayment(paymentId, payment.amount);

    if (!refundResult.success) {
      return { success: false, error: refundResult.message || 'Refund failed' };
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'REFUNDED' },
    });

    return { success: true };
  });

  return result;
}

export async function getPaymentByOrderId(orderId: string) {
  if (!prisma) return null;

  const payment = await prisma.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  });

  return payment;
}

export async function getUserWalletBalance(userId: string): Promise<number> {
  if (!prisma) return 0;

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  return wallet?.balance ?? 0;
}

export async function fundWallet(
  userId: string,
  amount: number
): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  if (!prisma) {
    return { success: false, error: 'Service unavailable' };
  }

  if (amount <= 0 || amount > 10000) {
    return { success: false, error: 'Invalid amount. Must be between 1 and 10,000 DT.' };
  }

  const wallet = await prisma.$transaction(async (tx) => {
    return tx.wallet.upsert({
      where: { userId },
      create: {
        userId,
        balance: amount,
        transactions: {
          create: {
            amount,
            type: 'FUND',
            description: `Wallet funded with ${amount} DT`,
          },
        },
      },
      update: {
        balance: { increment: amount },
        transactions: {
          create: {
            amount,
            type: 'FUND',
            description: `Wallet funded with ${amount} DT`,
          },
        },
      },
    });
  });

  return { success: true, newBalance: wallet.balance };
}
