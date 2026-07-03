import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger.server';
import type { OrderStatus, PaymentStatus, PaymentRecordStatus } from '@prisma/client';

interface RecoveryJob {
  id: string;
  type: 'order_payment_sync' | 'payment_update' | 'order_update';
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  lastAttemptAt: Date | null;
  error: string | null;
}

const recoveryQueue: RecoveryJob[] = [];
let processing = false;

function generateJobId(): string {
  return `recovery_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function enqueueRecoveryJob(
  type: RecoveryJob['type'],
  payload: Record<string, unknown>,
  maxAttempts: number = 3
): string {
  const jobId = generateJobId();

  recoveryQueue.push({
    id: jobId,
    type,
    payload,
    attempts: 0,
    maxAttempts,
    createdAt: new Date(),
    lastAttemptAt: null,
    error: null,
  });

  logger.info('Recovery job enqueued', 'Recovery', { jobId, type });

  if (!processing) {
    processQueue();
  }

  return jobId;
}

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;

  while (recoveryQueue.length > 0) {
    const job = recoveryQueue[0];
    if (!job) break;

    job.attempts++;
    job.lastAttemptAt = new Date();

    try {
      await processJob(job);
      recoveryQueue.shift();
      logger.info('Recovery job completed', 'Recovery', { jobId: job.id, type: job.type });
    } catch (error) {
      job.error = error instanceof Error ? error.message : 'Unknown error';

      if (job.attempts >= job.maxAttempts) {
        recoveryQueue.shift();
        logger.error('Recovery job failed permanently', 'Recovery', error, {
          jobId: job.id,
          type: job.type,
          attempts: job.attempts,
        });
      } else {
        logger.warn('Recovery job failed, will retry', 'Recovery', {
          jobId: job.id,
          type: job.type,
          attempt: job.attempts,
          maxAttempts: job.maxAttempts,
        });
        await new Promise((resolve) => setTimeout(resolve, 5000 * job.attempts));
      }
    }
  }

  processing = false;
}

async function processJob(job: RecoveryJob): Promise<void> {
  if (!prisma) {
    throw new Error('Database not available');
  }

  switch (job.type) {
    case 'order_payment_sync': {
      const { orderId, paymentStatus } = job.payload as { orderId: string; paymentStatus: string };

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (order.paymentStatus !== paymentStatus) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: paymentStatus as PaymentStatus },
        });
      }
      break;
    }

    case 'payment_update': {
      const { paymentId, status, transactionId } = job.payload as {
        paymentId: string;
        status: string;
        transactionId?: string;
      };

      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) {
        throw new Error(`Payment ${paymentId} not found`);
      }

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: status as PaymentRecordStatus,
          ...(transactionId ? { transactionId } : {}),
        },
      });
      break;
    }

    case 'order_update': {
      const { orderId, status } = job.payload as { orderId: string; status: string };

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatus },
      });
      break;
    }

    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
}

export function getRecoveryQueueStatus(): {
  pending: number;
  processing: boolean;
  jobs: { id: string; type: string; attempts: number; error: string | null }[];
} {
  return {
    pending: recoveryQueue.length,
    processing,
    jobs: recoveryQueue.map((j) => ({
      id: j.id,
      type: j.type,
      attempts: j.attempts,
      error: j.error,
    })),
  };
}
