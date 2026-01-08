'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Enrollment } from '@prisma/client';
import { getEnrollmentStatus } from '@/lib/enrollmentStatus';
import { getMissingFields } from '@/lib/enrollmentValidation';

interface LegalTableProps {
  enrollments: Enrollment[];
}

export function LegalTable({ enrollments }: LegalTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEnrollments = useMemo(() => {
    if (!searchTerm.trim()) {
      return enrollments;
    }

    const term = searchTerm.toLowerCase().trim();
    return enrollments.filter((enrollment) =>
      enrollment.studentName.toLowerCase().includes(term)
    );
  }, [enrollments, searchTerm]);

  // Helper para verificar se contrato foi assinado
  const isContractSigned = (enrollment: Enrollment) => {
    return (
      enrollment.contractSignedStatus === 'ASSINADO' ||
      enrollment.contractSignedStatus === 'REALIZADO'
    );
  };

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
            placeholder="🔍 Buscar aluno no setor Jurídico..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            {filteredEnrollments.length} aluno(s) encontrado(s)
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
                  Contrato Assinado?
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pendências
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
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
                filteredEnrollments.map((enrollment) => {
                  const statusInfo = getEnrollmentStatus(enrollment, 'LEGAL');
                  const status = Array.isArray(statusInfo) ? statusInfo[2] : statusInfo;
                  const missingFields = getMissingFields(enrollment, 'LEGAL');

                  return (
                    <tr
                      key={enrollment.id}
                      className="hover:bg-indigo-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/enrollment/${enrollment.id}?tab=legal`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline transition-colors"
                        >
                          {enrollment.studentName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {isContractSigned(enrollment) ? (
                            <span className="text-green-600 font-medium">✓ Sim</span>
                          ) : (
                            <span className="text-red-600 font-medium">✗ Não</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl" title={status.label}>
                          {status.emoji}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {status.status === 'complete' ? (
                          <span className="text-sm text-green-600 font-medium">Ok ✅</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-sm text-red-600 font-medium">Pendências:</span>
                            <span className="text-xs text-gray-600 mt-1">
                              {missingFields.join(', ')}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
