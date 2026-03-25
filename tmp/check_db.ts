import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'seller@3fventure.com.br';
  const seller = await prisma.sellers.findUnique({
    where: { email },
    include: {
      seller_business: {
        include: {
          business: true
        }
      }
    }
  });

  if (!seller) {
    console.log('Seller not found');
    return;
  }

  console.log('Seller:', JSON.stringify(seller, (any, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
