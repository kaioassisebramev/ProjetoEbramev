'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function FiltrosNotasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtros, setFiltros] = useState({
    ano: searchParams.get('ano') || '',
    mes: searchParams.get('mes') || '',
    filial: searchParams.get('filial') || '',
    pago: searchParams.get('pago') || '',
    recebimento: searchParams.get('recebimento') || '',
    busca: searchParams.get('busca') || '',
  });

  const aplicarFiltros = () => {
    const params = new URLSearchParams();
    
    if (filtros.ano) params.set('ano', filtros.ano);
    if (filtros.mes) params.set('mes', filtros.mes);
    if (filtros.filial) params.set('filial', filtros.filial);
    if (filtros.pago) params.set('pago', filtros.pago);
    if (filtros.recebimento) params.set('recebimento', filtros.recebimento);
    if (filtros.busca) params.set('busca', filtros.busca);

    router.push(`/dashboard?${params.toString()}`);
  };

  const limparFiltros = () => {
    setFiltros({
      ano: '',
      mes: '',
      filial: '',
      pago: '',
      recebimento: '',
      busca: '',
    });
    router.push('/dashboard');
  };

  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 5 }, (_, i) => anoAtual - i);

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Busca */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar (Empresa/CNPJ)
          </label>
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            placeholder="Digite para buscar..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
          />
        </div>

        {/* Ano */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <select
            value={filtros.ano}
            onChange={(e) => setFiltros({ ...filtros, ano: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            {anos.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>

        {/* Mês */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
          <select
            value={filtros.mes}
            onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            {[
              { value: '1', label: 'Janeiro' },
              { value: '2', label: 'Fevereiro' },
              { value: '3', label: 'Março' },
              { value: '4', label: 'Abril' },
              { value: '5', label: 'Maio' },
              { value: '6', label: 'Junho' },
              { value: '7', label: 'Julho' },
              { value: '8', label: 'Agosto' },
              { value: '9', label: 'Setembro' },
              { value: '10', label: 'Outubro' },
              { value: '11', label: 'Novembro' },
              { value: '12', label: 'Dezembro' },
            ].map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filial</label>
          <select
            value={filtros.filial}
            onChange={(e) => setFiltros({ ...filtros, filial: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas</option>
            <option value="1">Filial 1</option>
            <option value="2">Filial 2</option>
          </select>
        </div>

        {/* Status Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filtros.pago}
            onChange={(e) => setFiltros({ ...filtros, pago: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            <option value="true">Pago</option>
            <option value="false">Não Pago</option>
          </select>
        </div>
      </div>

      {/* Tipo Recebimento */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo Recebimento
          </label>
          <select
            value={filtros.recebimento}
            onChange={(e) => setFiltros({ ...filtros, recebimento: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            <option value="FISICO">Físico</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>

        <div className="md:col-span-5 flex items-end gap-2">
          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={limparFiltros}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}

export function FiltrosNotas() {
  return (
    <Suspense fallback={<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6">Carregando filtros...</div>}>
      <FiltrosNotasContent />
    </Suspense>
  );
}
