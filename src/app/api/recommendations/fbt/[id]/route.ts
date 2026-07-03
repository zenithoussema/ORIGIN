import { NextResponse } from 'next/server';
import { getFrequentlyBoughtTogether } from '@/lib/recommendations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 10);

    const items = await getFrequentlyBoughtTogether(id, limit);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
