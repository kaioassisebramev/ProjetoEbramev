'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Enrollment } from '@prisma/client';
import { getEnrollmentStatus } from '@/lib/enrollmentStatus';

interface DashboardTableProps {
  initialData: Enrollment[];
}

type StatusInfo = {
  status: 'complete' | 'partial' | 'empty';
  emoji: string;
  label: string;
};

/**
 * Calcula o score de severidade de um enrollment
 * Peso 3 para Vermelho, Peso 2 para Amarelo, Peso 1 para Verde
 * Retorna a soma dos pesos dos 3 setores
 */
function getSeverityScore(enrollment: Enrollment): number {
  // Sempre calcula os 3 status (independente do cargo)
  const statuses = getEnrollmentStatus(enrollment, 'ADMIN') as StatusInfo[];
  
  let score = 0;
  
  statuses.forEach((status) => {
    if (status.status === 'empty') {
      score += 3; // Vermelho = peso 3
    } else if (status.status === 'partial') {
      score += 2; // Amarelo = peso 2
    } else {
      score += 1; // Verde = peso 1
    }
  });
  
  return score;
}

export function DashboardTable({ initialData }: DashboardTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra e ordena os dados
  const filteredAndSortedData = useMemo(() => {
    // Filtra por nome
    let filtered = initialData;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = initialData.filter((enrollment) =>
        enrollment.studentName.toLowerCase().includes(term)
      );
    }

    // Ordena por score de severidade (maior primeiro)
    // Se o score for igual, ordena por data de criação (mais recente primeiro)
    return [...filtered].sort((a, b) => {
      const scoreA = getSeverityScore(a);
      const scoreB = getSeverityScore(b);
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Maior score primeiro
      }
      
      // Se os scores forem iguais, ordena por data de criação
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [initialData, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Barra de Pesquisa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar aluno por nome..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            {filteredAndSortedData.length} aluno(s) encontrado(s)
          </p>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Turma
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Data Venda
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
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
                        {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                      </h3>
                      <p className="text-gray-500">
                        {searchTerm
                          ? 'Tente buscar com outro termo'
                          : 'Comece criando seu primeiro aluno'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map((enrollment) => {
                  // Sempre mostra os 3 status (independente do cargo)
                  const statuses = getEnrollmentStatus(enrollment, 'ADMIN') as StatusInfo[];

                  return (
                    <tr
                      key={enrollment.id}
                      className="hover:bg-indigo-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/enrollment/${enrollment.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline transition-colors"
                        >
                          {enrollment.studentName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {enrollment.course}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {enrollment.classCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(enrollment.saleDate).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* Sempre mostra as 3 bolinhas */}
                          <span
                            title={`Financeiro: ${statuses[0].label}`}
                            className="text-2xl"
                          >
                            {statuses[0].emoji}
                          </span>
                          <span
                            title={`Comercial: ${statuses[1].label}`}
                            className="text-2xl"
                          >
                            {statuses[1].emoji}
                          </span>
                          <span
                            title={`Jurídico: ${statuses[2].label}`}
                            className="text-2xl"
                          >
                            {statuses[2].emoji}
                          </span>
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

      {/* Legenda */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Legenda:</h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-xl">🟢</span>
            <span>Completo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🟡</span>
            <span>Parcial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔴</span>
            <span>Vazio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              (Ordem: Financeiro | Comercial | Jurídico)
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500 italic">
              * Ordenação automática: alunos com mais pendências aparecem primeiro
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
