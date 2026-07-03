import { NextResponse } from 'next/server';
import { assertApiAuth } from '@/lib/server-auth';
import { createPaymentIntent } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger.server';
import { z } from 'zod';
import { STRIPE_CURRENCY } from '@/lib/currency';

const createIntentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

export async function POST(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const result = createIntentSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { orderId } = result.data;

    if (!prisma) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== auth.session.user.id) {
      logger.security('Payment intent on unauthorized order', 'Payments', {
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

    if (order.paymentMethod !== 'CARD') {
      return NextResponse.json(
        { error: 'Payment intent is only available for card payments' },
        { status: 400 }
      );
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId,
        status: 'PAID',
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Order already has a successful payment' },
        { status: 400 }
      );
    }

    const idempotencyKey = `order_${orderId}_${Date.now()}`;

    const paymentResult = await createPaymentIntent({
      amount: order.totalPrice,
      currency: STRIPE_CURRENCY,
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: auth.session.user.id,
      email: auth.session.user.email || '',
      metadata: {
        idempotencyKey,
        customerName: order.customerName,
      },
    });

    if (paymentResult.error || !paymentResult.clientSecret || !paymentResult.paymentIntentId) {
      return NextResponse.json(
        { error: paymentResult.error || 'Failed to create payment intent' },
        { status: 400 }
      );
    }

    await prisma.payment.create({
      data: {
        orderId,
        userId: auth.session.user.id,
        amount: order.totalPrice,
        method: 'CARD',
        status: 'PENDING',
        transactionId: paymentResult.paymentIntentId,
        metadata: {
          idempotencyKey,
          clientSecret: paymentResult.clientSecret,
        },
      },
    });

    logger.info('Payment intent created', 'Payments', {
      orderId,
      paymentIntentId: paymentResult.paymentIntentId,
      amount: order.totalPrice,
    });

    return NextResponse.json({
      clientSecret: paymentResult.clientSecret,
      paymentIntentId: paymentResult.paymentIntentId,
      amount: order.totalPrice,
    });
  } catch (error) {
    logger.error('Payment intent creation error', 'Payments', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
