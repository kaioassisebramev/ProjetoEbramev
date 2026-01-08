import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { EnrollmentTabs } from './components/EnrollmentTabs';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EnrollmentEditPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Busca o enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: params.id },
  });

  if (!enrollment) {
    notFound();
  }

  const role = session.user.role;

  // Renderiza o wrapper Client Component com os dados
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Editar Aluno - {enrollment.studentName}
        </h1>
        <p className="text-gray-600 mt-2">
          {enrollment.course} - {enrollment.classCode}
        </p>
      </div>
      <EnrollmentTabs data={enrollment} role={role} />
    </div>
  );
}
