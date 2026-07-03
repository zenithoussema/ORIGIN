import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/server-auth';
import { getAuditLogs } from '@/lib/audit-log';

export async function GET(request: Request) {
  const auth = await assertAdminApi(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);

    const entity = searchParams.get('entity') || undefined;
    const entityId = searchParams.get('entityId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getAuditLogs({
      entity,
      entityId,
      userId,
      action,
      limit: Math.min(limit, 100),
      offset,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
