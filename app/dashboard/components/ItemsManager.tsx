'use client';

import { useState, useEffect } from 'react';
import { ItemNota, UnidadeMedida } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemNotaSchema, type ItemNotaFormData } from '@/lib/schemas/notaFiscal';
import toast from 'react-hot-toast';

interface ItemsManagerProps {
  notaFiscalId: number;
  initialItens: ItemNota[];
}

export function ItemsManager({ notaFiscalId, initialItens }: ItemsManagerProps) {
  const [itens, setItens] = useState<ItemNota[]>(initialItens);
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemNotaFormData>({
    resolver: zodResolver(itemNotaSchema),
  });

  // Busca unidades de medida
  useEffect(() => {
    fetch('/api/unidades-medida')
      .then((res) => res.json())
      .then((data) => setUnidades(data.unidades || []))
      .catch(console.error);
  }, []);

  // Atualiza itens quando initialItens mudar
  useEffect(() => {
    setItens(initialItens);
  }, [initialItens]);

  const onSubmit = async (data: ItemNotaFormData) => {
    setLoading(true);

    try {
      const url = editingId
        ? `/api/itens/${editingId}`
        : `/api/notas/${notaFiscalId}/itens`;
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar item');
      }

      toast.success(editingId ? 'Item atualizado! ✅' : 'Item adicionado! ✅');

      // Recarrega a página para atualizar os itens
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar item ❌');
    } finally {
      setLoading(false);
      setEditingId(null);
      reset();
    }
  };

  const handleEdit = (item: ItemNota) => {
    setEditingId(item.id);
    reset({
      descricao: item.descricao,
      unidadeMedida: item.unidadeMedida,
      quantidade: Number(item.quantidade),
      valorUnitario: Number(item.valorUnitario),
      ncm: item.ncm || undefined,
      icms: item.icms || undefined,
      categoria: item.categoria || undefined,
    });
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }

    setDeletingId(itemId);

    try {
      const response = await fetch(`/api/itens/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir item');
      }

      toast.success('Item excluído! ✅');
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir item ❌');
    } finally {
      setDeletingId(null);
    }
  };

  const totalGeral = itens.reduce((sum, item) => sum + Number(item.valorTotal), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Itens da Nota</h2>

      {/* Formulário de Item */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              {...register('descricao')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade *
            </label>
            <select
              {...register('unidadeMedida')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione...</option>
              {unidades.map((un) => (
                <option key={un.id} value={un.sigla}>
                  {un.sigla} - {un.descricao}
                </option>
              ))}
            </select>
            {errors.unidadeMedida && (
              <p className="mt-1 text-sm text-red-600">{errors.unidadeMedida.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('quantidade', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.quantidade && (
              <p className="mt-1 text-sm text-red-600">{errors.quantidade.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Unitário *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('valorUnitario', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.valorUnitario && (
              <p className="mt-1 text-sm text-red-600">{errors.valorUnitario.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NCM</label>
            <input
              type="text"
              {...register('ncm')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ICMS</label>
            <input
              type="text"
              {...register('icms')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              type="text"
              {...register('categoria')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading
                ? 'Salvando...'
                : editingId
                ? 'Atualizar Item'
                : 'Adicionar Item'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  reset();
                }}
                className="ml-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Tabela de Itens */}
      {itens.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhum item adicionado ainda</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor Unitário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.descricao}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.unidadeMedida}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {Number(item.quantidade).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatCurrency(Number(item.valorUnitario))}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(Number(item.valorTotal))}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deletingId === item.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                    Total Geral:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {formatCurrency(totalGeral)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
