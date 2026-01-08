'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Enrollment } from '@prisma/client';
import FinancialForm from '@/app/dashboard/components/forms/FinancialForm';
import CommercialForm from '@/app/dashboard/components/forms/CommercialForm';
import LegalForm from '@/app/dashboard/components/forms/LegalForm';

export function EnrollmentTabs({ data, role }: { data: Enrollment; role: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Pega a aba da URL ou usa a lógica padrão da role
  const tabFromUrl = searchParams.get('tab');
  
  const getInitialTab = () => {
    if (tabFromUrl && ['financial', 'commercial', 'legal'].includes(tabFromUrl)) {
      return tabFromUrl;
    }
    // Normaliza role para maiúsculo
    const safeRole = role?.toUpperCase() || 'FINANCIAL';
    if (safeRole === 'COMMERCIAL') return 'commercial';
    if (safeRole === 'LEGAL') return 'legal';
    return 'financial';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Sincroniza com mudanças na URL (quando usuário navega com botão voltar/avançar)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['financial', 'commercial', 'legal'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Atualiza a URL quando muda a aba
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Atualiza a URL sem recarregar a página (Shallow Routing)
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Helper de estilo
  const getTabStyle = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
      isActive 
        ? 'border-blue-600 text-blue-600 bg-blue-50' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;
  };

  // Normaliza role para comparação
  const safeRole = role?.toUpperCase() || 'FINANCIAL';
  const isAllAccess = safeRole === 'ADMIN';

  // Calcula permissões de edição
  const canEditFinancial = safeRole === 'ADMIN' || safeRole === 'FINANCIAL';
  const canEditCommercial = safeRole === 'ADMIN' || safeRole === 'COMMERCIAL';
  const canEditLegal = safeRole === 'ADMIN' || safeRole === 'LEGAL';

  return (
    <div className="w-full">
      {/* Navegação das Abas */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {(isAllAccess || safeRole === 'FINANCIAL') && (
          <button 
            type="button"
            onClick={() => handleTabChange('financial')}
            className={getTabStyle('financial')}
          >
            💰 Financeiro
          </button>
        )}
        
        {(isAllAccess || safeRole === 'COMMERCIAL') && (
          <button 
            type="button"
            onClick={() => handleTabChange('commercial')}
            className={getTabStyle('commercial')}
          >
            📈 Comercial
          </button>
        )}

        {(isAllAccess || safeRole === 'LEGAL') && (
          <button 
            type="button"
            onClick={() => handleTabChange('legal')}
            className={getTabStyle('legal')}
          >
            ⚖️ Jurídico
          </button>
        )}
      </div>

      {/* Área do Formulário */}
      <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[400px]">
        {activeTab === 'financial' && (
          <FinancialForm data={data} readOnly={!canEditFinancial} />
        )}
        {activeTab === 'commercial' && (
          <CommercialForm data={data} readOnly={!canEditCommercial} />
        )}
        {activeTab === 'legal' && (
          <LegalForm data={data} readOnly={!canEditLegal} />
        )}
      </div>
    </div>
  );
}
