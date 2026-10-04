import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Optimized Prisma configuration for better performance and reduced costs
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + (
          process.env.NODE_ENV === 'production' 
            ? "?connection_limit=10&pool_timeout=20&connect_timeout=60&schema_disable_advisory_lock=1" 
            : "?connection_limit=5&pool_timeout=10"
        ),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
