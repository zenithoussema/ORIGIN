import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/server-auth';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-log';
import { logger } from '@/lib/logger.server';
import { z } from 'zod';

const walletActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('credit'),
    userId: z.string().min(1, 'User ID is required'),
    amount: z.number().positive('Amount must be positive').max(50000, 'Maximum credit is 50,000 DT'),
    reason: z.string().min(1, 'Reason is required').max(200),
  }),
  z.object({
    action: z.literal('debit'),
    userId: z.string().min(1, 'User ID is required'),
    amount: z.number().positive('Amount must be positive').max(50000, 'Maximum debit is 50,000 DT'),
    reason: z.string().min(1, 'Reason is required').max(200),
  }),
  z.object({
    action: z.literal('balance'),
    userId: z.string().min(1, 'User ID is required'),
  }),
]);

export async function POST(request: Request) {
  const auth = await assertAdminApi(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const result = walletActionSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const data = result.data;
    const userId = data.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (data.action === 'balance') {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      return NextResponse.json({
        userId,
        balance: wallet?.balance ?? 0,
      });
    }

    if (data.action === 'credit') {
      const wallet = await prisma.wallet.upsert({
        where: { userId },
        create: {
          userId,
          balance: data.amount,
          transactions: {
            create: {
              amount: data.amount,
              type: 'ADMIN_CREDIT',
              description: `Admin credit: ${data.reason}`,
              referenceId: auth.session.user.id,
            },
          },
        },
        update: {
          balance: { increment: data.amount },
          transactions: {
            create: {
              amount: data.amount,
              type: 'ADMIN_CREDIT',
              description: `Admin credit: ${data.reason}`,
              referenceId: auth.session.user.id,
            },
          },
        },
      });

      await createAuditLog({
        userId: auth.session.user.id,
        action: 'UPDATE',
        entity: 'Wallet',
        entityId: userId,
        newValue: { action: 'credit', amount: data.amount, reason: data.reason, newBalance: wallet.balance },
      });

      logger.info('Admin credited wallet', 'Admin', {
        adminUserId: auth.session.user.id,
        targetUserId: userId,
        amount: data.amount,
        reason: data.reason,
      });

      return NextResponse.json({
        success: true,
        balance: wallet.balance,
        message: `Credited ${data.amount} DT to ${user.name}'s wallet.`,
      });
    }

    if (data.action === 'debit') {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        return NextResponse.json(
          { error: 'User has no wallet. Create one by crediting first.' },
          { status: 400 }
        );
      }

      if (wallet.balance < data.amount) {
        return NextResponse.json(
          { error: `Insufficient balance. Available: ${wallet.balance.toFixed(3)} DT` },
          { status: 400 }
        );
      }

      const updatedWallet = await prisma.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: data.amount },
          transactions: {
            create: {
              amount: -data.amount,
              type: 'ADMIN_DEBIT',
              description: `Admin debit: ${data.reason}`,
              referenceId: auth.session.user.id,
            },
          },
        },
      });

      await createAuditLog({
        userId: auth.session.user.id,
        action: 'UPDATE',
        entity: 'Wallet',
        entityId: userId,
        oldValue: { balance: wallet.balance },
        newValue: { action: 'debit', amount: data.amount, reason: data.reason, newBalance: updatedWallet.balance },
      });

      logger.info('Admin debited wallet', 'Admin', {
        adminUserId: auth.session.user.id,
        targetUserId: userId,
        amount: data.amount,
        reason: data.reason,
      });

      return NextResponse.json({
        success: true,
        balance: updatedWallet.balance,
        message: `Debited ${data.amount} DT from ${user.name}'s wallet.`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('Admin wallet operation error', 'Admin', error);
    return NextResponse.json(
      { error: 'Failed to process wallet operation' },
      { status: 500 }
    );
  }
}
