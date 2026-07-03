import { NextResponse } from 'next/server';
import { getCheckoutUpsells } from '@/lib/recommendations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 10);

    const cartItemIds = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (cartItemIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const items = await getCheckoutUpsells(cartItemIds, limit);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
