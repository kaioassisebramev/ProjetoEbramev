import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/app/dashboard/components/StatusBadge';
import { ItemsManager } from '@/app/dashboard/components/ItemsManager';
import { FilesManager } from '@/app/dashboard/components/FilesManager';

interface PageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function DetalhesNotaPage({ params }: PageProps) {
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
    include: {
      itens: true,
      arquivos: true,
    },
  });

  if (!notaFiscal) {
    notFound();
  }

  // Calcula valor total
  const valorTotal = notaFiscal.itens.reduce(
    (sum, item) => sum + Number(item.valorTotal),
    0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Nota Fiscal #{notaFiscal.codigo}
          </h1>
          <p className="text-gray-600 mt-2">{notaFiscal.empresa}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/notas/${codigo}/editar`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Editar
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Voltar
          </Link>
        </div>
      </div>

      {/* Informações da Nota */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Informações da Nota</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Filial</p>
            <p className="text-lg font-medium text-gray-900">Filial {notaFiscal.filial}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">CNPJ</p>
            <p className="text-lg font-medium text-gray-900">{notaFiscal.cnpj}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data de Emissão</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(notaFiscal.dataEmissao).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data de Vencimento</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(notaFiscal.dataVencimento).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tipo de Recebimento</p>
            <p className="text-lg font-medium text-gray-900">{notaFiscal.recebimento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="mt-1">
              <StatusBadge nota={{ ...notaFiscal, valorTotal }} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Valor Total</p>
            <p className="text-2xl font-bold text-indigo-600">{formatCurrency(valorTotal)}</p>
          </div>
        </div>
      </div>

      {/* Itens */}
      <div className="mb-6">
        <ItemsManager notaFiscalId={codigo} initialItens={notaFiscal.itens} />
      </div>

      {/* Arquivos */}
      <FilesManager notaFiscalId={codigo} initialArquivos={notaFiscal.arquivos} />
    </div>
  );
}
