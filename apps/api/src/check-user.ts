import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'seller@3fventure.com.br';
  const password = 'Teste1@';
  
  console.log(`Checking user: ${email}`);
  
  try {
    const user = await prisma.sellers.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('User NOT found in database.');
      return;
    }
    
    console.log('User found:', { id: user.id.toString(), email: user.email, type: user.type });
    
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    console.log('Hashed input password:', hashedPassword);
    console.log('Stored password:', user.password);
    
    if (hashedPassword === user.password) {
      console.log('Password MATCHES!');
    } else {
      console.log('Password DOES NOT match.');
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
