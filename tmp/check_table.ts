import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'auto_contrato' 
      AND table_name = 'witnesses_email'
    `;
    console.log('Table existence check:', JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('Failed to query information_schema:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
