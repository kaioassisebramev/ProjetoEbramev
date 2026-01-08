'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commercialSchema, type CommercialFormData } from '@/lib/schemas/enrollment';
import { Enrollment } from '@prisma/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CommercialFormProps {
  data: Enrollment;
  readOnly?: boolean;
}

export default function CommercialForm({ data, readOnly = false }: CommercialFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CommercialFormData>({
    resolver: zodResolver(commercialSchema),
    defaultValues: {
      isDisabledPerson: data.isDisabledPerson ?? null,
      hasMobilityRestriction: data.hasMobilityRestriction ?? null,
      mobilityDetails: data.mobilityDetails ?? null,
      foodRestrictions: data.foodRestrictions ?? null,
      shirtSize: data.shirtSize ?? null,
      pantsSize: data.pantsSize ?? null,
      postSaleStatus: data.postSaleStatus ?? null,
      contractSignedStatus: data.contractSignedStatus ?? null,
      studentStatus: data.studentStatus ?? null,
      classStatus: data.classStatus ?? null,
      boletoEmissionStatus: data.boletoEmissionStatus ?? null,
      boletosGenerated: data.boletosGenerated ?? null,
      portalAccess: data.portalAccess ?? null,
    },
  });

  const hasMobilityRestriction = watch('hasMobilityRestriction');

  const onSubmit = async (formData: CommercialFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/enrollment/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Erro ao atualizar dados comerciais';
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
            Dados Comerciais
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
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isDisabledPerson')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Pessoa com Deficiência
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('hasMobilityRestriction')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Restrição de Mobilidade
            </label>
          </div>

          {/* Detalhes de Mobilidade - aparece condicionalmente */}
          {hasMobilityRestriction && (
            <div className="md:col-span-2 transition-all duration-300 ease-in-out">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detalhes da Restrição de Mobilidade *
              </label>
              <textarea
                {...register('mobilityDetails')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Descreva as restrições de mobilidade..."
              />
              {errors.mobilityDetails && (
                <p className="mt-1 text-sm text-red-600">{errors.mobilityDetails.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restrições Alimentares
            </label>
            <input
              type="text"
              {...register('foodRestrictions')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Vegetariano, Vegano, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamanho da Camiseta
            </label>
            <select
              {...register('shirtSize')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione...</option>
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
              <option value="GG">GG</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamanho da Calça
            </label>
            <input
              type="text"
              {...register('pantsSize')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: 38, 40, 42..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Pós-Venda
            </label>
            <select
              {...register('postSaleStatus')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione...</option>
              <option value="PENDENTE">Pendente</option>
              <option value="REALIZADO">Realizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status do Contrato
            </label>
            <select
              {...register('contractSignedStatus')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione...</option>
              <option value="ASSINADO">Assinado</option>
              <option value="PENDENTE">Pendente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status do Aluno
            </label>
            <select
              {...register('studentStatus')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione...</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="TRANCADO">Trancado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status da Turma
            </label>
            <select
              {...register('classStatus')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione...</option>
              <option value="MATRICULADO">Matriculado</option>
              <option value="AGUARDANDO">Aguardando</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status de Emissão de Boleto
            </label>
            <select
              {...register('boletoEmissionStatus')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione...</option>
              <option value="EMITIDO">Emitido</option>
              <option value="PENDENTE">Pendente</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('boletosGenerated')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Boletos Gerados
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('portalAccess')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Acesso ao Portal
            </label>
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
