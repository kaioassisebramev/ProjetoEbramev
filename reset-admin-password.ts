import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔐 Resetando senha do administrador...\n');

    // Nova senha padrão
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Busca todos os usuários com role ADMIN
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
    });

    if (adminUsers.length === 0) {
      console.log('⚠️  Nenhum usuário admin encontrado!');
      console.log('   Criando novo usuário admin...\n');
      
      // Cria um novo admin
      const newAdmin = await prisma.user.create({
        data: {
          name: 'Administrador',
          username: 'admin@ebramev.com.br',
          password: hashedPassword,
          role: 'ADMIN',
          mustChangePassword: true,
          isActive: true,
        },
      });

      console.log('✅ Novo usuário admin criado!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 CREDENCIAIS DE ACESSO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Username: ${newAdmin.username}`);
      console.log(`   Senha: ${newPassword}`);
      console.log(`   Role: ${newAdmin.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
      return;
    }

    // Atualiza a senha de todos os admins encontrados
    for (const admin of adminUsers) {
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          password: hashedPassword,
          mustChangePassword: true, // Força troca de senha no próximo login
        },
      });

      console.log('✅ Senha resetada para o usuário:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 CREDENCIAIS DE ACESSO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Nome: ${admin.name}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Senha: ${newPassword}`);
      console.log(`   Role: ${admin.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');
    }

    console.log(`✅ Total de ${adminUsers.length} usuário(s) admin atualizado(s)!`);
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
