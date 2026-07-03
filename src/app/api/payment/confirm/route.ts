import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server-auth';
import { confirmPayment } from '@/lib/payment-service';
import { rateLimitRequest } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimit = await rateLimitRequest(req, 'payment-confirm', 5, 300_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId || typeof paymentId !== 'string') {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const result = await confirmPayment(paymentId, session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Confirmation failed' },
      { status: 500 }
    );
  }
}
