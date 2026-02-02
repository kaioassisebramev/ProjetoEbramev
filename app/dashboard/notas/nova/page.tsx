import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { NotaForm } from '@/app/dashboard/components/NotaForm';

export default async function NovaNotaPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nova Nota Fiscal</h1>
        <p className="text-gray-600 mt-2">Preencha os dados da nota fiscal</p>
      </div>

      <NotaForm mode="create" />
    </div>
  );
}
