import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/server-auth';
import { createRefund } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger.server';
import { z } from 'zod';

const refundSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.number().positive().optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).default('requested_by_customer'),
});

export async function POST(request: Request) {
  const auth = await assertAdminApi(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const result = refundSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { paymentId, amount, reason } = result.data;

    if (!prisma) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Only paid payments can be refunded' },
        { status: 400 }
      );
    }

    if (!payment.transactionId) {
      return NextResponse.json(
        { error: 'No Stripe transaction found for this payment' },
        { status: 400 }
      );
    }

    if (amount && amount > payment.amount) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed payment amount' },
        { status: 400 }
      );
    }

    const refundAmount = amount || payment.amount;

    const stripeReasonMap: Record<string, 'duplicate' | 'fraudulent' | 'requested_by_customer'> = {
      duplicate: 'duplicate',
      fraudulent: 'fraudulent',
      requested_by_customer: 'requested_by_customer',
    };

    const refundResult = await createRefund({
      paymentIntentId: payment.transactionId,
      amount: refundAmount,
      reason: stripeReasonMap[reason] || 'requested_by_customer',
      metadata: {
        orderId: payment.orderId,
        paymentId: payment.id,
        adminUserId: auth.session.user.id,
        reason,
      },
    });

    if (!refundResult.success) {
      return NextResponse.json(
        { error: refundResult.error },
        { status: 400 }
      );
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'REFUNDED' },
    });

    logger.info('Refund processed', 'Payments', {
      adminUserId: auth.session.user.id,
      paymentId,
      orderId: payment.orderId,
      amount: refundAmount,
      refundId: refundResult.refundId,
    });

    return NextResponse.json({
      success: true,
      refundId: refundResult.refundId,
      amount: refundAmount,
    });
  } catch (error) {
    logger.error('Refund error', 'Payments', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
