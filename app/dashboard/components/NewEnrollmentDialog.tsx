'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

const newEnrollmentSchema = z.object({
  studentName: z.string().min(1, 'Nome do aluno é obrigatório'),
  course: z.string().min(1, 'Curso é obrigatório'),
  hub: z.string().min(1, 'Polo é obrigatório'),
  saleDate: z.string().min(1, 'Data de venda é obrigatória'),
});

type NewEnrollmentFormData = z.infer<typeof newEnrollmentSchema>;

export default function NewEnrollmentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewEnrollmentFormData>({
    resolver: zodResolver(newEnrollmentSchema),
  });

  const onSubmit = async (data: NewEnrollmentFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: data.studentName,
          course: data.course,
          hub: data.hub,
          saleDate: data.saleDate, // Envia como string (formato ISO do input date)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Erro ao criar matrícula';
        setError(errorMessage);
        toast.error(`Erro ao criar aluno ❌\n${errorMessage}`);
        return;
      }

      // Sucesso - fecha o modal, limpa o form e recarrega a página
      setIsOpen(false);
      reset();
      
      // Toast de sucesso
      toast.success('Aluno criado com sucesso! ✅');
      
      // Força refresh da página para mostrar o novo aluno
      // router.refresh() atualiza os dados do Server Component
      router.refresh();
    } catch (err) {
      const errorMessage = 'Erro ao criar matrícula. Tente novamente.';
      setError(errorMessage);
      toast.error('Erro ao criar aluno ❌');
      console.error(err);
    } finally {
      setLoading(false); // OBRIGATÓRIO: Desliga o spinner sempre
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        + Nova Matrícula
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Nova Matrícula
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Aluno *
                  </label>
                  <input
                    type="text"
                    {...register('studentName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Digite o nome do aluno"
                  />
                  {errors.studentName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.studentName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curso *
                  </label>
                  <input
                    type="text"
                    {...register('course')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Medicina Veterinária"
                  />
                  {errors.course && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.course.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Polo *
                  </label>
                  <input
                    type="text"
                    {...register('hub')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Polo São Paulo"
                  />
                  {errors.hub && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.hub.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Venda *
                  </label>
                  <input
                    type="date"
                    {...register('saleDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.saleDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.saleDate.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      reset();
                    }}
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
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
