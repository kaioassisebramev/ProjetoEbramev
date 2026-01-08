import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Header } from './components/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Se não estiver autenticado, redireciona para login
  if (!session) {
    redirect('/auth/login');
  }

  // Se mustChangePassword for true, redireciona para troca de senha
  if (session.user.mustChangePassword) {
    redirect('/auth/change-password');
  }

  // Renderiza o layout com header horizontal
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={{
          name: session.user.name,
          role: session.user.role || 'ADMIN',
        }}
      />
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
