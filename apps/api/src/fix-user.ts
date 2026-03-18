import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function fixUser() {
  const email = 'seller@3fventure.com.br';
  const newPassword = 'Teste1@';
  const hashedPassword = crypto.createHash('md5').update(newPassword).digest('hex');
  
  console.log(`Updating password for: ${email}`);
  
  try {
    const updatedUser = await prisma.sellers.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log('User updated successfully:', { id: updatedUser.id.toString(), email: updatedUser.email });
    console.log('New hashed password:', updatedUser.password);
    
  } catch (error) {
    console.error('Update error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser();
