import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha e desativa mustChangePassword
    // IMPORTANTE: Sempre definir mustChangePassword: false para evitar loop infinito
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
        mustChangePassword: false, // CRÍTICO: Desativa a flag para evitar loop
      },
      select: {
        id: true,
        mustChangePassword: true,
      },
    });

    // Verifica se a atualização foi bem-sucedida
    if (updatedUser.mustChangePassword !== false) {
      console.error('ERRO CRÍTICO: mustChangePassword não foi atualizado corretamente');
      return NextResponse.json(
        { error: 'Erro ao atualizar status da senha. Tente fazer logout e login novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Senha alterada com sucesso',
        mustChangePassword: false, // Confirma que foi atualizado
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { error: 'Erro ao alterar senha' },
      { status: 500 }
    );
  }
}
