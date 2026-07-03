import Stripe from 'stripe';
import { logger } from '@/lib/logger.server';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not set. Stripe payments will not work.');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil' as Stripe.LatestApiVersion,
      typescript: true,
      appInfo: {
        name: 'ORIGIN Restaurant',
        version: '1.0.0',
        url: 'https://origin.tn',
      },
    });
  }
  return _stripe;
}

export function getStripeClient(): Stripe | null {
  try {
    return getStripe();
  } catch {
    return null;
  }
}

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}

export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  email: string;
  metadata?: Record<string, string>;
}): Promise<{ clientSecret: string | null; paymentIntentId: string | null; error?: string }> {
  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: formatAmountForStripe(params.amount),
      currency: params.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        userId: params.userId,
        ...params.metadata,
      },
      receipt_email: params.email,
      description: `ORIGIN Order #${params.orderNumber}`,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeCardError) {
      const cardErrors: Record<string, string> = {
        card_declined: 'Your card was declined.',
        insufficient_funds: 'Insufficient funds. Please try a different card.',
        expired_card: 'Your card has expired. Please use a different card.',
        incorrect_cvc: 'Incorrect CVC. Please check and try again.',
        processing_error: 'A processing error occurred. Please try again.',
        incorrect_number: 'Incorrect card number. Please check and try again.',
      };

      const message = cardErrors[error.code || ''] || 'Payment failed. Please try again.';
      logger.error('Stripe card error', 'Stripe', error, { code: error.code });
      return { clientSecret: null, paymentIntentId: null, error: message };
    }

    logger.error('Stripe payment intent creation failed', 'Stripe', error);
    return { clientSecret: null, paymentIntentId: null, error: 'Payment processing failed. Please try again.' };
  }
}

export async function createCheckoutSession(params: {
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  email: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string | null; sessionUrl: string | null; error?: string }> {
  try {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map((item) => ({
      price_data: {
        currency: params.currency.toLowerCase(),
        product_data: {
          name: item.name,
        },
        unit_amount: formatAmountForStripe(item.price),
      },
      quantity: item.quantity,
    }));

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: params.email,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        userId: params.userId,
        customerName: params.customerName,
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url,
    };
  } catch (error: unknown) {
    logger.error('Stripe checkout session creation failed', 'Stripe', error);
    return { sessionId: null, sessionUrl: null, error: 'Failed to create checkout session. Please try again.' };
  }
}

export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  try {
    return await getStripe().paymentIntents.retrieve(paymentIntentId);
  } catch (error: unknown) {
    logger.error('Failed to retrieve payment intent', 'Stripe', error, { paymentIntentId });
    return null;
  }
}

export async function createRefund(params: {
  paymentIntentId: string;
  amount?: number;
  reason?: Stripe.RefundCreateParams.Reason;
  metadata?: Record<string, string>;
}): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    const refund = await getStripe().refunds.create({
      payment_intent: params.paymentIntentId,
      amount: params.amount ? formatAmountForStripe(params.amount) : undefined,
      reason: params.reason || 'requested_by_customer',
      metadata: params.metadata,
    });

    return { success: true, refundId: refund.id };
  } catch (error: unknown) {
    logger.error('Stripe refund failed', 'Stripe', error, { paymentIntentId: params.paymentIntentId });
    return { success: false, error: 'Refund processing failed. Please try again.' };
  }
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event | null> {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('STRIPE_WEBHOOK_SECRET not set', 'Stripe');
      return null;
    }

    return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: unknown) {
    logger.error('Webhook signature verification failed', 'Stripe', error);
    return null;
  }
}
