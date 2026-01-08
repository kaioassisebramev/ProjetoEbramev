'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { UserForm } from './UserForm';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date | string;
}

interface UserListProps {
  users: User[];
}

const roleBadgeVariant = (role: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  const normalizedRole = role.toUpperCase();
  if (normalizedRole === 'ADMIN') return 'error';
  if (normalizedRole === 'FINANCIAL') return 'info';
  if (normalizedRole === 'COMMERCIAL') return 'success';
  if (normalizedRole === 'LEGAL') return 'warning';
  return 'default';
};

const roleLabel = (role: string): string => {
  const normalizedRole = role.toUpperCase();
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    FINANCIAL: 'Financeiro',
    COMMERCIAL: 'Comercial',
    LEGAL: 'Jurídico',
    ADMINISTRATIVE: 'Administrativo',
  };
  return labels[normalizedRole] || normalizedRole;
};

export function UserList({ users }: UserListProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Botão Novo Usuário */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
        >
          {showForm ? '✕ Cancelar' : '+ Novo Usuário'}
        </button>
      </div>

      {/* Formulário de Criação */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Criar Novo Usuário</h2>
          <UserForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Tabela de Usuários */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Data de Criação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.length === 0 ? (
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum usuário cadastrado
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Comece criando seu primeiro usuário
                      </p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                      >
                        Criar Primeiro Usuário
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={roleBadgeVariant(user.role)}>
                        {roleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Badge variant={user.isActive ? 'success' : 'error'}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {user.mustChangePassword && (
                          <Badge variant="warning">Trocar Senha</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(user.createdAt as string).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
