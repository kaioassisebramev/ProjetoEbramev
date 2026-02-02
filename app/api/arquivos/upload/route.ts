import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { uploadToBlob, isBlobStorageConfigured } from '@/lib/azureBlob';
import { uploadToVercelBlob, isVercelBlobConfigured } from '@/lib/vercelBlob';

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

    // Converte arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verifica se está em produção (Vercel)
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    let fileUrl: string | undefined;

    // Prioridade 1: Vercel Blob Storage (mais simples e nativo)
    if (isVercelBlobConfigured()) {
      try {
        const timestamp = Date.now();
        const fileName = `nota-${codigo}/${timestamp}_${file.name}`;
        fileUrl = await uploadToVercelBlob(buffer, fileName, file.type);
      } catch (vercelBlobError) {
        console.error('Erro ao fazer upload para Vercel Blob:', vercelBlobError);
        
        // Em produção, não tenta fallback
        if (isProduction) {
          return NextResponse.json(
            {
              error: `Erro ao fazer upload para Vercel Blob Storage: ${vercelBlobError instanceof Error ? vercelBlobError.message : 'Erro desconhecido'}`,
            },
            { status: 500 }
          );
        }

        // Em desenvolvimento, tenta Azure ou local
        // Continua para o próximo fallback abaixo
      }
    }
    
    // Prioridade 2: Azure Blob Storage (se Vercel Blob não estiver configurado ou falhou)
    if (!fileUrl && isBlobStorageConfigured()) {
      try {
        const timestamp = Date.now();
        const fileName = `${codigo}_${timestamp}_${file.name}`;
        fileUrl = await uploadToBlob(buffer, fileName, file.type);
      } catch (blobError) {
        console.error('Erro ao fazer upload para Azure Blob:', blobError);
        
        if (isProduction) {
          return NextResponse.json(
            {
              error: `Erro ao fazer upload: ${blobError instanceof Error ? blobError.message : 'Erro desconhecido'}`,
            },
            { status: 500 }
          );
        }

        // Fallback local apenas em desenvolvimento
        try {
          const uploadsDir = join(process.cwd(), 'public', 'uploads');
          if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, { recursive: true });
          }
          const timestamp = Date.now();
          const fileName = `${codigo}_${timestamp}_${file.name}`;
          const filePath = join(uploadsDir, fileName);
          await writeFile(filePath, buffer);
          fileUrl = `/uploads/${fileName}`;
        } catch (localError) {
          return NextResponse.json(
            {
              error: `Erro ao fazer upload: ${localError instanceof Error ? localError.message : 'Erro desconhecido'}`,
            },
            { status: 500 }
          );
        }
      }
    }
    
    // Prioridade 3: Armazenamento local (apenas em desenvolvimento)
    if (fileUrl === undefined) {
      if (isProduction) {
        return NextResponse.json(
          {
            error: 'Configure BLOB_READ_WRITE_TOKEN ou AZURE_STORAGE_CONNECTION_STRING no Vercel.',
          },
          { status: 500 }
        );
      }

      // Fallback local apenas em desenvolvimento
      try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          mkdirSync(uploadsDir, { recursive: true });
        }
        const timestamp = Date.now();
        const fileName = `${codigo}_${timestamp}_${file.name}`;
        const filePath = join(uploadsDir, fileName);
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/${fileName}`;
      } catch (localError) {
        return NextResponse.json(
          {
            error: `Erro ao fazer upload: ${localError instanceof Error ? localError.message : 'Erro desconhecido'}`,
          },
          { status: 500 }
        );
      }
    }

    // Garante que fileUrl foi definido
    if (!fileUrl) {
      return NextResponse.json(
        {
          error: 'Erro ao fazer upload: nenhum método de armazenamento funcionou',
        },
        { status: 500 }
      );
    }

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
