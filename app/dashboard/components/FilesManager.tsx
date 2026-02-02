'use client';

import { useState, useRef } from 'react';
import { Arquivo } from '@prisma/client';
import toast from 'react-hot-toast';

interface FilesManagerProps {
  notaFiscalId: number;
  initialArquivos: Arquivo[];
}

export function FilesManager({ notaFiscalId, initialArquivos }: FilesManagerProps) {
  const [arquivos, setArquivos] = useState<Arquivo[]>(initialArquivos);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Valida tipo
    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos ❌');
      return;
    }

    // Valida tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB ❌');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('notaFiscalId', notaFiscalId.toString());

      const response = await fetch('/api/arquivos/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer upload');
      }

      toast.success('Arquivo enviado com sucesso! ✅');
      
      // Recarrega a página para atualizar a lista
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao fazer upload do arquivo ❌');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (arquivoId: number) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) {
      return;
    }

    setDeletingId(arquivoId);

    try {
      const response = await fetch(`/api/arquivos/${arquivoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir arquivo');
      }

      toast.success('Arquivo excluído com sucesso! ✅');
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir arquivo ❌');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Arquivos PDF</h2>

      {/* Upload */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Enviando...' : '📄 Selecionar PDF'}
        </label>
        <p className="mt-2 text-sm text-gray-500">
          Apenas arquivos PDF. Tamanho máximo: 10MB
        </p>
      </div>

      {/* Lista de Arquivos */}
      {arquivos.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhum arquivo enviado ainda</p>
      ) : (
        <div className="space-y-3">
          {arquivos.map((arquivo) => (
            <div
              key={arquivo.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-600 font-bold">PDF</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{arquivo.nomeArquivo}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(arquivo.tamanho)} •{' '}
                    {new Date(arquivo.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={arquivo.caminhoUrl.startsWith('http') ? arquivo.caminhoUrl : arquivo.caminhoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                >
                  {arquivo.caminhoUrl.startsWith('https://') ? 'Abrir no Blob' : 'Download'}
                </a>
                <button
                  onClick={() => handleDelete(arquivo.id)}
                  disabled={deletingId === arquivo.id}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                >
                  {deletingId === arquivo.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
