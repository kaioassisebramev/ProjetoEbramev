import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔐 Criando usuário admin...');

    // Hash da senha
    const hashedPassword = await bcrypt.hash('123', 10);

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin@ebramev.com.br' },
    });

    if (existingUser) {
      console.log('⚠️  Usuário admin@ebramev.com.br já existe!');
      console.log('   ID:', existingUser.id);
      console.log('   Nome:', existingUser.name);
      console.log('   Role:', existingUser.role);
      return;
    }

    // Cria o usuário admin
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin Ebramev',
        username: 'admin@ebramev.com.br',
        password: hashedPassword,
        role: 'ADMIN',
        mustChangePassword: true,
        isActive: true,
      },
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('   ID:', adminUser.id);
    console.log('   Nome:', adminUser.name);
    console.log('   Username:', adminUser.username);
    console.log('   Role:', adminUser.role);
    console.log('   Senha: 123');
    console.log('   ⚠️  Lembre-se de alterar a senha no primeiro login!');
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
