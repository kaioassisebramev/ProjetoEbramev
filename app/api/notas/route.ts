import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { notaFiscalSchema, notasFiltroSchema } from '@/lib/schemas/notaFiscal';

// GET - Listar notas fiscais com filtros
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

    // Pega parâmetros da query string
    const { searchParams } = new URL(request.url);
    const ano = searchParams.get('ano') ? parseInt(searchParams.get('ano')!) : undefined;
    const mes = searchParams.get('mes') ? parseInt(searchParams.get('mes')!) : undefined;
    const filial = searchParams.get('filial') ? parseInt(searchParams.get('filial')!) : undefined;
    const pago = searchParams.get('pago') === 'true' ? true : searchParams.get('pago') === 'false' ? false : undefined;
    const recebimento = searchParams.get('recebimento') as 'FISICO' | 'EMAIL' | 'WHATSAPP' | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Valida filtros
    const filtros = notasFiltroSchema.parse({
      ano,
      mes,
      filial,
      pago,
      recebimento: recebimento || undefined,
      page,
      limit,
    });

    // Monta condições de filtro
    const where: any = {};

    if (filtros.ano || filtros.mes) {
      where.dataEmissao = {};
      if (filtros.ano) {
        where.dataEmissao.gte = new Date(`${filtros.ano}-01-01`);
        where.dataEmissao.lt = new Date(`${filtros.ano + 1}-01-01`);
      }
      if (filtros.mes && filtros.ano) {
        const mesStr = filtros.mes.toString().padStart(2, '0');
        where.dataEmissao.gte = new Date(`${filtros.ano}-${mesStr}-01`);
        const proximoMes = filtros.mes === 12 ? 1 : filtros.mes + 1;
        const proximoAno = filtros.mes === 12 ? filtros.ano + 1 : filtros.ano;
        const proximoMesStr = proximoMes.toString().padStart(2, '0');
        where.dataEmissao.lt = new Date(`${proximoAno}-${proximoMesStr}-01`);
      }
    }

    if (filtros.filial) {
      where.filial = filtros.filial;
    }

    if (filtros.pago !== undefined) {
      where.pago = filtros.pago;
    }

    if (filtros.recebimento) {
      where.recebimento = filtros.recebimento;
    }

    // Busca notas com paginação
    const [notas, total] = await Promise.all([
      prisma.notaFiscal.findMany({
        where,
        include: {
          itens: true,
          arquivos: true,
        },
        orderBy: {
          dataEmissao: 'desc',
        },
        skip: (filtros.page - 1) * filtros.limit,
        take: filtros.limit,
      }),
      prisma.notaFiscal.count({ where }),
    ]);

    // Calcula total de cada nota (soma dos itens)
    const notasComTotal = notas.map((nota) => {
      const valorTotal = nota.itens.reduce(
        (sum, item) => sum + Number(item.valorTotal),
        0
      );
      return {
        ...nota,
        valorTotal,
      };
    });

    return NextResponse.json(
      {
        notas: notasComTotal,
        paginacao: {
          page: filtros.page,
          limit: filtros.limit,
          total,
          totalPages: Math.ceil(total / filtros.limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao listar notas fiscais:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao listar notas: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - Criar nova nota fiscal
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

    const body = await request.json();

    // Valida dados
    const validatedData = notaFiscalSchema.parse(body);

    // Converte datas
    const dataEmissao = new Date(validatedData.dataEmissao);
    const dataVencimento = new Date(validatedData.dataVencimento);

    // Cria nota fiscal
    const notaFiscal = await prisma.notaFiscal.create({
      data: {
        filial: validatedData.filial,
        empresa: validatedData.empresa,
        cnpj: validatedData.cnpj,
        dataEmissao,
        dataVencimento,
        recebimento: validatedData.recebimento,
        pago: validatedData.pago,
      },
      include: {
        itens: true,
        arquivos: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Nota fiscal criada com sucesso',
        notaFiscal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar nota fiscal:', error);

    if (error && typeof error === 'object' && 'issues' in error) {
      // Erro de validação Zod
      return NextResponse.json(
        { error: 'Dados inválidos', details: error },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao criar nota fiscal: ${errorMessage}` },
      { status: 500 }
    );
  }
}
