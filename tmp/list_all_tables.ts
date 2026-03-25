import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name
    `;
    console.log('All Tables:', JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('Failed to query information_schema:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
