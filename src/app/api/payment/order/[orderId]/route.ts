import { NextResponse } from 'next/server';
import { getPaymentByOrderId } from '@/lib/payment-service';
import { getSession } from '@/lib/server-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId } = await params;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }

  const payment = await getPaymentByOrderId(orderId);

  if (!payment) {
    return NextResponse.json({ error: 'No payment found' }, { status: 404 });
  }

  if (payment.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    payment: {
      id: payment.id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt.toISOString(),
    },
  });
}
