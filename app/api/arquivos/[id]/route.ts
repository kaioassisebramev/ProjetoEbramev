import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

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

    // Remove arquivo do sistema de arquivos
    try {
      const filePath = join(process.cwd(), 'public', arquivo.caminhoUrl);
      await unlink(filePath);
    } catch (error) {
      console.warn('Erro ao remover arquivo do sistema:', error);
      // Continua mesmo se o arquivo não existir no sistema
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
