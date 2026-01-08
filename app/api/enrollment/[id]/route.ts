import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { financialSchema, commercialSchema, legalSchema } from '@/lib/schemas/enrollment';

// Campos permitidos por role
const FINANCIAL_FIELDS = [
  'contractValue',
  'commissionValue',
  'dueDate',
  'installments',
  'installmentValue',
  'discountValue',
  'discountAuthorized',
  'registrationFee',
  'leadOrigin',
];

const COMMERCIAL_FIELDS = [
  'isDisabledPerson',
  'hasMobilityRestriction',
  'mobilityDetails',
  'foodRestrictions',
  'shirtSize',
  'pantsSize',
  'postSaleStatus',
  'contractSignedStatus',
  'studentStatus',
  'classStatus',
  'boletoEmissionStatus',
  'boletosGenerated',
  'portalAccess',
];

const LEGAL_FIELDS = [
  'docRg',
  'docCpf',
  'docDiploma',
  'docHistory',
  'docBirthCert',
  'docAddressProof',
  'docCrmv',
  'docProfilePic',
  'docMecCert',
  'docFacultyIssuer',
  'isTransfer',
  'generalObservations',
];

function filterFieldsByRole(data: any, role: string) {
  const allowedFields: string[] = [];

  if (role === 'ADMIN') {
    // Admin pode editar tudo
    return data;
  }

  if (role === 'FINANCIAL') {
    allowedFields.push(...FINANCIAL_FIELDS);
  } else if (role === 'COMMERCIAL') {
    allowedFields.push(...COMMERCIAL_FIELDS);
  } else if (role === 'LEGAL') {
    allowedFields.push(...LEGAL_FIELDS);
  }

  // Filtra apenas os campos permitidos
  const filtered: any = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      filtered[field] = data[field];
    }
  });

  return filtered;
}

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
    const role = session.user.role;

    // Busca o enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      );
    }

    // Lê o body
    const body = await request.json();

    // Valida e filtra campos baseado na role
    let validatedData: any = {};
    let updateData: any = {};

    if (role === 'FINANCIAL' || role === 'ADMIN') {
      const financialData = financialSchema.parse(body);
      validatedData = { ...validatedData, ...financialData };
    }

    if (role === 'COMMERCIAL' || role === 'ADMIN') {
      const commercialData = commercialSchema.parse(body);
      validatedData = { ...validatedData, ...commercialData };
    }

    if (role === 'LEGAL' || role === 'ADMIN') {
      const legalData = legalSchema.parse(body);
      validatedData = { ...validatedData, ...legalData };
    }

    // Filtra campos permitidos (segurança adicional)
    updateData = filterFieldsByRole(validatedData, role);

    // Converte strings vazias para null
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === '') {
        updateData[key] = null;
      }
    });

    // Atualiza no banco
    const updated = await prisma.enrollment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { message: 'Aluno atualizado com sucesso', data: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar aluno:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar aluno' },
      { status: 500 }
    );
  }
}
