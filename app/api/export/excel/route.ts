import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { exportExcelSchema } from '@/lib/schemas/notaFiscal';

export const dynamic = 'force-dynamic';

// GET - Exportar notas fiscais para Excel
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
    const dataInicial = searchParams.get('dataInicial');
    const dataFinal = searchParams.get('dataFinal');

    if (!dataInicial || !dataFinal) {
      return NextResponse.json(
        { error: 'Parâmetros dataInicial e dataFinal são obrigatórios' },
        { status: 400 }
      );
    }

    // Valida datas
    const validatedData = exportExcelSchema.parse({
      dataInicial,
      dataFinal,
    });

    // Converte datas (aceita YYYY-MM-DD ou ISO datetime)
    const inicio = validatedData.dataInicial instanceof Date
      ? validatedData.dataInicial
      : (() => {
          const dateStr = validatedData.dataInicial as string;
          if (dateStr.includes('T')) {
            return new Date(dateStr);
          }
          // Usa início do dia local para evitar problemas de timezone
          const [year, month, day] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day, 0, 0, 0);
        })();
    
    const fim = validatedData.dataFinal instanceof Date
      ? validatedData.dataFinal
      : (() => {
          const dateStr = validatedData.dataFinal as string;
          if (dateStr.includes('T')) {
            return new Date(dateStr);
          }
          // Usa fim do dia local para evitar problemas de timezone
          const [year, month, day] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day, 23, 59, 59);
        })();

    // Valida se as datas são válidas
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      return NextResponse.json(
        { error: 'Datas inválidas' },
        { status: 400 }
      );
    }

    // Busca notas no período
    const notas = await prisma.notaFiscal.findMany({
      where: {
        dataEmissao: {
          gte: inicio,
          lte: fim,
        },
      },
      include: {
        itens: true,
      },
      orderBy: {
        dataEmissao: 'desc',
      },
    });

    // Prepara dados para Excel - Aba 1: Notas Fiscais
    const notasData = notas.map((nota) => {
      const valorTotal = nota.itens.reduce(
        (sum, item) => sum + Number(item.valorTotal),
        0
      );

      return {
        Código: nota.codigo,
        Filial: nota.filial,
        Empresa: nota.empresa,
        CNPJ: nota.cnpj,
        'Data Emissão': nota.dataEmissao.toLocaleDateString('pt-BR'),
        'Data Vencimento': nota.dataVencimento.toLocaleDateString('pt-BR'),
        Recebimento: nota.recebimento,
        Pago: nota.pago ? 'Sim' : 'Não',
        'Valor Total': valorTotal.toFixed(2),
      };
    });

    // Prepara dados para Excel - Aba 2: Itens
    const itensData: any[] = [];
    notas.forEach((nota) => {
      nota.itens.forEach((item) => {
        itensData.push({
          'Código Nota': nota.codigo,
          Empresa: nota.empresa,
          Descrição: item.descricao,
          'Unidade Medida': item.unidadeMedida,
          Quantidade: Number(item.quantidade),
          'Valor Unitário': Number(item.valorUnitario).toFixed(2),
          'Valor Total': Number(item.valorTotal).toFixed(2),
          NCM: item.ncm || '',
          ICMS: item.icms || '',
          Categoria: item.categoria || '',
        });
      });
    });

    // Cria workbook
    const workbook = XLSX.utils.book_new();

    // Cria worksheet de Notas
    const notasWorksheet = XLSX.utils.json_to_sheet(notasData);
    XLSX.utils.book_append_sheet(workbook, notasWorksheet, 'Notas Fiscais');

    // Cria worksheet de Itens
    const itensWorksheet = XLSX.utils.json_to_sheet(itensData);
    XLSX.utils.book_append_sheet(workbook, itensWorksheet, 'Itens');

    // Gera buffer do Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Retorna arquivo
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="notas_fiscais_${inicio.toISOString().split('T')[0]}_${fim.toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);

    if (error && typeof error === 'object' && 'issues' in error) {
      // Erro de validação Zod
      return NextResponse.json(
        { error: 'Dados inválidos', details: error },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao exportar Excel: ${errorMessage}` },
      { status: 500 }
    );
  }
}
