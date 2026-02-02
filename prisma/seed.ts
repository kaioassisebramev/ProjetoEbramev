import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin padrão
  const hashedPassword = await bcrypt.hash('Ebramev2026***', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'EBRAMEVADM' },
    update: {},
    create: {
      name: 'Administrador EBRAMEV',
      username: 'EBRAMEVADM',
      password: hashedPassword,
      role: 'ADMIN',
      mustChangePassword: true,
      isActive: true,
    },
  });

  console.log('✅ Usuário admin criado:', adminUser.username);

  // Criar unidades de medida padrão
  const unidades = [
    { sigla: 'UN', descricao: 'Unidade' },
    { sigla: 'KG', descricao: 'Quilograma' },
    { sigla: 'LT', descricao: 'Litro' },
    { sigla: 'MT', descricao: 'Metro' },
    { sigla: 'CX', descricao: 'Caixa' },
    { sigla: 'PC', descricao: 'Peça' },
    { sigla: 'DZ', descricao: 'Dúzia' },
    { sigla: 'M2', descricao: 'Metro Quadrado' },
    { sigla: 'M3', descricao: 'Metro Cúbico' },
    { sigla: 'HR', descricao: 'Hora' },
  ];

  for (const un of unidades) {
    await prisma.unidadeMedida.upsert({
      where: { sigla: un.sigla },
      update: {},
      create: un,
    });
  }

  console.log(`✅ ${unidades.length} unidades de medida criadas`);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Credenciais de acesso:');
  console.log('   Username: EBRAMEVADM');
  console.log('   Password: Ebramev2026***');
  console.log('   ⚠️  Lembre-se de alterar a senha no primeiro login!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
