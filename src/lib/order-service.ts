import prisma from '@/lib/prisma';
import type { CheckoutInput } from '@/lib/validations';
import { enqueueRecoveryJob } from '@/lib/order-recovery';
import { logger } from '@/lib/logger.server';
import type { Prisma } from '@prisma/client';

interface OrderItemSnapshot {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface OrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  totalPrice?: number;
  error?: string;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}${random}`;
}

export async function createOrder(
  input: CheckoutInput,
  userId: string
): Promise<OrderResult> {
  if (!prisma) {
    return { success: false, error: 'Service temporarily unavailable' };
  }

  const menuItemIds = input.items.map((item) => item.id);

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
    },
  });

  if (menuItems.length !== menuItemIds.length) {
    const foundIds = new Set(menuItems.map((item) => item.id));
    const missingIds = menuItemIds.filter((id) => !foundIds.has(id));
    return {
      success: false,
      error: `Some items are no longer available: ${missingIds.join(', ')}`,
    };
  }

  for (const menuItem of menuItems) {
    if (!menuItem.isAvailable) {
      return {
        success: false,
        error: `"${menuItem.name}" is currently unavailable`,
      };
    }
  }

  const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

  let serverTotal = 0;
  const itemsSnapshot: OrderItemSnapshot[] = [];

  for (const cartItem of input.items) {
    const menuItem = menuItemMap.get(cartItem.id);
    if (!menuItem) {
      return { success: false, error: `Item ${cartItem.id} not found` };
    }

    const itemTotal = menuItem.price * cartItem.quantity;
    serverTotal += itemTotal;

    itemsSnapshot.push({
      id: menuItem.id,
      name: menuItem.name,
      nameAr: menuItem.name,
      nameFr: menuItem.name,
      price: menuItem.price,
      quantity: cartItem.quantity,
      image: menuItem.image ?? '/images/placeholder.jpg',
      category: menuItem.category,
    });
  }

  serverTotal = Math.round(serverTotal * 100) / 100;

  const deliveryFee = input.deliveryType === 'DELIVERY' ? 15 : 0;
  const taxRate = 0.15;
  const tax = Math.round(serverTotal * taxRate * 100) / 100;
  const finalTotal = Math.round((serverTotal + deliveryFee + tax) * 100) / 100;

  const orderNumber = generateOrderNumber();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          items: itemsSnapshot as unknown as Prisma.InputJsonValue,
          totalPrice: finalTotal,
          status: 'PENDING',
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentMethod === 'CASH' ? 'UNPAID' : 'UNPAID',
          deliveryType: input.deliveryType,
          address: input.address || null,
          notes: input.notes || null,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
        },
      });

      if (input.paymentMethod === 'WALLET') {
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet || wallet.balance < finalTotal) {
          throw new Error('Insufficient wallet balance');
        }

        await tx.wallet.update({
          where: { userId },
          data: { balance: wallet.balance - finalTotal },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: -finalTotal,
            type: 'PAYMENT',
            description: `Payment for order ${orderNumber}`,
            referenceId: order.id,
          },
        });

        await tx.payment.create({
          data: {
            orderId: order.id,
            userId,
            amount: finalTotal,
            method: 'WALLET',
            status: 'PAID',
            metadata: {
              orderId: order.id,
              orderNumber,
            },
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PAID' },
        });
      }

      return order;
    });

    logger.info('Order created successfully', 'Orders', {
      orderId: result.id,
      orderNumber: result.orderNumber,
      total: finalTotal,
      paymentMethod: input.paymentMethod,
    });

    return {
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
      totalPrice: result.totalPrice,
    };
  } catch (error) {
    logger.error('Failed to create order', 'Orders', error, {
      orderNumber,
      userId,
    });

    if (error instanceof Error && error.message === 'Insufficient wallet balance') {
      return { success: false, error: 'Insufficient wallet balance' };
    }

    enqueueRecoveryJob('order_payment_sync', {
      orderId: 'unknown',
      paymentStatus: 'FAILED',
    });

    return { success: false, error: 'Failed to create order. Please try again.' };
  }
}

export async function getOrderById(orderId: string, userId: string) {
  if (!prisma) return null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.userId !== userId) {
    return null;
  }

  return order;
}

export async function getOrderbyNumber(orderNumber: string, userId: string) {
  if (!prisma) return null;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
  });

  if (!order || order.userId !== userId) {
    return null;
  }

  return order;
}

export async function getOrderWithPayments(orderId: string) {
  if (!prisma) return null;

  const result = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payments: true,
    },
  });

  return result as (typeof result & { payments: { id: string; orderId: string; userId: string; amount: number; method: string; status: string; transactionId: string | null; metadata: unknown; createdAt: Date; updatedAt: Date }[] }) | null;
}
