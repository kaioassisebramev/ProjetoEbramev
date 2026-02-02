import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { itemNotaSchema } from '@/lib/schemas/notaFiscal';

// GET - Listar itens de uma nota fiscal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const notaFiscalId = parseInt(id);

    if (isNaN(notaFiscalId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verifica se a nota existe
    const notaFiscal = await prisma.notaFiscal.findUnique({
      where: { codigo: notaFiscalId },
    });

    if (!notaFiscal) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Busca itens
    const itens = await prisma.itemNota.findMany({
      where: { notaFiscalId },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ itens }, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao listar itens: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - Criar item em uma nota fiscal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const notaFiscalId = parseInt(id);

    if (isNaN(notaFiscalId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verifica se a nota existe
    const notaFiscal = await prisma.notaFiscal.findUnique({
      where: { codigo: notaFiscalId },
    });

    if (!notaFiscal) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Valida dados
    const validatedData = itemNotaSchema.parse(body);

    // Calcula valor total
    const valorTotal = validatedData.quantidade * validatedData.valorUnitario;

    // Cria item
    const item = await prisma.itemNota.create({
      data: {
        descricao: validatedData.descricao,
        unidadeMedida: validatedData.unidadeMedida,
        quantidade: validatedData.quantidade,
        valorUnitario: validatedData.valorUnitario,
        valorTotal,
        ncm: validatedData.ncm || null,
        icms: validatedData.icms || null,
        categoria: validatedData.categoria || null,
        notaFiscalId,
      },
    });

    return NextResponse.json(
      {
        message: 'Item criado com sucesso',
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar item:', error);

    if (error && typeof error === 'object' && 'issues' in error) {
      // Erro de validação Zod
      return NextResponse.json(
        { error: 'Dados inválidos', details: error },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao criar item: ${errorMessage}` },
      { status: 500 }
    );
  }
}
