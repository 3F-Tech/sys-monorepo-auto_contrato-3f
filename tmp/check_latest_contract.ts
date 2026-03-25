import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const latestContract = await prisma.contracts.findFirst({
      orderBy: { created_at: 'desc' },
      include: { witnesses_email: true }
    });
    
    if (latestContract) {
      console.log('LATEST CONTRACT FOUND:');
      console.log('ID:', latestContract.id.toString());
      console.log('Title:', latestContract.title);
      console.log('Created At:', latestContract.created_at);
      console.log('Witnesses Count:', latestContract.witnesses_email.length);
      latestContract.witnesses_email.forEach((w: any) => console.log(`- ${w.email}`));
    } else {
      console.log('NO CONTRACTS FOUND.');
    }

  } catch (err: any) {
    console.error('Failed to query database:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
