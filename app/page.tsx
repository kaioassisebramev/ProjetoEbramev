export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Projeto4 - Fundação Configurada
        </h1>
        <p className="text-center text-gray-600">
          Sistema base configurado com Next.js 14, NextAuth v4, Prisma e TypeScript.
        </p>
        <p className="text-center text-gray-500 mt-4">
          Banco de dados SQLite configurado e pronto para uso.
        </p>
      </div>
    </main>
  )
}
