import { NextResponse } from 'next/server';
import { constructWebhookEvent, formatAmountFromStripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { enqueueRecoveryJob } from '@/lib/order-recovery';
import { logger } from '@/lib/logger.server';
import Stripe from 'stripe';

const WEBHOOK_MAX_AGE_SECONDS = 300; // 5 minutes

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const { orderId, orderNumber, userId } = session.metadata || {};

  if (!orderId) {
    logger.error('Checkout session missing orderId metadata', 'Webhook', {
      sessionId: session.id,
    });
    return;
  }

  if (!prisma) {
    logger.error('Database unavailable during checkout session webhook', 'Webhook', { orderId });
    enqueueRecoveryJob('order_payment_sync', {
      orderId,
      paymentStatus: 'PAID',
    });
    return;
  }

  try {
    await prisma.$executeRawUnsafe('SELECT 1');

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      logger.error('Order not found for checkout session', 'Webhook', { orderId, sessionId: session.id });
      return;
    }

    if (order.paymentStatus === 'PAID') {
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID' },
    });

    const payment = await prisma.payment.findFirst({
      where: { orderId, status: { not: 'PAID' } },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          transactionId: session.payment_intent as string || session.id,
        },
      });
    } else {
      const amountTotal = session.amount_total ? session.amount_total / 100 : order.totalPrice;
      await prisma.payment.create({
        data: {
          orderId,
          userId: userId || order.userId,
          amount: amountTotal,
          method: 'CARD',
          status: 'PAID',
          transactionId: session.payment_intent as string || session.id,
          metadata: {
            stripeSessionId: session.id,
          },
        },
      });
    }

    logger.info('Checkout session completed', 'Webhook', {
      orderId,
      orderNumber,
      sessionId: session.id,
    });
  } catch (error) {
    logger.error('Failed to process checkout.session.completed', 'Webhook', error, { orderId });
    enqueueRecoveryJob('order_payment_sync', {
      orderId,
      paymentStatus: 'PAID',
    });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const { orderId, orderNumber, userId } = paymentIntent.metadata;

  if (!orderId) {
    logger.error('Payment intent missing orderId metadata', 'Webhook', {
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  if (!prisma) {
    logger.error('Database unavailable during webhook processing', 'Webhook', { orderId });
    enqueueRecoveryJob('order_payment_sync', {
      orderId,
      paymentStatus: 'PAID',
    });
    return;
  }

  try {
    await prisma.$executeRawUnsafe('SELECT 1');

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      logger.error('Order not found for payment intent', 'Webhook', { orderId, paymentIntentId: paymentIntent.id });
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID' },
    });

    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        transactionId: paymentIntent.id,
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          transactionId: paymentIntent.id,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId,
          userId: userId || order.userId,
          amount: formatAmountFromStripe(paymentIntent.amount),
          method: 'CARD',
          status: 'PAID',
          transactionId: paymentIntent.id,
          metadata: {
            stripePaymentIntentId: paymentIntent.id,
          },
        },
      });
    }

    logger.info('Payment succeeded via webhook', 'Webhook', {
      orderId,
      orderNumber,
      paymentIntentId: paymentIntent.id,
      amount: formatAmountFromStripe(paymentIntent.amount),
    });
  } catch (error) {
    logger.error('Failed to process payment_intent.succeeded', 'Webhook', error, { orderId });
    enqueueRecoveryJob('order_payment_sync', {
      orderId,
      paymentStatus: 'PAID',
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const { orderId } = paymentIntent.metadata;

  if (!orderId) {
    logger.error('Payment intent missing orderId metadata', 'Webhook', {
      paymentIntentId: paymentIntent.id,
    });
    return;
  }

  if (!prisma) {
    enqueueRecoveryJob('order_payment_sync', {
      orderId,
      paymentStatus: 'UNPAID',
    });
    return;
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        transactionId: paymentIntent.id,
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }

    const lastError = paymentIntent.last_payment_error;
    logger.warn('Payment failed via webhook', 'Webhook', {
      orderId,
      paymentIntentId: paymentIntent.id,
      errorCode: lastError?.code,
      errorMessage: lastError?.message,
    });
  } catch (error) {
    logger.error('Failed to process payment_intent.payment_failed', 'Webhook', error, { orderId });
    enqueueRecoveryJob('payment_update', {
      paymentId: orderId,
      status: 'FAILED',
    });
  }
}

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  if (!prisma) {
    return;
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { transactionId: paymentIntentId },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'REFUNDED' },
      });

      logger.info('Refund processed via webhook', 'Webhook', {
        paymentId: payment.id,
        orderId: payment.orderId,
        refundAmount: formatAmountFromStripe(charge.amount_refunded),
      });
    }
  } catch (error) {
    logger.error('Failed to process charge.refunded', 'Webhook', error, {
      paymentIntentId,
    });
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    logger.security('Webhook missing stripe-signature', 'Webhook');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const event = await constructWebhookEvent(body, signature);

  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventAge = Math.floor((Date.now() / 1000) - event.created);
  if (eventAge > WEBHOOK_MAX_AGE_SECONDS) {
    logger.warn('Webhook event too old', 'Webhook', {
      type: event.type,
      age: eventAge,
    });
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        logger.debug(`Unhandled webhook event: ${event.type}`, 'Webhook');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error', 'Webhook', error, { type: event.type });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
