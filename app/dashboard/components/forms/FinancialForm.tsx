'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { financialSchema, type FinancialFormData } from '@/lib/schemas/enrollment';
import { Enrollment } from '@prisma/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface FinancialFormProps {
  data: Enrollment;
  readOnly?: boolean;
}

export default function FinancialForm({ data, readOnly = false }: FinancialFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FinancialFormData>({
    resolver: zodResolver(financialSchema),
    defaultValues: {
      contractValue: data.contractValue ?? null,
      commissionValue: data.commissionValue ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : undefined,
      installments: data.installments ?? null,
      installmentValue: data.installmentValue ?? null,
      discountValue: data.discountValue ?? null,
      discountAuthorized: data.discountAuthorized ?? null,
      registrationFee: data.registrationFee ?? null,
      leadOrigin: data.leadOrigin ?? null,
    },
  });

  const contractValue = watch('contractValue');

  // useEffect para calcular commissionValue automaticamente (10% do contractValue)
  useEffect(() => {
    if (contractValue && contractValue > 0) {
      const commission = contractValue * 0.1;
      setValue('commissionValue', Number(commission.toFixed(2)));
    }
  }, [contractValue, setValue]);

  const onSubmit = async (formData: FinancialFormData) => {
    setLoading(true);
    setError('');

    try {
      // Converte date string para Date object se necessário
      const payload: any = { ...formData };
      if (payload.dueDate) {
        payload.dueDate = new Date(payload.dueDate);
      }

      const response = await fetch(`/api/enrollment/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Erro ao atualizar dados financeiros';
        setError(errorMessage);
        toast.error(`Erro ao salvar os dados ❌\n${errorMessage}`);
        return;
      }

      // Sucesso visual
      toast.success('Dados salvos com sucesso! ✅');
      router.refresh(); // Atualiza os dados na tela
    } catch (err) {
      const errorMessage = 'Erro ao salvar. Tente novamente.';
      setError(errorMessage);
      toast.error('Erro ao salvar os dados ❌');
      console.error(err);
    } finally {
      setLoading(false); // OBRIGATÓRIO: Desliga o spinner sempre
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <fieldset disabled={readOnly} className="disabled:opacity-60">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Dados Financeiros
            {readOnly && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Somente leitura)
              </span>
            )}
          </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Contrato
            </label>
            <input
              type="number"
              step="0.01"
              {...register('contractValue', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.contractValue && (
              <p className="mt-1 text-sm text-red-600">{errors.contractValue.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Comissão (10% automático)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('commissionValue', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              readOnly
            />
            {errors.commissionValue && (
              <p className="mt-1 text-sm text-red-600">{errors.commissionValue.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Vencimento
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Parcelas
            </label>
            <input
              type="number"
              {...register('installments', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.installments && (
              <p className="mt-1 text-sm text-red-600">{errors.installments.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Parcela
            </label>
            <input
              type="number"
              step="0.01"
              {...register('installmentValue', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.installmentValue && (
              <p className="mt-1 text-sm text-red-600">{errors.installmentValue.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Desconto
            </label>
            <input
              type="number"
              step="0.01"
              {...register('discountValue', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.discountValue && (
              <p className="mt-1 text-sm text-red-600">{errors.discountValue.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('discountAuthorized')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Desconto Autorizado
            </label>
            {errors.discountAuthorized && (
              <p className="mt-1 text-sm text-red-600">{errors.discountAuthorized.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taxa de Matrícula
            </label>
            <input
              type="number"
              step="0.01"
              {...register('registrationFee', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.registrationFee && (
              <p className="mt-1 text-sm text-red-600">{errors.registrationFee.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origem do Lead
            </label>
            <select
              {...register('leadOrigin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione...</option>
              <option value="SITE">Site</option>
              <option value="EVENTOS">Eventos</option>
              <option value="INDICACAO">Indicação</option>
              <option value="REDES_SOCIAIS">Redes Sociais</option>
              <option value="OUTROS">Outros</option>
            </select>
            {errors.leadOrigin && (
              <p className="mt-1 text-sm text-red-600">{errors.leadOrigin.message}</p>
            )}
          </div>
        </div>

        {!readOnly && (
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
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>
      </fieldset>
    </form>
  );
}
