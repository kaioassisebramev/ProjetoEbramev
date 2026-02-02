import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { notaFiscalSchema } from '@/lib/schemas/notaFiscal';

// GET - Buscar nota fiscal por ID
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
    const codigo = parseInt(id);

    if (isNaN(codigo)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Busca nota fiscal
    const notaFiscal = await prisma.notaFiscal.findUnique({
      where: { codigo },
      include: {
        itens: true,
        arquivos: true,
      },
    });

    if (!notaFiscal) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Calcula valor total
    const valorTotal = notaFiscal.itens.reduce(
      (sum, item) => sum + Number(item.valorTotal),
      0
    );

    return NextResponse.json(
      {
        ...notaFiscal,
        valorTotal,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar nota fiscal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao buscar nota: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar nota fiscal
export async function PATCH(
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
    const codigo = parseInt(id);

    if (isNaN(codigo)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Valida dados
    const validatedData = notaFiscalSchema.parse(body);

    // Verifica se a nota existe
    const notaExistente = await prisma.notaFiscal.findUnique({
      where: { codigo },
    });

    if (!notaExistente) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Converte datas (aceita YYYY-MM-DD ou ISO datetime)
    const updateData: any = {};
    
    if (validatedData.filial !== undefined) updateData.filial = validatedData.filial;
    if (validatedData.empresa !== undefined) updateData.empresa = validatedData.empresa;
    if (validatedData.cnpj !== undefined) updateData.cnpj = validatedData.cnpj;
    if (validatedData.recebimento !== undefined) updateData.recebimento = validatedData.recebimento;
    if (validatedData.pago !== undefined) updateData.pago = validatedData.pago;

    if (validatedData.dataEmissao !== undefined) {
      const dataEmissao = validatedData.dataEmissao instanceof Date
        ? validatedData.dataEmissao
        : (() => {
            const dateStr = validatedData.dataEmissao as string;
            if (dateStr.includes('T')) {
              return new Date(dateStr);
            }
            // Usa meio-dia local para evitar problemas de timezone
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0);
          })();
      
      if (isNaN(dataEmissao.getTime())) {
        return NextResponse.json(
          { error: 'Data de emissão inválida' },
          { status: 400 }
        );
      }
      updateData.dataEmissao = dataEmissao;
    }

    if (validatedData.dataVencimento !== undefined) {
      const dataVencimento = validatedData.dataVencimento instanceof Date
        ? validatedData.dataVencimento
        : (() => {
            const dateStr = validatedData.dataVencimento as string;
            if (dateStr.includes('T')) {
              return new Date(dateStr);
            }
            // Usa meio-dia local para evitar problemas de timezone
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0);
          })();
      
      if (isNaN(dataVencimento.getTime())) {
        return NextResponse.json(
          { error: 'Data de vencimento inválida' },
          { status: 400 }
        );
      }
      updateData.dataVencimento = dataVencimento;
    }

    // Atualiza nota fiscal
    const notaFiscal = await prisma.notaFiscal.update({
      where: { codigo },
      data: updateData,
      include: {
        itens: true,
        arquivos: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Nota fiscal atualizada com sucesso',
        notaFiscal,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar nota fiscal:', error);

    if (error && typeof error === 'object' && 'issues' in error) {
      // Erro de validação Zod
      return NextResponse.json(
        { error: 'Dados inválidos', details: error },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao atualizar nota fiscal: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE - Excluir nota fiscal
export async function DELETE(
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
    const codigo = parseInt(id);

    if (isNaN(codigo)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verifica se a nota existe
    const notaExistente = await prisma.notaFiscal.findUnique({
      where: { codigo },
    });

    if (!notaExistente) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Exclui nota fiscal (cascade automático no Prisma para itens e arquivos)
    await prisma.notaFiscal.delete({
      where: { codigo },
    });

    return NextResponse.json(
      { message: 'Nota fiscal excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir nota fiscal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao excluir nota fiscal: ${errorMessage}` },
      { status: 500 }
    );
  }
}
