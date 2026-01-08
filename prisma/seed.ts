import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando banco de dados...');
  
  // Limpa o banco antes de popular
  await prisma.enrollment.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Banco de dados limpo com sucesso!');
  
  console.log('🌱 Populando banco de dados...');
  
  // Hash da senha 'admin' (simulado)
  // Em produção, use bcrypt.hashSync('admin', 10)
  const hashedPassword = await bcrypt.hash('admin', 10);
  
  // Cria o usuário Admin
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      mustChangePassword: true,
      isActive: true,
    },
  });
  
  console.log('✅ Usuário Admin criado com sucesso!');
  console.log('   Username: admin');
  console.log('   Password: admin');
  console.log('   Role: ADMIN');
  console.log('   ID:', adminUser.id);

  // Cria usuário Comercial para testes
  const commercialUser = await prisma.user.create({
    data: {
      name: 'Usuário Comercial',
      username: 'comercial',
      password: hashedPassword,
      role: 'COMMERCIAL',
      mustChangePassword: false,
      isActive: true,
    },
  });
  console.log('✅ Usuário Comercial criado!');

  // Cria 5 alunos com dados variados
  const now = new Date();
  
  // Aluno 1: Tudo completo (🟢 em todos os setores)
  await prisma.enrollment.create({
    data: {
      studentName: 'João Silva',
      course: 'Medicina Veterinária',
      classCode: 'TURMA-2024-01',
      hub: 'Polo São Paulo',
      saleDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
      fullValue: 50000.00,
      // Financeiro completo
      contractValue: 45000.00,
      commissionValue: 5000.00,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      installments: 12,
      installmentValue: 3750.00,
      discountValue: 5000.00,
      discountAuthorized: true,
      registrationFee: 1000.00,
      leadOrigin: 'SITE',
      // Comercial completo
      isDisabledPerson: false,
      hasMobilityRestriction: false,
      foodRestrictions: 'Vegetariano',
      shirtSize: 'M',
      pantsSize: '42',
      postSaleStatus: 'REALIZADO',
      contractSignedStatus: 'ASSINADO',
      studentStatus: 'ATIVO',
      classStatus: 'MATRICULADO',
      boletoEmissionStatus: 'EMITIDO',
      boletosGenerated: true,
      portalAccess: true,
      // Jurídico completo
      docRg: 'APROVADO',
      docCpf: 'APROVADO',
      docDiploma: 'APROVADO',
      docHistory: 'APROVADO',
      docBirthCert: 'APROVADO',
      docAddressProof: 'APROVADO',
      docCrmv: 'APROVADO',
      docProfilePic: 'APROVADO',
      docMecCert: 'APROVADO',
      docFacultyIssuer: 'APROVADO',
      isTransfer: false,
    },
  });

  // Aluno 2: Financeiro completo, Comercial parcial, Jurídico vazio
  await prisma.enrollment.create({
    data: {
      studentName: 'Maria Santos',
      course: 'Engenharia de Software',
      classCode: 'TURMA-2024-02',
      hub: 'Polo Rio de Janeiro',
      saleDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      fullValue: 35000.00,
      // Financeiro completo
      contractValue: 32000.00,
      commissionValue: 3000.00,
      dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      installments: 10,
      installmentValue: 3200.00,
      discountValue: 3000.00,
      discountAuthorized: true,
      registrationFee: 800.00,
      leadOrigin: 'EVENTOS',
      // Comercial parcial
      isDisabledPerson: false,
      hasMobilityRestriction: false,
      foodRestrictions: null,
      shirtSize: 'P',
      pantsSize: null,
      postSaleStatus: 'PENDENTE',
      contractSignedStatus: null,
      studentStatus: 'ATIVO',
      classStatus: null,
      boletoEmissionStatus: null,
      boletosGenerated: false,
      portalAccess: false,
      // Jurídico vazio
    },
  });

  // Aluno 3: Comercial completo, Financeiro parcial, Jurídico vazio
  await prisma.enrollment.create({
    data: {
      studentName: 'Pedro Oliveira',
      course: 'Direito',
      classCode: 'TURMA-2024-03',
      hub: 'Polo Belo Horizonte',
      saleDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      fullValue: 40000.00,
      // Financeiro parcial
      contractValue: 38000.00,
      commissionValue: null,
      dueDate: null,
      installments: 8,
      installmentValue: 4750.00,
      discountValue: 2000.00,
      discountAuthorized: false,
      registrationFee: null,
      leadOrigin: null,
      // Comercial completo
      isDisabledPerson: true,
      hasMobilityRestriction: true,
      mobilityDetails: 'Cadeira de rodas',
      foodRestrictions: 'Sem glúten',
      shirtSize: 'G',
      pantsSize: '44',
      postSaleStatus: 'REALIZADO',
      contractSignedStatus: 'ASSINADO',
      studentStatus: 'ATIVO',
      classStatus: 'MATRICULADO',
      boletoEmissionStatus: 'EMITIDO',
      boletosGenerated: true,
      portalAccess: true,
      // Jurídico vazio
    },
  });

  // Aluno 4: Jurídico completo, Financeiro vazio, Comercial parcial
  await prisma.enrollment.create({
    data: {
      studentName: 'Ana Costa',
      course: 'Psicologia',
      classCode: 'TURMA-2024-04',
      hub: 'Polo Curitiba',
      saleDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      fullValue: 30000.00,
      // Financeiro vazio
      // Comercial parcial
      isDisabledPerson: false,
      hasMobilityRestriction: false,
      foodRestrictions: 'Vegano',
      shirtSize: null,
      pantsSize: null,
      postSaleStatus: 'PENDENTE',
      contractSignedStatus: null,
      studentStatus: null,
      classStatus: null,
      boletoEmissionStatus: null,
      boletosGenerated: false,
      portalAccess: false,
      // Jurídico completo
      docRg: 'APROVADO',
      docCpf: 'APROVADO',
      docDiploma: 'APROVADO',
      docHistory: 'APROVADO',
      docBirthCert: 'APROVADO',
      docAddressProof: 'APROVADO',
      docCrmv: null,
      docProfilePic: 'APROVADO',
      docMecCert: 'APROVADO',
      docFacultyIssuer: 'APROVADO',
      isTransfer: false,
    },
  });

  // Aluno 5: Tudo vazio (🔴 em todos)
  await prisma.enrollment.create({
    data: {
      studentName: 'Carlos Mendes',
      course: 'Administração',
      classCode: 'TURMA-2024-05',
      hub: 'Polo Brasília',
      saleDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      fullValue: 25000.00,
      // Todos os campos opcionais vazios
    },
  });

  console.log('✅ 5 alunos criados com dados variados!');
  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
