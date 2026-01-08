import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Listar todos os usuários (apenas ADMIN)
export async function GET(request: NextRequest) {
  try {
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
        { error: 'Acesso negado. Apenas administradores podem listar usuários.' },
        { status: 403 }
      );
    }

    // Busca todos os usuários (sem a senha)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao listar usuários: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário (apenas ADMIN)
export async function POST(request: NextRequest) {
  try {
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
        { error: 'Acesso negado. Apenas administradores podem criar usuários.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, username, password, role: userRole } = body;

    // Validação básica
    if (!name || !username || !password || !userRole) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Valida role
    const validRoles = ['ADMIN', 'FINANCIAL', 'COMMERCIAL', 'LEGAL', 'ADMINISTRATIVE'];
    if (!validRoles.includes(userRole.toUpperCase())) {
      return NextResponse.json(
        { error: 'Cargo inválido' },
        { status: 400 }
      );
    }

    // Verifica se o username já existe
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este username' },
        { status: 409 }
      );
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: username.trim(),
        password: hashedPassword,
        role: userRole.toUpperCase(),
        mustChangePassword: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Usuário criado com sucesso',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Tratamento de erros específicos do Prisma
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um usuário com este username' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Erro ao criar usuário: ${errorMessage}` },
      { status: 500 }
    );
  }
}
