import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { NotaForm } from '@/app/dashboard/components/NotaForm';

interface PageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function EditarNotaPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const codigo = parseInt(params.id);

  if (isNaN(codigo)) {
    notFound();
  }

  // Busca nota fiscal
  const notaFiscal = await prisma.notaFiscal.findUnique({
    where: { codigo },
  });

  if (!notaFiscal) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Editar Nota Fiscal #{notaFiscal.codigo}
        </h1>
        <p className="text-gray-600 mt-2">{notaFiscal.empresa}</p>
      </div>

      <NotaForm nota={notaFiscal} mode="edit" />
    </div>
  );
}
