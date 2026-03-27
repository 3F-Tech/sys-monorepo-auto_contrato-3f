const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const contracts = await prisma.contracts.findMany({
    where: { 
      // Filtermos contratos recentes que tem document_id
      // document_id: { not: null } 
    },
    orderBy: { created_at: 'desc' },
    take: 10
  });
  console.log("LAST 10 CONTRACTS:");
  contracts.forEach(c => {
    console.log(`ID: ${c.id} | title: ${c.title.substring(0,30)} | signed: ${c.signed} | P1 amount: ${c.first_payment_amount} | Monthly: ${c.monthly_fee} | P1 Date: ${c.first_payment_date} | document_id: ${c.document_id} | change_status: ${c.change_status}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
