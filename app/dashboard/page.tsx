import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NotasTable } from './components/NotasTable';
import { NotaFiscal, ItemNota, Arquivo } from '@prisma/client';

export const dynamic = 'force-dynamic';

type NotaFiscalCompleta = NotaFiscal & {
  itens: ItemNota[];
  arquivos: Arquivo[];
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Busca todas as notas fiscais
  const notas = await prisma.notaFiscal.findMany({
    include: {
      itens: true,
      arquivos: true,
    },
    orderBy: {
      dataEmissao: 'desc',
    },
    take: 50, // Limita a 50 para performance
  });

  // Calcula valor total de cada nota
  const notasComTotal: (NotaFiscalCompleta & { valorTotal: number })[] = notas.map((nota) => {
    const valorTotal = nota.itens.reduce(
      (sum, item) => sum + Number(item.valorTotal),
      0
    );
    return {
      ...nota,
      valorTotal,
    };
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notas Fiscais</h1>
          <p className="text-gray-600 mt-2">
            Total de {notasComTotal.length} nota(s) cadastrada(s)
          </p>
        </div>
        <Link
          href="/dashboard/notas/nova"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          + Nova Nota
        </Link>
      </div>

      <NotasTable notas={notasComTotal} />
    </div>
  );
}
