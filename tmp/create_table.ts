import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating table witnesses_email manually...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS auto_contrato.witnesses_email (
        id BIGSERIAL PRIMARY KEY,
        contract_id BIGINT NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_contract FOREIGN KEY (contract_id) REFERENCES auto_contrato.contracts(id) ON DELETE CASCADE
      );
    `);
    console.log('Table created or already exists.');
    
    // Verify again
    const result = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'auto_contrato' AND table_name = 'witnesses_email'
    `);
    console.log('Verification result:', JSON.stringify(result, null, 2));

  } catch (err: any) {
    console.error('Failed to create table:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
