import prisma from '@/lib/prisma';
import { menuItems, type MenuItem, type MenuCategory } from '@/data/menu';
import { productDetails, type ProductDetail } from '@/data/menu-items';

export type InteractionAction =
  | 'view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'order'
  | 'favorite'
  | 'search'
  | 'click';

export interface RecommendationItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reason: string;
  score: number;
}

interface UserPreferences {
  categories: Record<string, number>;
  tags: Record<string, number>;
  avgPrice: number;
  priceRange: { min: number; max: number };
  totalInteractions: number;
}

const recommendationCache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = recommendationCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    recommendationCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttl: number = CACHE_TTL): void {
  recommendationCache.set(key, { data, expires: Date.now() + ttl });
}

export async function trackInteraction(params: {
  userId?: string;
  sessionId?: string;
  itemId: string;
  action: InteractionAction;
  category?: string;
  tags?: string[];
  metadata?: Record<string, string>;
}): Promise<void> {
  try {
    if (!prisma) return;
    await prisma.userInteraction.create({
      data: {
        userId: params.userId || null,
        sessionId: params.sessionId || null,
        itemId: params.itemId,
        action: params.action,
        category: params.category || null,
        tags: params.tags || [],
        metadata: params.metadata || undefined,
      },
    });
  } catch {
    // Silent fail — tracking should never crash the app
  }
}

async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const cacheKey = `prefs:${userId}`;
  const cached = getCached<UserPreferences>(cacheKey);
  if (cached) return cached;

  if (!prisma) {
    return { categories: {}, tags: {}, avgPrice: 0, priceRange: { min: 0, max: 0 }, totalInteractions: 0 };
  }
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const interactions = await prisma.userInteraction.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
      action: { in: ['view', 'add_to_cart', 'order', 'favorite'] },
    },
    select: {
      itemId: true,
      action: true,
      category: true,
      tags: true,
    },
  });

  const prefs: UserPreferences = {
    categories: {},
    tags: {},
    avgPrice: 0,
    priceRange: { min: Infinity, max: 0 },
    totalInteractions: interactions.length,
  };

  if (interactions.length === 0) {
    setCache(cacheKey, prefs, 60 * 1000);
    return prefs;
  }

  const actionWeights: Record<string, number> = {
    favorite: 5,
    order: 4,
    add_to_cart: 3,
    view: 1,
  };

  let totalPrice = 0;
  let priceCount = 0;

  for (const interaction of interactions) {
    const weight = actionWeights[interaction.action] || 1;
    const menuItem = menuItems.find((m) => m.id === interaction.itemId);

    if (interaction.category) {
      prefs.categories[interaction.category] =
        (prefs.categories[interaction.category] || 0) + weight;
    }

    for (const tag of interaction.tags) {
      prefs.tags[tag] = (prefs.tags[tag] || 0) + weight;
    }

    if (menuItem) {
      totalPrice += menuItem.price;
      priceCount++;
      prefs.priceRange.min = Math.min(prefs.priceRange.min, menuItem.price);
      prefs.priceRange.max = Math.max(prefs.priceRange.max, menuItem.price);
    }
  }

  prefs.avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;
  if (prefs.priceRange.min === Infinity) prefs.priceRange = { min: 0, max: 0 };

  setCache(cacheKey, prefs, 5 * 60 * 1000);
  return prefs;
}

