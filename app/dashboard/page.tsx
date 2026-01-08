import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import NewEnrollmentDialog from './components/NewEnrollmentDialog';
import { DashboardTable } from './components/DashboardTable';

// Força o Next.js a buscar dados frescos do banco toda vez
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Busca todos os alunos (sem ordenação, pois será feita no cliente)
  const enrollments = await prisma.enrollment.findMany();

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-gray-600 mt-2">
            Total de {enrollments.length} aluno(s) cadastrado(s)
          </p>
        </div>
        <NewEnrollmentDialog />
      </div>

      {/* Componente de Tabela com Busca e Ordenação */}
      <DashboardTable initialData={enrollments} />
    </div>
  );
}
