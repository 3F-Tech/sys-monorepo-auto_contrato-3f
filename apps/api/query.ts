import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const goals = await prisma.goals.findMany();
  console.dir(goals, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
