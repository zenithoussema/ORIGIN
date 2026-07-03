import { NextResponse } from 'next/server';
import { trackInteraction, type InteractionAction } from '@/lib/recommendations';
import { logger } from '@/lib/logger.server';

const VALID_ACTIONS: InteractionAction[] = ['view', 'add_to_cart', 'remove_from_cart', 'order', 'favorite', 'search', 'click'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, action, sessionId, category, tags, query, userId } = body;

    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    if (!VALID_ACTIONS.includes(action as InteractionAction)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (itemId.length > 100) {
      return NextResponse.json({ error: 'itemId too long' }, { status: 400 });
    }

    await trackInteraction({
      userId: typeof userId === 'string' && userId.length > 0 ? userId : undefined,
      sessionId: typeof sessionId === 'string' && sessionId.length > 0 ? sessionId : undefined,
      itemId,
      action: action as InteractionAction,
      category: typeof category === 'string' ? category : undefined,
      tags: Array.isArray(tags) ? tags.filter((t): t is string => typeof t === 'string') : undefined,
      metadata: typeof query === 'string' ? { query } : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Track interaction error', 'Recommendations', error);
    return NextResponse.json({ ok: true });
  }
}
