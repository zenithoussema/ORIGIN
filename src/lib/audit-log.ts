import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger.server';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE' | 'STATUS_CHANGE' | 'EXPORT' | 'BROADCAST';

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  if (!prisma) {
    logger.warn('Audit log skipped: DB not available', 'AuditLog', { action: entry.action, entity: entry.entity });
    return;
  }

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO audit_logs ("id", "userId", "action", "entity", "entityId", "oldValue", "newValue", "ip", "userAgent", "metadata", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      entry.userId || null,
      entry.action,
      entry.entity,
      entry.entityId || null,
      entry.oldValue ? JSON.stringify(entry.oldValue) : null,
      entry.newValue ? JSON.stringify(entry.newValue) : null,
      entry.ip || null,
      entry.userAgent || null,
      entry.metadata ? JSON.stringify(entry.metadata) : null
    );
  } catch (error) {
    logger.error('Failed to create audit log', 'AuditLog', error, {
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
    });
  }
}

export async function logCreate(params: {
  userId?: string;
  entity: string;
  entityId: string;
  newValue: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  return createAuditLog({
    ...params,
    action: 'CREATE',
  });
}

export async function logUpdate(params: {
  userId?: string;
  entity: string;
  entityId: string;
  oldValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  return createAuditLog({
    ...params,
    action: 'UPDATE',
  });
}

export async function logDelete(params: {
  userId?: string;
  entity: string;
  entityId: string;
  oldValue: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  return createAuditLog({
    ...params,
    action: 'DELETE',
  });
}

export async function logRestore(params: {
  userId?: string;
  entity: string;
  entityId: string;
  newValue: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  return createAuditLog({
    ...params,
    action: 'RESTORE',
  });
}

export async function logLogin(params: {
  userId: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  return createAuditLog({
    ...params,
    action: params.success ? 'LOGIN' : 'LOGIN_FAILED',
    entity: 'User',
    entityId: params.userId,
  });
}

export async function logPasswordChange(params: {
  userId: string;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  return createAuditLog({
    ...params,
    action: 'PASSWORD_CHANGE',
    entity: 'User',
    entityId: params.userId,
  });
}

export async function logRoleChange(params: {
  userId: string;
  adminId: string;
  oldRole: string;
  newRole: string;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  return createAuditLog({
    userId: params.adminId,
    action: 'ROLE_CHANGE',
    entity: 'User',
    entityId: params.userId,
    oldValue: { role: params.oldRole },
    newValue: { role: params.newRole },
    ip: params.ip,
    userAgent: params.userAgent,
  });
}

export async function getAuditLogs(params: {
  entity?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: Array<Record<string, unknown>>; total: number }> {
  if (!prisma) return { logs: [], total: 0 };

  try {
    const where: Record<string, unknown> = {};
    if (params.entity) where.entity = params.entity;
    if (params.entityId) where.entityId = params.entityId;
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const countResult = await prisma.$executeRawUnsafe(
      `SELECT COUNT(*) as count FROM audit_logs WHERE ($1::text IS NULL OR entity = $1) AND ($2::text IS NULL OR "entityId" = $2) AND ($3::text IS NULL OR "userId" = $3) AND ($4::text IS NULL OR action = $4)`,
      params.entity || null,
      params.entityId || null,
      params.userId || null,
      params.action || null
    );

    const logsResult = await prisma.$executeRawUnsafe(
      `SELECT * FROM audit_logs WHERE ($1::text IS NULL OR entity = $1) AND ($2::text IS NULL OR "entityId" = $2) AND ($3::text IS NULL OR "userId" = $3) AND ($4::text IS NULL OR action = $4) ORDER BY "createdAt" DESC LIMIT $5 OFFSET $6`,
      params.entity || null,
      params.entityId || null,
      params.userId || null,
      params.action || null,
      limit,
      offset
    );

    return {
      logs: Array.isArray(logsResult) ? logsResult : [],
      total: typeof countResult === 'number' ? countResult : 0,
    };
  } catch (error) {
    logger.error('Failed to fetch audit logs', 'AuditLog', error);
    return { logs: [], total: 0 };
  }
}
