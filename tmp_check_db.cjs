const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkContract() {
    try {
        const contract = await prisma.contracts.findFirst({
            where: {
                title: { contains: 'TESTE WEBHOOK 1' }
            }
        });
        
        if (contract) {
            console.log('CONTRATO ENCONTRADO:');
            console.log(JSON.stringify(contract, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value, 2));
        } else {
            console.log('CONTRATO NÃO ENCONTRADO.');
        }
    } catch (error) {
        console.error('ERRO AO BUSCAR CONTRATO:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkContract();
