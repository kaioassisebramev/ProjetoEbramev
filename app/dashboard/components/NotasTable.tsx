'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NotaFiscal, ItemNota, Arquivo } from '@prisma/client';
import { StatusBadge } from './StatusBadge';
import toast from 'react-hot-toast';

type NotaFiscalCompleta = NotaFiscal & {
  itens: ItemNota[];
  arquivos: Arquivo[];
  valorTotal?: number;
};

interface NotasTableProps {
  notas: NotaFiscalCompleta[];
  busca?: string;
}

type SortField = 'codigo' | 'filial' | 'empresa' | 'dataEmissao' | 'dataVencimento' | 'valorTotal';
type SortDirection = 'asc' | 'desc';

export function NotasTable({ notas, busca = '' }: NotasTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('dataEmissao');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filtra e ordena notas
  const notasFiltradas = useMemo(() => {
    let filtered = notas;

    // Filtra por busca
    if (busca.trim()) {
      const termo = busca.toLowerCase().trim();
      filtered = notas.filter(
        (nota) =>
          nota.empresa.toLowerCase().includes(termo) ||
          nota.cnpj.toLowerCase().includes(termo) ||
          nota.codigo.toString().includes(termo)
      );
    }

    // Ordena
    filtered = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'codigo':
          aValue = a.codigo;
          bValue = b.codigo;
          break;
        case 'filial':
          aValue = a.filial;
          bValue = b.filial;
          break;
        case 'empresa':
          aValue = a.empresa.toLowerCase();
          bValue = b.empresa.toLowerCase();
          break;
        case 'dataEmissao':
          aValue = new Date(a.dataEmissao).getTime();
          bValue = new Date(b.dataEmissao).getTime();
          break;
        case 'dataVencimento':
          aValue = new Date(a.dataVencimento).getTime();
          bValue = new Date(b.dataVencimento).getTime();
          break;
        case 'valorTotal':
          aValue = a.valorTotal || a.itens.reduce((sum, item) => sum + Number(item.valorTotal), 0);
          bValue = b.valorTotal || b.itens.reduce((sum, item) => sum + Number(item.valorTotal), 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [notas, busca, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Alterna direção se já está ordenando por este campo
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Define novo campo e começa com ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (codigo: number) => {
    if (!confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      return;
    }

    setDeletingId(codigo);

    try {
      const response = await fetch(`/api/notas/${codigo}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir nota');
      }

      toast.success('Nota fiscal excluída com sucesso!');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir nota fiscal');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formata data sem problemas de timezone
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    // Usa UTC para evitar problemas de timezone
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('codigo')}
              >
                <div className="flex items-center gap-1">
                  Código
                  {sortField === 'codigo' && (
                    <span className="text-indigo-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('filial')}
              >
                <div className="flex items-center gap-1">
                  Filial
                  {sortField === 'filial' && (
                    <span className="text-indigo-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('empresa')}
              >
                <div className="flex items-center gap-1">
                  Empresa
                  {sortField === 'empresa' && (
                    <span className="text-indigo-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('dataEmissao')}
              >
                <div className="flex items-center gap-1">
                  Data Emissão
                  {sortField === 'dataEmissao' && (
                    <span className="text-indigo-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('dataVencimento')}
              >
                <div className="flex items-center gap-1">
                  Vencimento
                  {sortField === 'dataVencimento' && (
                    <span className="text-indigo-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('valorTotal')}
              >
                <div className="flex items-center gap-1">
                  Valor Total
                  {sortField === 'valorTotal' && (
                    <span className="text-indigo-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {notasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma nota fiscal encontrada
                    </h3>
                    <p className="text-gray-500">Comece criando sua primeira nota fiscal</p>
                  </div>
                </td>
              </tr>
            ) : (
              notasFiltradas.map((nota) => {
                const valorTotal =
                  nota.valorTotal ||
                  nota.itens.reduce((sum, item) => sum + Number(item.valorTotal), 0);

                return (
                  <tr
                    key={nota.codigo}
                    className="hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{nota.codigo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Filial {nota.filial}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{nota.empresa}</div>
                      <div className="text-sm text-gray-500">{nota.cnpj}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(nota.dataEmissao)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(nota.dataVencimento)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(valorTotal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge nota={nota} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/notas/${nota.codigo}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/dashboard/notas/${nota.codigo}/editar`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(nota.codigo)}
                          disabled={deletingId === nota.codigo}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Excluir nota fiscal"
                        >
                          {deletingId === nota.codigo ? (
                            <span className="flex items-center gap-1">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Excluindo...
                            </span>
                          ) : (
                            'Excluir'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
