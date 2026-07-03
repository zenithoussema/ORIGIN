import { NextResponse } from 'next/server';
import { assertApiAuth } from '@/lib/server-auth';
import { createPayment } from '@/lib/payment-service';
import { logger } from '@/lib/logger.server';
import { z } from 'zod';

const paymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['CASH', 'CARD', 'WALLET']),
});

export async function POST(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message, field: firstError.path[0] },
        { status: 400 }
      );
    }

    const { orderId, amount, method } = result.data;

    const prisma = (await import('@/lib/prisma')).default;
    if (!prisma) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== auth.session.user.id) {
      logger.security('Payment attempt on unauthorized order', 'Payment', {
        userId: auth.session.user.id,
        orderId,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Order is already paid' },
        { status: 400 }
      );
    }

    const amountDiff = Math.abs(order.totalPrice - amount);
    if (amountDiff > 0.01) {
      logger.security('Payment amount mismatch', 'Payment', {
        userId: auth.session.user.id,
        orderId,
        expected: order.totalPrice,
        received: amount,
      });
      return NextResponse.json(
        { error: 'Amount mismatch. Please refresh the page.' },
        { status: 400 }
      );
    }

    const paymentResult = await createPayment(orderId, auth.session.user.id, method, amount);

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.message },
        { status: 400 }
      );
    }

    logger.info('Payment processed', 'Payment', {
      userId: auth.session.user.id,
      orderId,
      method,
      amount,
    });

    return NextResponse.json(
      {
        success: true,
        paymentId: paymentResult.paymentId,
        transactionId: paymentResult.transactionId,
        status: paymentResult.status,
        message: paymentResult.message,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Payment error', 'Payment', error);
    return NextResponse.json(
      { error: 'Payment processing failed. Please try again.' },
      { status: 500 }
    );
  }
}
