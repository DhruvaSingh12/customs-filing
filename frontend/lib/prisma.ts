import { PrismaClient } from '@prisma/client';

// Only use this export in server-side code (API routes, server components, nextauth config, etc)
export const prisma = new PrismaClient();
