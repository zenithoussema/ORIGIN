import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server-auth';
import {
  getPersonalizedRecommendations,
  getChefPicks,
  getNewArrivals,
  getRecentlyViewed,
  getRecommendationConfig,
} from '@/lib/recommendations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);
    const section = searchParams.get('section');

    const config = await getRecommendationConfig();
    if (!config.enabled) {
      return NextResponse.json({ items: [], sections: {} });
    }

    const session = await getSession();
    const userId = session?.user?.id;

    if (section) {
      switch (section) {
        case 'personalized': {
          const items = await getPersonalizedRecommendations(userId, limit);
          return NextResponse.json({ items });
        }
        case 'chefs_picks': {
          const items = await getChefPicks(limit);
          return NextResponse.json({ items });
        }
        case 'new_arrivals': {
          const items = await getNewArrivals(limit);
          return NextResponse.json({ items });
        }
        case 'recently_viewed': {
          const items = await getRecentlyViewed(userId, undefined, limit);
          return NextResponse.json({ items });
        }
        default:
          return NextResponse.json({ error: 'Unknown section' }, { status: 400 });
      }
    }

    const [personalized, chefsPicks, newArrivals, recentlyViewed] = await Promise.all([
      getPersonalizedRecommendations(userId, limit),
      getChefPicks(Math.min(limit, 6)),
      getNewArrivals(Math.min(limit, 6)),
      getRecentlyViewed(userId, undefined, 6),
    ]);

    return NextResponse.json({
      items: personalized,
      sections: {
        personalized,
        chefsPicks,
        newArrivals,
        recentlyViewed,
      },
    });
  } catch {
    return NextResponse.json({ items: [], sections: {} });
  }
}
