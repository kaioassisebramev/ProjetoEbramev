import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Usuário e senha são obrigatórios');
        }

        // Busca o usuário no banco pelo username
        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!user) {
          throw new Error('Usuário ou senha inválidos');
        }

        // Verifica se o usuário está ativo
        if (!user.isActive) {
          throw new Error('Usuário inativo');
        }

        // Compara a senha digitada com o hash do banco
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Usuário ou senha inválidos');
        }

        // Retorna o objeto user que será adicionado ao token
        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Quando o usuário faz login, o objeto 'user' está disponível
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
        token.username = user.username;
      }

      // Se o token já existe e temos um ID, verifica se mustChangePassword mudou no banco
      // Isso resolve o problema de loop infinito após troca de senha
      if (token.id && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { mustChangePassword: true },
          });

          if (dbUser) {
            // Atualiza o token com o valor atualizado do banco
            token.mustChangePassword = dbUser.mustChangePassword;
          }
        } catch (error) {
          // Em caso de erro, mantém o valor atual do token
          console.error('Erro ao verificar mustChangePassword no banco:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Passa os dados do token para a session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.mustChangePassword = token.mustChangePassword;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
