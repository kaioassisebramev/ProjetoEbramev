'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notaFiscalSchema, type NotaFiscalFormData } from '@/lib/schemas/notaFiscal';
import { NotaFiscal } from '@prisma/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface NotaFormProps {
  nota?: NotaFiscal;
  mode: 'create' | 'edit';
}

export function NotaForm({ nota, mode }: NotaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NotaFiscalFormData>({
    resolver: zodResolver(notaFiscalSchema),
    defaultValues: nota
      ? {
          filial: nota.filial,
          empresa: nota.empresa,
          cnpj: nota.cnpj,
          dataEmissao: new Date(nota.dataEmissao).toISOString().split('T')[0],
          dataVencimento: new Date(nota.dataVencimento).toISOString().split('T')[0],
          recebimento: nota.recebimento,
          pago: nota.pago,
        }
      : {
          filial: 1,
          pago: false,
        },
  });

  const onSubmit = async (data: NotaFiscalFormData) => {
    setLoading(true);

    try {
      const url = mode === 'create' ? '/api/notas' : `/api/notas/${nota?.codigo}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar nota');
      }

      toast.success(
        mode === 'create' ? 'Nota fiscal criada com sucesso! ✅' : 'Nota fiscal atualizada com sucesso! ✅'
      );

      if (mode === 'create') {
        router.push(`/dashboard/notas/${result.notaFiscal.codigo}`);
      } else {
        router.push(`/dashboard/notas/${nota?.codigo}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar nota fiscal ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {mode === 'create' ? 'Nova Nota Fiscal' : 'Editar Nota Fiscal'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filial *
            </label>
            <select
              {...register('filial', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>Filial 1</option>
              <option value={2}>Filial 2</option>
            </select>
            {errors.filial && (
              <p className="mt-1 text-sm text-red-600">{errors.filial.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa *
            </label>
            <input
              type="text"
              {...register('empresa')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.empresa && (
              <p className="mt-1 text-sm text-red-600">{errors.empresa.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ *
            </label>
            <input
              type="text"
              {...register('cnpj')}
              placeholder="00.000.000/0000-00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.cnpj && (
              <p className="mt-1 text-sm text-red-600">{errors.cnpj.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Emissão *
            </label>
            <input
              type="date"
              {...register('dataEmissao')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.dataEmissao && (
              <p className="mt-1 text-sm text-red-600">{errors.dataEmissao.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Vencimento *
            </label>
            <input
              type="date"
              {...register('dataVencimento')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.dataVencimento && (
              <p className="mt-1 text-sm text-red-600">{errors.dataVencimento.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Recebimento *
            </label>
            <select
              {...register('recebimento')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="FISICO">Físico</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
            {errors.recebimento && (
              <p className="mt-1 text-sm text-red-600">{errors.recebimento.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('pago')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Nota já foi paga</label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : mode === 'create' ? 'Criar Nota' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </form>
  );
}
