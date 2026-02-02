# 📋 ESTADO DO PROJETO ANTES DA MIGRAÇÃO

**Data:** 2025-01-15  
**Versão:** 1.0.0  
**Sistema:** Gestão de Matrículas EBRAMEV

---

## 📦 DEPENDÊNCIAS

### Produção
- next: ^14.2.5
- react: ^18.3.1
- react-dom: ^18.3.1
- next-auth: ^4.24.7
- @prisma/client: ^5.19.1
- bcryptjs: ^2.4.3
- react-hook-form: ^7.51.0
- react-hot-toast: ^2.6.0
- zod: ^3.23.8
- @hookform/resolvers: ^3.3.4

### Desenvolvimento
- typescript: ^5.5.3
- prisma: ^5.19.1
- tailwindcss: ^3.4.17
- tsx: ^4.16.2
- postcss: ^8.4.38
- autoprefixer: ^10.4.19
- @types/bcryptjs: ^2.4.6
- @types/node: ^20.14.10
- @types/react: ^18.3.3
- @types/react-dom: ^18.3.0

---

## 🗄️ BANCO DE DADOS

**Provider:** PostgreSQL  
**Variáveis de Ambiente:**
- `PRISMA_DATABASE_URL` (connection pooling - Vercel)
- `POSTGRES_URL` (direct connection - Vercel)

**Models Atuais:**

### User
- id: String (UUID)
- name: String
- username: String (unique)
- password: String (bcrypt hash)
- role: String (ADMIN, FINANCIAL, COMMERCIAL, LEGAL, ADMINISTRATIVE)
- mustChangePassword: Boolean
- isActive: Boolean
- createdAt: DateTime

### Enrollment
- id: String (UUID)
- studentName: String
- course: String
- classCode: String
- hub: String
- saleDate: DateTime
- fullValue: Float
- status: String
- Campos Financeiros: contractValue, commissionValue, dueDate, installments, installmentValue, discountValue, discountAuthorized, registrationFee, leadOrigin
- Campos Comerciais: isDisabledPerson, hasMobilityRestriction, mobilityDetails, foodRestrictions, shirtSize, pantsSize, postSaleStatus, contractSignedStatus, studentStatus, classStatus, boletoEmissionStatus, boletosGenerated, portalAccess
- Campos Jurídicos: docRg, docCpf, docDiploma, docHistory, docBirthCert, docAddressProof, docCrmv, docProfilePic, docMecCert, docFacultyIssuer, isTransfer, generalObservations
- createdAt: DateTime
- updatedAt: DateTime

**Última Migration:** 20260109140042_init_vercel

---

## 🛣️ ROTAS API FUNCIONAIS

### Autenticação
- `POST /api/auth/[...nextauth]` - Login/Logout (NextAuth)

### Matrículas
- `POST /api/enrollment` - Criar matrícula
- `PATCH /api/enrollment/[id]` - Atualizar matrícula (com filtro por role)

### Usuários
- `GET /api/users` - Listar usuários (apenas ADMIN)
- `POST /api/users` - Criar usuário (apenas ADMIN)
- `POST /api/user/change-password` - Trocar senha do usuário logado

### Webhooks
- `GET /api/webhook` - Verificar status do webhook
- `POST /api/webhook` - Receber webhook do ChatGuru (valida header x-webhook-secret)
- `POST /api/webhooks/chatguru` - Rota alternativa (legado)

---

## 📄 PÁGINAS FUNCIONAIS

### Públicas
- `/` - Redireciona para dashboard ou login
- `/auth/login` - Página de login (com Suspense)
- `/auth/change-password` - Trocar senha obrigatória

### Dashboard (Protegidas por middleware)
- `/dashboard` - Visão geral (todos alunos com busca e ordenação)
- `/dashboard/financial` - Setor financeiro (filtro por role)
- `/dashboard/commercial` - Setor comercial (filtro por role)
- `/dashboard/legal` - Setor jurídico (filtro por role)
- `/dashboard/users` - Gerenciamento de usuários (apenas ADMIN)
- `/dashboard/enrollment/[id]` - Editar matrícula (com abas por departamento)

---

## 👥 USUÁRIOS DE TESTE

**Admin Padrão:**
- Username: admin@ebramev.com.br
- Password: 123 (verificar no seed-admin.ts)
- Role: ADMIN
- mustChangePassword: true (no primeiro login)

---

## 🔐 VARIÁVEIS DE AMBIENTE

**Arquivo:** `.env` ou `.env.local` (não commitado)

```env
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=http://localhost:3000
PRISMA_DATABASE_URL=postgresql://... (Vercel)
POSTGRES_URL=postgresql://... (Vercel)
WEBHOOK_SECRET=seu_secret_webhook
```

**⚠️ IMPORTANTE:** Fazer backup manual deste arquivo!

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

