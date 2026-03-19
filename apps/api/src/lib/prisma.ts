import { PrismaClient } from '@prisma/client'

// Adiciona o prisma ao objeto global do Node para evitar múltiplas instâncias em dev
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma