'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { legalSchema, type LegalFormData } from '@/lib/schemas/enrollment';
import { Enrollment } from '@prisma/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LegalFormProps {
  data: Enrollment;
  readOnly?: boolean;
}

export default function LegalForm({ data, readOnly = false }: LegalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LegalFormData>({
    resolver: zodResolver(legalSchema),
    defaultValues: {
      docRg: data.docRg ?? null,
      docCpf: data.docCpf ?? null,
      docDiploma: data.docDiploma ?? null,
      docHistory: data.docHistory ?? null,
      docBirthCert: data.docBirthCert ?? null,
      docAddressProof: data.docAddressProof ?? null,
      docCrmv: data.docCrmv ?? null,
      docProfilePic: data.docProfilePic ?? null,
      docMecCert: data.docMecCert ?? null,
      docFacultyIssuer: data.docFacultyIssuer ?? null,
      isTransfer: data.isTransfer ?? null,
      generalObservations: data.generalObservations ?? null,
    },
  });

  const isTransfer = watch('isTransfer');

  const onSubmit = async (formData: LegalFormData) => {
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
        const errorMessage = result.error || 'Erro ao atualizar dados jurídicos';
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

  const docStatusOptions = [
    { value: '', label: 'Selecione...' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'ENTREGUE', label: 'Entregue' },
    { value: 'APROVADO', label: 'Aprovado' },
    { value: 'REJEITADO', label: 'Rejeitado' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <fieldset disabled={readOnly} className="disabled:opacity-60">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Documentos Jurídicos
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
              RG
            </label>
            <select
              {...register('docRg')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <select
              {...register('docCpf')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diploma
            </label>
            <select
              {...register('docDiploma')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Histórico Escolar
            </label>
            <select
              {...register('docHistory')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certidão de Nascimento
            </label>
            <select
              {...register('docBirthCert')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comprovante de Endereço
            </label>
            <select
              {...register('docAddressProof')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CRMV
            </label>
            <select
              {...register('docCrmv')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto de Perfil
            </label>
            <select
              {...register('docProfilePic')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificado MEC
            </label>
            <select
              {...register('docMecCert')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emissor da Faculdade
            </label>
            <select
              {...register('docFacultyIssuer')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center">
            <input
              type="checkbox"
              {...register('isTransfer')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              É Transferência
            </label>
          </div>

          {/* Observações Gerais - aparece condicionalmente */}
          {isTransfer && (
            <div className="md:col-span-2 transition-all duration-300 ease-in-out">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações Gerais *
              </label>
              <textarea
                {...register('generalObservations')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Descreva as observações sobre a transferência..."
              />
              {errors.generalObservations && (
                <p className="mt-1 text-sm text-red-600">{errors.generalObservations.message}</p>
              )}
            </div>
          )}
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
