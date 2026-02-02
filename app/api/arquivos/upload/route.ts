import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// POST - Upload de arquivo PDF
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const notaFiscalId = formData.get('notaFiscalId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    if (!notaFiscalId) {
      return NextResponse.json(
        { error: 'ID da nota fiscal é obrigatório' },
        { status: 400 }
      );
    }

    const codigo = parseInt(notaFiscalId);

    if (isNaN(codigo)) {
      return NextResponse.json(
        { error: 'ID da nota fiscal inválido' },
        { status: 400 }
      );
    }

    // Verifica se a nota existe
    const notaFiscal = await prisma.notaFiscal.findUnique({
      where: { codigo },
    });

    if (!notaFiscal) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Valida tipo de arquivo (apenas PDF)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Apenas arquivos PDF são permitidos' },
        { status: 400 }
      );
    }

    // Valida tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 10MB' },
        { status: 400 }
      );
    }

    // Cria diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Gera nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${codigo}_${timestamp}_${file.name}`;
    const filePath = join(uploadsDir, fileName);

    // Salva arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL do arquivo
    const fileUrl = `/uploads/${fileName}`;

    // Salva referência no banco
    const arquivo = await prisma.arquivo.create({
      data: {
        nomeArquivo: file.name,
        caminhoUrl: fileUrl,
        tipo: file.type,
        tamanho: file.size,
        notaFiscalId: codigo,
      },
    });

    return NextResponse.json(
      {
        message: 'Arquivo enviado com sucesso',
        arquivo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao fazer upload: ${errorMessage}` },
      { status: 500 }
    );
  }
}
