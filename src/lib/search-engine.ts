import { menuItems, menuCategories, type MenuItem, type MenuCategory, type MenuTag, type SortOption } from '@/data/menu';

// ── Types ───────────────────────────────────────────────────────────────────

export interface SearchFilters {
  categories: MenuCategory[];
  tags: MenuTag[];
  priceRange: [number, number];
  maxPrepTime: number;
  maxCalories: number;
  minRating: number;
  onlyAvailable: boolean;
  sort: SortOption;
}

export interface ParsedQuery {
  rawQuery: string;
  textSearch: string;
  priceFilter: { operator: 'lt' | 'gt' | 'between' | null; values: number[] };
  tagFilters: MenuTag[];
  categoryHints: MenuCategory[];
  intent: 'text' | 'price' | 'tag' | 'category' | 'mixed';
}

export interface SearchResult {
  item: MenuItem;
  score: number;
  matchedFields: string[];
}

export const defaultFilters: SearchFilters = {
  categories: [],
  tags: [],
  priceRange: [0, 500],
  maxPrepTime: 60,
  maxCalories: 1000,
  minRating: 0,
  onlyAvailable: true,
  sort: 'popular',
};

// ── Fuzzy Matching ──────────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (t === q) return 1;
  if (t.startsWith(q)) return 0.95;
  if (t.includes(q)) return 0.85;

  const distance = levenshtein(q, t);
  const maxLen = Math.max(q.length, t.length);
  if (maxLen === 0) return 1;
  const similarity = 1 - distance / maxLen;

  if (q.length >= 3 && t.length >= 3) {
    const qChars = q.split('');
    let tIdx = 0;
    let consecutive = 0;
    let matched = 0;
    for (const ch of qChars) {
      const found = t.indexOf(ch, tIdx);
      if (found !== -1) {
        matched++;
        if (found === tIdx) consecutive++;
        tIdx = found + 1;
      }
    }
    const sequenceBonus = matched > 1 ? (consecutive / matched) * 0.15 : 0;
    return Math.min(0.9, similarity + sequenceBonus);
  }

  return similarity;
}

// ── Natural Language Parsing ────────────────────────────────────────────────

const PRICE_PATTERNS = [
  { regex: /under\s+(\d+)/i, op: 'lt' as const },
  { regex: /less\s+than\s+(\d+)/i, op: 'lt' as const },
  { regex: /below\s+(\d+)/i, op: 'lt' as const },
  { regex: /cheaper\s+than\s+(\d+)/i, op: 'lt' as const },
  { regex: /over\s+(\d+)/i, op: 'gt' as const },
  { regex: /more\s+than\s+(\d+)/i, op: 'gt' as const },
  { regex: /above\s+(\d+)/i, op: 'gt' as const },
  { regex: /between\s+(\d+)\s+(?:and|-)\s+(\d+)/i, op: 'between' as const },
  { regex: /(\d+)\s*(?:tunisian|tnd|dinar|dt)/i, op: 'between' as const },
];

const TAG_ALIASES: Record<string, MenuTag> = {
  vegan: 'vegan',
  vegetarian: 'vegan',
  plant: 'vegan',
  spicy: 'spicy',
  hot: 'spicy',
  fiery: 'spicy',
  popular: 'popular',
  trending: 'popular',
  best: 'popular',
  top: 'popular',
  favorite: 'popular',
  new: 'new',
  latest: 'new',
  fresh: 'new',
  'gluten-free': 'gluten-free',
  gluten: 'gluten-free',
  celiac: 'gluten-free',
  'chef-special': 'chef-special',
  chef: 'chef-special',
  special: 'chef-special',
  recommended: 'chef-special',
  light: 'light',
  healthy: 'light',
  diet: 'light',
  lowcal: 'light',
  'low-calorie': 'light',
  premium: 'premium',
  luxury: 'premium',
  fancy: 'premium',
  fine: 'premium',
};

const INTENT_KEYWORDS: Record<string, { categories?: MenuCategory[]; tags?: MenuTag[] }> = {
  sweet: { tags: ['chef-special'], categories: ['desserts'] },
  dessert: { categories: ['desserts'] },
  cake: { categories: ['desserts'] },
  pastry: { categories: ['desserts'] },
  coffee: { categories: ['coffee'] },
  drink: { categories: ['drinks'] },
  beverage: { categories: ['drinks'] },
  food: { categories: ['food'] },
  meal: { categories: ['food'] },
  breakfast: { categories: ['food', 'coffee'] },
  lunch: { categories: ['food'] },
  dinner: { categories: ['food'] },
  snack: { categories: ['desserts', 'food'] },
  meat: { categories: ['food'] },
  fish: { categories: ['food'] },
  seafood: { categories: ['food'] },
  salad: { categories: ['food'] },
  soup: { categories: ['food'] },
  rice: { categories: ['food'] },
  pasta: { categories: ['food'] },
  vegetarian: { tags: ['vegan'] },
  vegan: { tags: ['vegan'] },
  spicy: { tags: ['spicy'] },
  cold: { categories: ['drinks', 'coffee'] },
  hot: { tags: ['spicy'] },
  healthy: { tags: ['light'] },
  cheap: {},
  affordable: {},
  budget: {},
  quick: {},
  fast: {},
  slow: {},
};

