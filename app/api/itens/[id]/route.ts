import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { itemNotaSchema } from '@/lib/schemas/notaFiscal';

// PATCH - Atualizar item
export async function PATCH(
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
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = itemNotaSchema.parse(body);

    // Calcula valor total
    const valorTotal = validatedData.quantidade * validatedData.valorUnitario;

    const item = await prisma.itemNota.update({
      where: { id: itemId },
      data: {
        descricao: validatedData.descricao,
        unidadeMedida: validatedData.unidadeMedida,
        quantidade: validatedData.quantidade,
        valorUnitario: validatedData.valorUnitario,
        valorTotal,
        ncm: validatedData.ncm || null,
        icms: validatedData.icms || null,
        categoria: validatedData.categoria || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Item atualizado com sucesso',
        item,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao atualizar item: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE - Excluir item
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
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    await prisma.itemNota.delete({
      where: { id: itemId },
    });

    return NextResponse.json(
      { message: 'Item excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao excluir item: ${errorMessage}` },
      { status: 500 }
    );
  }
}
