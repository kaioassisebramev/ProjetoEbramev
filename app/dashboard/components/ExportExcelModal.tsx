'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportExcelModal({ isOpen, onClose }: ExportExcelModalProps) {
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [loading, setLoading] = useState(false);

  // Define datas padrão (mês atual)
  useEffect(() => {
    if (isOpen && !dataInicial && !dataFinal) {
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      setDataInicial(primeiroDiaMes.toISOString().split('T')[0]);
      setDataFinal(ultimoDiaMes.toISOString().split('T')[0]);
    }
  }, [isOpen, dataInicial, dataFinal]);

  const handleExport = async () => {
    if (!dataInicial || !dataFinal) {
      toast.error('Selecione as datas inicial e final');
      return;
    }

    setLoading(true);

    try {
      const url = `/api/export/excel?dataInicial=${dataInicial}T00:00:00.000Z&dataFinal=${dataFinal}T23:59:59.999Z`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao exportar Excel');
      }

      // Cria blob e faz download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `notas_fiscais_${dataInicial}_${dataFinal}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Excel exportado com sucesso! ✅');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao exportar Excel ❌');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Exportar para Excel</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial *
            </label>
            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final *
            </label>
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={loading || !dataInicial || !dataFinal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </div>
  );
}
