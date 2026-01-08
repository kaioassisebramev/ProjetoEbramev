import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { LegalTable } from './components/LegalTable';

// Força o Next.js a buscar dados frescos do banco toda vez
export const dynamic = 'force-dynamic';

export default async function LegalPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Verifica se o usuário tem permissão (ADMIN ou LEGAL)
  const role = session.user.role?.toUpperCase() || '';
  if (role !== 'ADMIN' && role !== 'LEGAL') {
    redirect('/dashboard');
  }

  // Busca todos os alunos
  const enrollments = await prisma.enrollment.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Painel Jurídico</h1>
        <p className="text-gray-600 mt-2">
          Total de {enrollments.length} aluno(s) cadastrado(s)
        </p>
      </div>

      {/* Componente de Tabela com Busca */}
      <LegalTable enrollments={enrollments} />
    </div>
  );
}
