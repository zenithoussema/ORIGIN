import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server-auth';
import { fundWallet, getUserWalletBalance } from '@/lib/payment-service';
import { rateLimitRequest } from '@/lib/rate-limit';
import { z } from 'zod';

const fundSchema = z.object({
  amount: z.number().min(1, 'Minimum amount is 1 DT').max(10000, 'Maximum amount is 10,000 DT'),
});

export async function GET() {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const balance = await getUserWalletBalance(session.user.id);

  return NextResponse.json({ balance });
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimit = await rateLimitRequest(req, 'wallet-fund', 3, 300_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const result = fundSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const fundResult = await fundWallet(session.user.id, result.data.amount);

    if (!fundResult.success) {
      return NextResponse.json({ error: fundResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      newBalance: fundResult.newBalance,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fund wallet' },
      { status: 500 }
    );
  }
}
