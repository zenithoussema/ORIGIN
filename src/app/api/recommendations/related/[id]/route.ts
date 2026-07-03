import { NextResponse } from 'next/server';
import { getMenuItemById, findSimilarItems } from '@/lib/recommendations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 10);

    const sourceItem = getMenuItemById(id);
    if (!sourceItem) {
      return NextResponse.json({ items: [] });
    }

    const items = findSimilarItems(sourceItem, [id], limit);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