- [x] Autenticação com NextAuth (JWT strategy)
- [x] Controle de acesso por roles (ADMIN, FINANCIAL, COMMERCIAL, LEGAL, ADMINISTRATIVE)
- [x] CRUD completo de matrículas
- [x] CRUD completo de usuários (apenas ADMIN)
- [x] Formulários separados por departamento (Financeiro, Comercial, Jurídico)
- [x] Status visual por departamento (🟢 Completo, 🟡 Parcial, 🔴 Vazio)
- [x] Busca em tempo real de alunos
- [x] Ordenação inteligente (prioriza alunos com pendências)
- [x] Troca de senha obrigatória no primeiro login
- [x] Webhook para receber dados do ChatGuru
- [x] Design system moderno (Tailwind CSS + Inter font)
- [x] Toast notifications (react-hot-toast)
- [x] Validação com Zod (schemas relaxados para salvamento parcial)
- [x] Campos read-only baseados em role
- [x] Header horizontal responsivo (mobile menu)
- [x] Middleware de proteção de rotas

---

## 🎨 COMPONENTES PRINCIPAIS

### Layout
- `app/dashboard/components/Header.tsx` - Topbar horizontal com navegação
- `app/dashboard/layout.tsx` - Layout do dashboard com proteção

### Tabelas
- `app/dashboard/components/DashboardTable.tsx` - Tabela principal com busca e ordenação
- `app/dashboard/financial/components/FinancialTable.tsx` - Tabela do setor financeiro
- `app/dashboard/commercial/components/CommercialTable.tsx` - Tabela do setor comercial
- `app/dashboard/legal/components/LegalTable.tsx` - Tabela do setor jurídico

### Formulários
- `app/dashboard/components/forms/FinancialForm.tsx` - Formulário financeiro
- `app/dashboard/components/forms/CommercialForm.tsx` - Formulário comercial
- `app/dashboard/components/forms/LegalForm.tsx` - Formulário jurídico
- `app/dashboard/components/NewEnrollmentDialog.tsx` - Dialog para criar aluno
- `app/dashboard/users/components/UserForm.tsx` - Formulário de usuário

### Outros
- `app/dashboard/components/Tabs.tsx` - Componente de abas
- `app/dashboard/enrollment/[id]/components/EnrollmentTabs.tsx` - Abas de edição
- `components/ui/Badge.tsx` - Badge reutilizável

---

## 📚 BIBLIOTECAS E UTILITÁRIOS

### Libs
- `lib/authOptions.ts` - Configuração NextAuth
- `lib/prisma.ts` - Prisma Client singleton
- `lib/enrollmentStatus.ts` - Cálculo de status por departamento
- `lib/enrollmentValidation.ts` - Validação de campos faltantes
- `lib/schemas/enrollment.ts` - Schemas Zod (financial, commercial, legal)

### Scripts
- `seed-admin.ts` - Criar usuário admin
- `reset-admin-password.ts` - Resetar senha do admin
- `prisma/seed.ts` - Seed do banco

---

## 🐛 BUGS CONHECIDOS

Nenhum bug crítico conhecido no momento da migração.

**Correções já implementadas:**
- ✅ Loop infinito de troca de senha (corrigido atualizando JWT)
- ✅ Loading infinito nos formulários (corrigido com finally)
- ✅ useSearchParams sem Suspense (corrigido)

---

## 📝 NOTAS IMPORTANTES

- Sistema está em produção na Vercel
- Banco de dados PostgreSQL na Vercel (connection pooling)
- Webhook configurado para receber dados do ChatGuru
- Prisma Client gerado automaticamente no deploy (postinstall script)
- Middleware protege todas as rotas `/dashboard/*`
- Validação de webhook via header `x-webhook-secret`
- Cálculo automático de comissão (10% do valor do contrato)

---

## 🔄 ESTRUTURA DE PASTAS

```
app/
├── api/                    # API Routes
│   ├── auth/               # NextAuth
│   ├── enrollment/         # CRUD matrículas
│   ├── users/              # CRUD usuários
│   ├── user/               # Ações do usuário logado
│   └── webhook/            # Webhooks
├── auth/                   # Páginas de autenticação
├── dashboard/              # Dashboard e páginas internas
│   ├── components/         # Componentes reutilizáveis
│   ├── financial/          # Setor financeiro
│   ├── commercial/         # Setor comercial
│   ├── legal/              # Setor jurídico
│   ├── enrollment/         # Edição de matrícula
│   └── users/              # Gerenciamento de usuários
└── globals.css             # Estilos globais

lib/
├── authOptions.ts          # NextAuth config
├── prisma.ts              # Prisma Client
├── enrollmentStatus.ts    # Status por departamento
├── enrollmentValidation.ts # Validação de campos
└── schemas/               # Schemas Zod
```

---

## 🚀 PRÓXIMOS PASSOS (PÓS-MIGRAÇÃO)

1. Substituir schema de Enrollment por NotaFiscal
2. Criar novas rotas de API para notas fiscais
3. Substituir páginas de matrículas por páginas de notas
4. Implementar upload de PDF
5. Implementar exportação Excel (xlsx)
6. Criar gerenciamento de itens da nota
7. Implementar filtros avançados
8. Adicionar busca textual

---

## ✅ CHECKLIST PRÉ-MIGRAÇÃO

- [x] Documentação criada
- [ ] Backup do código (git tag ou pasta)
- [ ] Backup do banco de dados
- [ ] Backup do arquivo .env
- [ ] Build de produção testado
- [ ] Branch de migração criada
