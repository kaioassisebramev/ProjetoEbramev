import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { deleteFromBlob, isBlobStorageConfigured } from '@/lib/azureBlob';
import { deleteFromVercelBlob, isVercelBlobConfigured } from '@/lib/vercelBlob';

// DELETE - Excluir arquivo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const arquivoId = parseInt(id);

    if (isNaN(arquivoId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Busca arquivo
    const arquivo = await prisma.arquivo.findUnique({
      where: { id: arquivoId },
    });

    if (!arquivo) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    // Remove arquivo (Vercel Blob, Azure Blob ou sistema de arquivos)
    try {
      if (arquivo.caminhoUrl.startsWith('https://')) {
        // É uma URL de blob storage
        if (isVercelBlobConfigured() && arquivo.caminhoUrl.includes('blob.vercel-storage.com')) {
          // É Vercel Blob Storage
          await deleteFromVercelBlob(arquivo.caminhoUrl);
        } else if (isBlobStorageConfigured()) {
          // É Azure Blob Storage
          await deleteFromBlob(arquivo.caminhoUrl);
        } else {
          console.warn('Blob Storage não configurado, não é possível deletar arquivo do blob');
        }
      } else {
        // É um arquivo local (apenas em desenvolvimento)
        const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
        if (!isProduction) {
          const filePath = join(process.cwd(), 'public', arquivo.caminhoUrl);
          await unlink(filePath);
        } else {
          console.warn('Tentativa de deletar arquivo local em produção (não suportado)');
        }
      }
    } catch (error) {
      console.warn('Erro ao remover arquivo:', error);
      // Continua mesmo se o arquivo não existir
    }

    // Remove do banco
    await prisma.arquivo.delete({
      where: { id: arquivoId },
    });

    return NextResponse.json(
      { message: 'Arquivo excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao excluir arquivo: ${errorMessage}` },
      { status: 500 }
    );
  }
}
