import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sellers = await prisma.sellers.findMany();
  console.log(JSON.stringify(sellers, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
