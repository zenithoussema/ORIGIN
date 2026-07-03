import { NextResponse } from 'next/server';
import { assertAdminApi } from '@/lib/server-auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger.server';
import type { OrderStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['COOKING', 'CANCELLED'],
  COOKING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdminApi(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  if (!prisma) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const allowedStatuses = Object.keys(VALID_TRANSITIONS);
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

    logger.info('Order status updated', 'Admin', {
      userId: auth.session.user.id,
      orderId: id,
      from: order.status,
      to: status,
    });

    return NextResponse.json({
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Order update error', 'Admin', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