export function parseQuery(raw: string): ParsedQuery {
  const trimmed = raw.trim();
  const result: ParsedQuery = {
    rawQuery: trimmed,
    textSearch: '',
    priceFilter: { operator: null, values: [] },
    tagFilters: [],
    categoryHints: [],
    intent: 'text',
  };

  let working = trimmed.toLowerCase();

  // Extract price filters
  for (const pattern of PRICE_PATTERNS) {
    const match = working.match(pattern.regex);
    if (match) {
      result.priceFilter.operator = pattern.op;
      result.priceFilter.values = match.slice(1).map(Number);
      working = working.replace(pattern.regex, ' ').trim();
      if (result.intent === 'text') result.intent = 'price';
      break;
    }
  }

  // Extract tag filters
  const words = working.split(/\s+/);
  for (const word of words) {
    const clean = word.replace(/[^a-z-]/g, '');
    if (TAG_ALIASES[clean]) {
      const tag = TAG_ALIASES[clean];
      if (!result.tagFilters.includes(tag)) {
        result.tagFilters.push(tag);
      }
      working = working.replace(word, ' ').trim();
      if (result.intent === 'text') result.intent = 'tag';
    }
  }

  // Extract category hints from intent keywords
  for (const word of words) {
    const clean = word.replace(/[^a-z-]/g, '');
    if (INTENT_KEYWORDS[clean]) {
      const hint = INTENT_KEYWORDS[clean];
      if (hint.categories) {
        for (const c of hint.categories) {
          if (!result.categoryHints.includes(c)) result.categoryHints.push(c);
        }
      }
      if (hint.tags) {
        for (const t of hint.tags) {
          if (!result.tagFilters.includes(t)) result.tagFilters.push(t);
        }
      }
    }
  }

  result.textSearch = working.replace(/\s+/g, ' ').trim();

  if (result.priceFilter.operator && (result.tagFilters.length > 0 || result.categoryHints.length > 0)) {
    result.intent = 'mixed';
  } else if (result.tagFilters.length > 0 && result.textSearch.length > 0) {
    result.intent = 'mixed';
  } else if (result.categoryHints.length > 0 && result.textSearch.length > 0) {
    result.intent = 'mixed';
  }

  return result;
}

// ── Scoring & Ranking ───────────────────────────────────────────────────────

function computeScore(item: MenuItem, parsed: ParsedQuery): { score: number; matchedFields: string[] } {
  let score = 0;
  const matchedFields: string[] = [];
  const q = parsed.textSearch.toLowerCase();

  if (q.length === 0 && parsed.tagFilters.length === 0 && parsed.categoryHints.length === 0 && !parsed.priceFilter.operator) {
    score = item.popularity / 100;
    return { score, matchedFields: ['popularity'] };
  }

  // Text matching
  if (q.length > 0) {
    const nameScore = fuzzyScore(q, item.name);
    const nameArScore = fuzzyScore(q, item.nameAr);
    const descScore = fuzzyScore(q, item.description) * 0.7;
    const descArScore = fuzzyScore(q, item.descriptionAr) * 0.7;
    const catScore = fuzzyScore(q, item.category) * 0.5;

    let ingredientScore = 0;
    for (const ing of item.ingredients) {
      const s = fuzzyScore(q, ing);
      if (s > ingredientScore) ingredientScore = s;
    }
    for (const ing of item.ingredientsAr) {
      const s = fuzzyScore(q, ing);
      if (s > ingredientScore) ingredientScore = s;
    }

    const best = Math.max(nameScore, nameArScore, descScore, descArScore, catScore, ingredientScore * 0.6);
    score += best;

    if (best === nameScore && nameScore > 0.7) matchedFields.push('name');
    if (best === nameArScore && nameArScore > 0.7) matchedFields.push('nameAr');
    if (best === descScore && descScore > 0.3) matchedFields.push('description');
    if (best === ingredientScore * 0.6 && ingredientScore > 0.7) matchedFields.push('ingredients');
    if (best === catScore && catScore > 0.5) matchedFields.push('category');
  }

  // Tag matching
  if (parsed.tagFilters.length > 0) {
    const matchingTags = parsed.tagFilters.filter((t) => item.tags.includes(t));
    const tagScore = matchingTags.length / parsed.tagFilters.length;
    score += tagScore * 0.4;
    if (matchingTags.length > 0) matchedFields.push('tags');
  }

  // Category hints
  if (parsed.categoryHints.length > 0) {
    const catMatch = parsed.categoryHints.includes(item.category) ? 1 : 0;
    score += catMatch * 0.3;
    if (catMatch) matchedFields.push('category');
  }

  // Popularity boost
  score += (item.popularity / 100) * 0.05;

  // Rating boost
  score += (item.rating / 5) * 0.05;

  return { score: Math.min(1, score), matchedFields };
}

