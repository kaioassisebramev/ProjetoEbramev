import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Se estiver autenticado, redireciona para o dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Se não estiver autenticado, redireciona para o login
  redirect('/auth/login');
}
