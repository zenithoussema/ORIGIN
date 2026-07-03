import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/server-auth';
import { getFeatureFlags, setFeatureFlags, type FeatureFlags } from '@/lib/flags';
import { createAuditLog } from '@/lib/audit-log';

export async function GET(request: Request) {
  const auth = await assertAdminApi(request);
  if (!auth.authorized) return auth.response;

  const flags = await getFeatureFlags();
  return NextResponse.json({ flags });
}

export async function PUT(request: Request) {
  const auth = await assertAdminApi(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const flags: Partial<FeatureFlags> = {};

    const allowedFlags: (keyof FeatureFlags)[] = [
      'enableOnlineOrdering',
      'enableReservations',
      'maintenanceMode',
      'enableNotifications',
      'enableWalletTopup',
      'enablePromotions',
    ];

    for (const flag of allowedFlags) {
      if (flag in body && typeof body[flag] === 'boolean') {
        flags[flag] = body[flag];
      }
    }

    const oldFlags = await getFeatureFlags();
    await setFeatureFlags(flags);

    await createAuditLog({
      userId: auth.session.user.id,
      action: 'UPDATE',
      entity: 'FeatureFlags',
      entityId: 'global',
      oldValue: oldFlags as unknown as Record<string, unknown>,
      newValue: flags as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ success: true, flags: await getFeatureFlags() });
  } catch {
    return NextResponse.json({ error: 'Failed to update flags' }, { status: 400 });
  }
}
