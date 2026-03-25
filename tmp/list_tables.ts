import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'auto_contrato'
    `;
    console.log('Tables in auto_contrato:', JSON.stringify(result, null, 2));
    
    // Also check public schema just in case
    const publicResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables in public:', JSON.stringify(publicResult, null, 2));

  } catch (err: any) {
    console.error('Failed to query information_schema:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
