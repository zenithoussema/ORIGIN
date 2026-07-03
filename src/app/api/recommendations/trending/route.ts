import { NextResponse } from 'next/server';
import { getTrendingRecommendations, getPopularRecommendations } from '@/lib/recommendations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);
    const type = searchParams.get('type') || 'trending';

    const items =
      type === 'popular'
        ? await getPopularRecommendations(limit)
        : await getTrendingRecommendations(limit);

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
