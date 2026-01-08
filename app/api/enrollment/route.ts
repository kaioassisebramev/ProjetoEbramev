import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

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
    const { studentName, course, hub, saleDate } = body;

    // Validação básica
    if (!studentName || !course || !hub || !saleDate) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Conversão crítica: garante que saleDate seja um objeto Date válido
    let saleDateObj: Date;
    try {
      saleDateObj = new Date(saleDate);
      // Verifica se a data é válida
      if (isNaN(saleDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Data de venda inválida' },
          { status: 400 }
        );
      }
    } catch (dateError) {
      console.error('Erro ao converter data:', dateError);
      return NextResponse.json(
        { error: 'Erro ao processar data de venda' },
        { status: 400 }
      );
    }

    // Cria o enrollment com dados básicos e valores padrão para campos obrigatórios
    const enrollment = await prisma.enrollment.create({
      data: {
        studentName: String(studentName).trim(),
        course: String(course).trim(),
        hub: String(hub).trim(),
        saleDate: saleDateObj, // Conversão crítica
        classCode: 'A DEFINIR', // Placeholder para não quebrar
        fullValue: 0.0, // Placeholder para não quebrar (Float)
        status: 'PENDENTE', // Status inicial da matrícula
      },
    });

    return NextResponse.json(
      {
        message: 'Matrícula criada com sucesso',
        id: enrollment.id,
        data: enrollment,
      },
      { status: 201 }
    );
  } catch (error) {
    // Log detalhado do erro para diagnóstico
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    
    console.error('Erro ao criar matrícula:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    if (errorCode) {
      console.error('Error code:', errorCode);
    }
    console.error('Error message:', errorMessage);

    // Tratamento de erros específicos do Prisma
    if (errorCode === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma matrícula com esses dados' },
        { status: 409 }
      );
    }

    // Retorna mensagem de erro mais detalhada em desenvolvimento
    const responseMessage =
      process.env.NODE_ENV === 'development'
        ? `Erro ao criar matrícula: ${errorMessage}`
        : 'Erro ao criar matrícula';

    return NextResponse.json(
      { error: responseMessage },
      { status: 500 }
    );
  }
}
