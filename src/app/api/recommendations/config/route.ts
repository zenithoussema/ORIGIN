import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server-auth';
import { getRecommendationConfig, updateRecommendationConfig } from '@/lib/recommendations';
import { z } from 'zod';

const configUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  weights: z.object({
    content: z.number().min(0).max(10).optional(),
    popularity: z.number().min(0).max(10).optional(),
    trending: z.number().min(0).max(10).optional(),
    collaborative: z.number().min(0).max(10).optional(),
  }).optional(),
  pinnedItems: z.array(z.string()).optional(),
  excludedItems: z.array(z.string()).optional(),
}).strict();

export async function GET() {
  try {
    const config = await getRecommendationConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const result = configUpdateSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message, field: firstError.path.join('.') },
        { status: 400 }
      );
    }

    await updateRecommendationConfig(result.data);
    const config = await getRecommendationConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}