async function getUserOrderHistory(userId: string): Promise<string[]> {
  const cacheKey = `orders:${userId}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  if (!prisma) return [];
  const orders = await prisma.order.findMany({
    where: { userId, status: { in: ['COMPLETED', 'DELIVERED'] } },
    select: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const itemIds: string[] = [];
  for (const order of orders) {
    const items = order.items as Array<{ id: string; quantity: number }>;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id && !itemIds.includes(item.id)) {
          itemIds.push(item.id);
        }
      }
    }
  }

  setCache(cacheKey, itemIds, 10 * 60 * 1000);
  return itemIds;
}

function computeContentScore(item: MenuItem, prefs: UserPreferences): number {
  let score = 0;

  const catWeight = prefs.categories[item.category] || 0;
  score += catWeight * 2;

  for (const tag of item.tags) {
    score += (prefs.tags[tag] || 0) * 1.5;
  }

  if (prefs.avgPrice > 0) {
    const priceDiff = Math.abs(item.price - prefs.avgPrice) / prefs.avgPrice;
    score += Math.max(0, 3 - priceDiff * 5);
  }

  score += (item.rating / 5) * 2;
  score += (item.popularity / 100) * 1.5;

  return score;
}

export function findSimilarItems(
  sourceItem: MenuItem | ProductDetail,
  excludeIds: string[],
  limit: number
): RecommendationItem[] {
  const scored = menuItems
    .filter((item) => item.isAvailable && !excludeIds.includes(item.id) && item.id !== sourceItem.id)
    .map((item) => {
      let score = 0;

      if (item.category === sourceItem.category) score += 3;

      const commonTags = item.tags.filter((t) => sourceItem.tags.includes(t));
      score += commonTags.length * 2;

      const priceDiff = Math.abs(item.price - sourceItem.price) / Math.max(sourceItem.price, 1);
      score += Math.max(0, 2 - priceDiff * 3);

      score += (item.rating / 5) * 1.5;

      return {
        id: item.id,
        name: item.name,
        nameAr: item.nameAr,
        price: item.price,
        image: item.image,
        category: item.category,
        rating: item.rating,
        reason: commonTags.length > 0 ? 'similar' : 'same_category',
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

export async function getPersonalizedRecommendations(
  userId?: string,
  limit: number = 8
): Promise<RecommendationItem[]> {
  if (!userId) {
    return getPopularRecommendations(limit);
  }

  const cacheKey = `rec:personalized:${userId}:${limit}`;
  const cached = getCached<RecommendationItem[]>(cacheKey);
  if (cached) return cached;

  const prefs = await getUserPreferences(userId);
  const orderHistory = await getUserOrderHistory(userId);

  if (prefs.totalInteractions === 0 && orderHistory.length === 0) {
    return getPopularRecommendations(limit);
  }

  const scored = menuItems
    .filter((item) => item.isAvailable && !orderHistory.includes(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating,
      reason: 'recommended_for_you' as const,
      score: computeContentScore(item, prefs),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  setCache(cacheKey, scored, CACHE_TTL);
  return scored;
}

export async function getPopularRecommendations(
  limit: number = 8
): Promise<RecommendationItem[]> {
  const cacheKey = `rec:popular:${limit}`;
  const cached = getCached<RecommendationItem[]>(cacheKey);
  if (cached) return cached;

  const items = [...menuItems]
    .filter((item) => item.isAvailable)
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating,
      reason: 'trending' as const,
      score: item.rating * item.reviewCount,
    }));

  setCache(cacheKey, items, 10 * 60 * 1000);
  return items;
}

export async function getTrendingRecommendations(
  limit: number = 8
): Promise<RecommendationItem[]> {
  const cacheKey = `rec:trending:${limit}`;
  const cached = getCached<RecommendationItem[]>(cacheKey);
  if (cached) return cached;

  if (!prisma) return [];
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentInteractions = await prisma.userInteraction.groupBy({
    by: ['itemId'],
    where: {
      createdAt: { gte: oneDayAgo },
      action: { in: ['order', 'add_to_cart', 'view'] },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit * 2,
  });

  const itemCounts = new Map(
    recentInteractions.map((r: { itemId: string; _count: { id: number } }) => [r.itemId, r._count.id])
  );

  const items = menuItems
    .filter((item) => item.isAvailable)
    .map((item) => ({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating,
      reason: 'trending' as const,
      score: ((itemCounts.get(item.id) || 0) * 3) + item.popularity,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  setCache(cacheKey, items, 5 * 60 * 1000);
  return items;
}

export async function getNewArrivals(
  limit: number = 8
): Promise<RecommendationItem[]> {
  return menuItems
    .filter((item) => item.isAvailable && item.isNew)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating,
      reason: 'new_arrival' as const,
      score: item.popularity,
    }));
}

export async function getChefPicks(
  limit: number = 6
): Promise<RecommendationItem[]> {
  return menuItems
    .filter((item) => item.isAvailable && item.tags.includes('chef-special'))
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating,
      reason: 'chefs_pick' as const,
      score: item.rating * item.reviewCount,
    }));
}

export async function getFrequentlyBoughtTogether(
  itemId: string,
  limit: number = 4
): Promise<RecommendationItem[]> {
  const cacheKey = `rec:fbt:${itemId}:${limit}`;
  const cached = getCached<RecommendationItem[]>(cacheKey);
  if (cached) return cached;

  const sourceItem = menuItems.find((m) => m.id === itemId);
  if (!sourceItem || !prisma) return [];

  const orders = await prisma.order.findMany({
    where: { status: { in: ['COMPLETED', 'DELIVERED'] } },
    select: { items: true },
    take: 100,
  });

  const coOccurrences = new Map<string, number>();

  for (const order of orders) {
    const items = order.items as Array<{ id: string; quantity: number }>;
    if (!Array.isArray(items)) continue;

    const itemIds = items.map((i) => i.id);
    if (itemIds.includes(itemId)) {
      for (const id of itemIds) {
        if (id !== itemId) {
          coOccurrences.set(id, (coOccurrences.get(id) || 0) + 1);
        }
      }
    }
  }

  if (coOccurrences.size === 0) {
    return findSimilarItems(sourceItem, [itemId], limit);
  }

  const items = Array.from(coOccurrences.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => {
      const menuItem = menuItems.find((m) => m.id === id);
      if (!menuItem) return null;
      return {
        id: menuItem.id,
        name: menuItem.name,
        nameAr: menuItem.nameAr,
        price: menuItem.price,
        image: menuItem.image,
        category: menuItem.category as string,
        rating: menuItem.rating,
        reason: 'frequently_bought_together' as const,
        score: count * 2 + menuItem.popularity / 50,
      };
    })
    .filter((item): item is { id: string; name: string; nameAr: string; price: number; image: string; category: string; rating: number; reason: 'frequently_bought_together'; score: number } => item !== null) as RecommendationItem[];

  setCache(cacheKey, items, 15 * 60 * 1000);
  return items;
}

export async function getCompleteYourMeal(
  itemId: string,
  limit: number = 4
): Promise<RecommendationItem[]> {
  const sourceItem = menuItems.find((m) => m.id === itemId);
  if (!sourceItem) return [];

  const complementaryCategories: Record<string, string[]> = {
    food: ['desserts', 'drinks', 'coffee'],
    coffee: ['desserts', 'food'],
    desserts: ['coffee', 'drinks'],
    drinks: ['food', 'desserts'],
  };

  const targetCategories = complementaryCategories[sourceItem.category] || ['coffee', 'desserts'];

  const items = menuItems
    .filter(
      (item) =>
        item.isAvailable &&
        item.id !== itemId &&
        targetCategories.includes(item.category)
    )
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating,
      reason: 'complete_your_meal' as const,
      score: item.rating * item.reviewCount,
    }));

  return items;
}

export async function getCheckoutUpsells(
  cartItemIds: string[],
  limit: number = 4
): Promise<RecommendationItem[]> {
  const cacheKey = `rec:checkout:${cartItemIds.sort().join(',')}:${limit}`;
  const cached = getCached<RecommendationItem[]>(cacheKey);
  if (cached) return cached;

  const cartCategories = new Set<string>();
  for (const id of cartItemIds) {
    const item = menuItems.find((m) => m.id === id);
    if (item) cartCategories.add(item.category);
  }

  const upsellCategories = ['desserts', 'drinks'].filter((c) => !cartCategories.has(c));
  if (upsellCategories.length === 0) {
    upsellCategories.push('desserts', 'drinks');
  }

  const items = menuItems
    .filter(
      (item) =>
        item.isAvailable &&
        !cartItemIds.includes(item.id) &&
        upsellCategories.includes(item.category)
    )
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr,
      price: item.price,
      image: item.image,
      category: item.category,
      rating: item.rating,
      reason: 'checkout_upsell' as const,
      score: item.rating * item.reviewCount,
    }));

  setCache(cacheKey, items, 5 * 60 * 1000);
  return items;
}

export async function getRecentlyViewed(
  userId?: string,
  sessionId?: string,
  limit: number = 6
): Promise<RecommendationItem[]> {
  if (!userId && !sessionId) return [];

  if (!prisma) return [];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const interactions = await prisma.userInteraction.findMany({
    where: {
      ...(userId ? { userId } : { sessionId }),
      action: 'view',
      createdAt: { gte: oneWeekAgo },
    },
    select: { itemId: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const seenIds = new Set<string>();
  const itemIds: string[] = [];
  for (const i of interactions) {
    if (!seenIds.has(i.itemId)) {
      seenIds.add(i.itemId);
      itemIds.push(i.itemId);
    }
  }

  return itemIds
    .slice(0, limit)
    .map((id) => {
      const item = menuItems.find((m) => m.id === id);
      if (!item) return null;
      return {
        id: item.id,
        name: item.name,
        nameAr: item.nameAr,
        price: item.price,
        image: item.image,
        category: item.category as string,
        rating: item.rating,
        reason: 'recently_viewed' as const,
        score: 0,
      };
    })
    .filter((item): item is { id: string; name: string; nameAr: string; price: number; image: string; category: string; rating: number; reason: 'recently_viewed'; score: number } => item !== null) as RecommendationItem[];
}

export async function getRecommendationConfig(): Promise<{
  enabled: boolean;
  weights: Record<string, number>;
  pinnedItems: string[];
  excludedItems: string[];
}> {
  const cacheKey = 'rec:config';
  const cached = getCached<Awaited<ReturnType<typeof getRecommendationConfig>>>(cacheKey);
  if (cached) return cached;

  try {
    if (!prisma) return { enabled: true, weights: { content: 3, popularity: 2, trending: 2, collaborative: 1 }, pinnedItems: [], excludedItems: [] };
    const configs = await prisma.recommendationConfig.findMany();
    const configMap = new Map(configs.map((c) => [c.key, c.value]));

    const result = {
      enabled: (configMap.get('enabled') as boolean) ?? true,
      weights: (configMap.get('weights') as Record<string, number>) ?? {
        content: 3,
        popularity: 2,
        trending: 2,
        collaborative: 1,
      },
      pinnedItems: (configMap.get('pinnedItems') as string[]) ?? [],
      excludedItems: (configMap.get('excludedItems') as string[]) ?? [],
    };

    setCache(cacheKey, result, 5 * 60 * 1000);
    return result;
  } catch {
    return {
      enabled: true,
      weights: { content: 3, popularity: 2, trending: 2, collaborative: 1 },
      pinnedItems: [],
      excludedItems: [],
    };
  }
}

export async function updateRecommendationConfig(
  updates: Partial<{
    enabled: boolean;
    weights: Record<string, number>;
    pinnedItems: string[];
    excludedItems: string[];
  }>
): Promise<void> {
  if (!prisma) return;

  for (const [key, value] of Object.entries(updates)) {
    await prisma.recommendationConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  recommendationCache.delete('rec:config');
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find((m) => m.id === id);
}

export function getProductDetailById(id: string): ProductDetail | undefined {
  return productDetails[id];
}
