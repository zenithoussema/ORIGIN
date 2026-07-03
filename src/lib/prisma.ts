import type { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | undefined = undefined;

try {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  if (!globalForPrisma.prisma) {
    const { PrismaClient: Client } = require('@prisma/client');
    globalForPrisma.prisma = new Client({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  prisma = globalForPrisma.prisma;
} catch {
  console.warn(
    'Prisma Client not generated. Run `npx prisma generate` to enable database features.'
  );
}

export { prisma };
export default prisma;
