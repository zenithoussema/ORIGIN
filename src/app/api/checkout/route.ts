import { NextResponse } from 'next/server';
import { assertApiAuth } from '@/lib/server-auth';
import { checkoutSchema } from '@/lib/validations';
import { createOrder } from '@/lib/order-service';
import { createPayment } from '@/lib/payment-service';
import { createCheckoutSession } from '@/lib/stripe';
import { trackInteraction } from '@/lib/recommendations';
import { logger } from '@/lib/logger.server';
import { STRIPE_CURRENCY } from '@/lib/currency';

export async function POST(request: Request) {
  const auth = await assertApiAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message, field: firstError.path[0] },
        { status: 400 }
      );
    }

    const orderResult = await createOrder(result.data, auth.session.user.id);

    if (!orderResult.success) {
      return NextResponse.json(
        { error: orderResult.error },
        { status: 400 }
      );
    }

    let paymentResult = null;
    let stripeSessionUrl: string | null = null;

    if (result.data.paymentMethod === 'CASH') {
      paymentResult = await createPayment(
        orderResult.orderId!,
        auth.session.user.id,
        'CASH',
        orderResult.totalPrice!
      );
    } else if (result.data.paymentMethod === 'CARD') {
      const checkoutItems = result.data.items.map((item) => ({
        name: `Order Item`,
        quantity: item.quantity,
        price: 0,
      }));

      const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const successUrl = `${origin}/payment/stripe/success?orderId=${orderResult.orderId}&orderNumber=${orderResult.orderNumber}`;
      const cancelUrl = `${origin}/checkout?cancelled=true`;

      const sessionResult = await createCheckoutSession({
        amount: orderResult.totalPrice!,
        currency: STRIPE_CURRENCY,
        orderId: orderResult.orderId!,
        orderNumber: orderResult.orderNumber!,
        userId: auth.session.user.id,
        email: auth.session.user.email || '',
        customerName: result.data.customerName,
        items: checkoutItems.map((item, idx) => ({
          name: `Order #${orderResult.orderNumber} - Item ${idx + 1}`,
          quantity: item.quantity,
          price: orderResult.totalPrice! / result.data.items.reduce((sum, i) => sum + i.quantity, 0),
        })),
        successUrl,
        cancelUrl,
      });

      if (sessionResult.error || !sessionResult.sessionId) {
        return NextResponse.json(
          { error: sessionResult.error || 'Failed to create checkout session' },
          { status: 400 }
        );
      }

      stripeSessionUrl = sessionResult.sessionUrl;

      paymentResult = await createPayment(
        orderResult.orderId!,
        auth.session.user.id,
        'CARD',
        orderResult.totalPrice!
      );
    } else if (result.data.paymentMethod === 'WALLET') {
      paymentResult = await createPayment(
        orderResult.orderId!,
        auth.session.user.id,
        'WALLET',
        orderResult.totalPrice!
      );
    }

    const estimatedTime =
      result.data.deliveryType === 'DINE_IN'
        ? '25-35 min'
        : result.data.deliveryType === 'PICKUP'
        ? '15-25 min'
        : '35-50 min';

    logger.info('Order created', 'Checkout', {
      userId: auth.session.user.id,
      orderNumber: orderResult.orderNumber,
      total: orderResult.totalPrice,
      paymentMethod: result.data.paymentMethod,
    });

    for (const item of result.data.items) {
      trackInteraction({
        userId: auth.session.user.id,
        itemId: item.id,
        action: 'order',
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        orderNumber: orderResult.orderNumber,
        orderId: orderResult.orderId,
        totalPrice: orderResult.totalPrice,
        estimatedTime,
        payment: paymentResult
          ? {
              id: paymentResult.paymentId,
              status: paymentResult.status,
              method: result.data.paymentMethod,
            }
          : null,
        stripe: result.data.paymentMethod === 'CARD' && stripeSessionUrl
          ? { sessionUrl: stripeSessionUrl }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Checkout error', 'Checkout', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
