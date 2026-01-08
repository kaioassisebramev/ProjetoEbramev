import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { UserList } from './components/UserList';

// Força o Next.js a buscar dados frescos do banco toda vez
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Verifica se o usuário é ADMIN
  const role = session.user.role?.toUpperCase() || '';
  if (role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Busca todos os usuários
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-2">
            Total de {users.length} usuário(s) cadastrado(s)
          </p>
        </div>
      </div>

      {/* Componente de Listagem */}
      <UserList users={users} />
    </div>
  );
}
