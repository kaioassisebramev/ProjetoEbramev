import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NotasTable } from './components/NotasTable';
import { FiltrosNotas } from './components/FiltrosNotas';
import { ExportExcelButton } from './components/ExportExcelButton';
import { NotaFiscal, ItemNota, Arquivo } from '@prisma/client';

export const dynamic = 'force-dynamic';

type NotaFiscalCompleta = NotaFiscal & {
  itens: ItemNota[];
  arquivos: Arquivo[];
};

interface PageProps {
  searchParams: {
    ano?: string;
    mes?: string;
    filial?: string;
    pago?: string;
    recebimento?: string;
    busca?: string;
  };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Monta condições de filtro
  const where: any = {};

  if (searchParams.ano || searchParams.mes) {
    where.dataEmissao = {};
    if (searchParams.ano) {
      const ano = parseInt(searchParams.ano);
      where.dataEmissao.gte = new Date(`${ano}-01-01`);
      where.dataEmissao.lt = new Date(`${ano + 1}-01-01`);
    }
    if (searchParams.mes && searchParams.ano) {
      const ano = parseInt(searchParams.ano);
      const mes = parseInt(searchParams.mes);
      const mesStr = mes.toString().padStart(2, '0');
      where.dataEmissao.gte = new Date(`${ano}-${mesStr}-01`);
      const proximoMes = mes === 12 ? 1 : mes + 1;
      const proximoAno = mes === 12 ? ano + 1 : ano;
      const proximoMesStr = proximoMes.toString().padStart(2, '0');
      where.dataEmissao.lt = new Date(`${proximoAno}-${proximoMesStr}-01`);
    }
  }

  if (searchParams.filial) {
    where.filial = parseInt(searchParams.filial);
  }

  if (searchParams.pago !== undefined) {
    where.pago = searchParams.pago === 'true';
  }

  if (searchParams.recebimento) {
    where.recebimento = searchParams.recebimento;
  }

  // Busca notas fiscais com filtros
  const notas = await prisma.notaFiscal.findMany({
    where,
    include: {
      itens: true,
      arquivos: true,
    },
    orderBy: {
      dataEmissao: 'desc',
    },
    take: 100, // Aumentado para 100
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
            Total de {notasComTotal.length} nota(s) encontrada(s)
          </p>
        </div>
        <div className="flex gap-2">
          <ExportExcelButton />
          <Link
            href="/dashboard/notas/nova"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            + Nova Nota
          </Link>
        </div>
      </div>

      <FiltrosNotas />

      <NotasTable notas={notasComTotal} busca={searchParams.busca} />
    </div>
  );
}