// ── Search Engine ───────────────────────────────────────────────────────────

export function searchItems(
  rawQuery: string,
  filters: SearchFilters = defaultFilters,
  locale: string = 'en'
): SearchResult[] {
  const parsed = parseQuery(rawQuery);
  let candidates = [...menuItems];

  // Apply availability filter
  if (filters.onlyAvailable) {
    candidates = candidates.filter((i) => i.isAvailable);
  }

  // Apply category filter
  if (filters.categories.length > 0) {
    candidates = candidates.filter((i) => filters.categories.includes(i.category));
  }

  // Apply tag filter
  if (filters.tags.length > 0) {
    candidates = candidates.filter((i) => filters.tags.some((t) => i.tags.includes(t)));
  }

  // Apply price range
  candidates = candidates.filter(
    (i) => i.price >= filters.priceRange[0] && i.price <= filters.priceRange[1]
  );

  // Apply prep time
  candidates = candidates.filter((i) => i.prepTime <= filters.maxPrepTime);

  // Apply calories
  candidates = candidates.filter((i) => (i.calories ?? 0) <= filters.maxCalories);

  // Apply rating
  candidates = candidates.filter((i) => i.rating >= filters.minRating);

  // Apply parsed price filter
  if (parsed.priceFilter.operator) {
    candidates = candidates.filter((i) => {
      const price = i.price;
      switch (parsed.priceFilter.operator) {
        case 'lt': return price < parsed.priceFilter.values[0];
        case 'gt': return price > parsed.priceFilter.values[0];
        case 'between': return price >= parsed.priceFilter.values[0] && price <= (parsed.priceFilter.values[1] ?? Infinity);
        default: return true;
      }
    });
  }

  // Apply parsed tag filters
  if (parsed.tagFilters.length > 0) {
    candidates = candidates.filter((i) => parsed.tagFilters.some((t) => i.tags.includes(t)));
  }

  // Apply parsed category hints
  if (parsed.categoryHints.length > 0 && parsed.textSearch.length === 0) {
    candidates = candidates.filter((i) => parsed.categoryHints.includes(i.category));
  }

  // Score
  const results: SearchResult[] = candidates.map((item) => {
    const { score, matchedFields } = computeScore(item, parsed);
    return { item, score, matchedFields };
  });

  // Sort
  results.sort((a, b) => {
    switch (filters.sort) {
      case 'popular':
        return b.item.popularity - a.item.popularity;
      case 'price-asc':
        return a.item.price - b.item.price;
      case 'price-desc':
        return b.item.price - a.item.price;
      case 'newest':
        return (b.item.isNew ? 1 : 0) - (a.item.isNew ? 1 : 0);
      case 'rating':
        return b.item.rating - a.item.rating;
      case 'relevance':
      default:
        return b.score - a.score;
    }
  });

  return results;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getTrendingItems(limit: number = 6): MenuItem[] {
  return [...menuItems]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}

export function getPopularItems(limit: number = 6): MenuItem[] {
  return [...menuItems]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function getNewItems(limit: number = 6): MenuItem[] {
  return menuItems.filter((i) => i.isNew).slice(0, limit);
}

export function getItemsByCategory(cat: MenuCategory): MenuItem[] {
  return menuItems.filter((i) => i.category === cat);
}

export function getSuggestions(query: string): string[] {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  const suggestions = new Set<string>();

  for (const item of menuItems) {
    if (item.name.toLowerCase().includes(q)) suggestions.add(item.name);
    if (item.nameAr.includes(query)) suggestions.add(item.nameAr);
    for (const ing of item.ingredients) {
      if (ing.toLowerCase().includes(q)) suggestions.add(ing);
    }
  }

  for (const cat of menuCategories) {
    if (cat.name.toLowerCase().includes(q) || cat.nameAr.includes(query)) {
      suggestions.add(cat.name);
    }
  }

  for (const [alias, tag] of Object.entries(TAG_ALIASES)) {
    if (alias.includes(q)) suggestions.add(tag);
  }

  return Array.from(suggestions).slice(0, 6);
}

export function getSearchableItemName(item: MenuItem, locale: string = 'en'): string {
  return locale === 'ar' ? item.nameAr : locale === 'fr' ? item.nameFr : item.name;
}

export function getSearchableItemDescription(item: MenuItem, locale: string = 'en'): string {
  return locale === 'ar' ? item.descriptionAr : locale === 'fr' ? item.descriptionFr : item.description;
}
