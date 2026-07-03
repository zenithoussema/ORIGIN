import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server-auth';
import prisma from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  if (!prisma) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalPrice: order.totalPrice,
      deliveryType: order.deliveryType,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      address: order.address,
      notes: order.notes,
      customerName: order.customerName,
      items: order.items,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    },
  });
}
