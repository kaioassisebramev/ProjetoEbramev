import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const unidadeMedidaSchema = z.object({
  sigla: z.string().min(1, 'Sigla é obrigatória').max(10),
  descricao: z.string().optional().nullable(),
});

// GET - Listar todas as unidades de medida
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Busca todas as unidades
    const unidades = await prisma.unidadeMedida.findMany({
      orderBy: { sigla: 'asc' },
    });

    return NextResponse.json({ unidades }, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar unidades de medida:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao listar unidades: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - Criar nova unidade de medida (apenas ADMIN)
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

    // Verifica se é ADMIN
    const role = session.user.role?.toUpperCase() || '';
    if (role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar unidades de medida.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Valida dados
    const validatedData = unidadeMedidaSchema.parse(body);

    // Verifica se a sigla já existe
    const existing = await prisma.unidadeMedida.findUnique({
      where: { sigla: validatedData.sigla },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma unidade de medida com esta sigla' },
        { status: 409 }
      );
    }

    // Cria unidade
    const unidade = await prisma.unidadeMedida.create({
      data: {
        sigla: validatedData.sigla.toUpperCase(),
        descricao: validatedData.descricao || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Unidade de medida criada com sucesso',
        unidade,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar unidade de medida:', error);

    if (error && typeof error === 'object' && 'issues' in error) {
      // Erro de validação Zod
      return NextResponse.json(
        { error: 'Dados inválidos', details: error },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao criar unidade de medida: ${errorMessage}` },
      { status: 500 }
    );
  }
}
