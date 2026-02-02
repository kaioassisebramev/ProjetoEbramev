# 🔧 Solução: Erro de Upload no Vercel

## ❌ Problema

O erro `ENOENT: no such file or directory, mkdir '/var/task/public/uploads'` ocorria porque:

- **Vercel tem sistema de arquivos somente leitura** - não é possível criar diretórios ou escrever arquivos
- O código tentava fazer fallback para armazenamento local quando Azure Blob não estava configurado
- Isso funciona em desenvolvimento local, mas **não funciona em produção no Vercel**

## ✅ Solução Implementada

### 1. Detecção de Ambiente
- Detecta se está em produção (Vercel) através de `process.env.VERCEL === '1'`
- Em produção, **Azure Blob Storage é obrigatório**

### 2. Comportamento por Ambiente

#### **Produção (Vercel)**
- ✅ **Obrigatório**: Azure Blob Storage configurado
- ❌ **Não permite**: Fallback para armazenamento local
- 📝 **Erro claro**: Se Azure não estiver configurado, retorna erro explicativo

#### **Desenvolvimento Local**
- ✅ **Permite**: Azure Blob Storage (se configurado)
- ✅ **Permite**: Fallback para armazenamento local (se Azure não configurado)
- 📁 **Cria**: Diretório `public/uploads` automaticamente

### 3. Mensagens de Erro Melhoradas

Agora o sistema retorna erros claros:

```json
{
  "error": "Azure Blob Storage não está configurado. Configure AZURE_STORAGE_CONNECTION_STRING no Vercel."
}
```

---

## 🔧 CONFIGURAÇÃO NECESSÁRIA NO VERCEL

### Variáveis de Ambiente Obrigatórias

No Vercel Dashboard → Settings → Environment Variables, adicione:

```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=SEU_ACCOUNT;AccountKey=SUA_KEY;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=projeto-ebramev-blob
```

### Como Obter a Connection String

1. Acesse o [Azure Portal](https://portal.azure.com)
2. Vá em **Storage Accounts**
3. Selecione sua conta (ou crie uma nova)
4. Vá em **Access Keys**
5. Copie a **Connection string** (key1 ou key2)
6. Cole no Vercel como `AZURE_STORAGE_CONNECTION_STRING`

### Container Name

O container `projeto-ebramev-blob` será criado automaticamente na primeira vez.

Ou configure manualmente:

```env
AZURE_STORAGE_CONTAINER_NAME=projeto-ebramev-blob
```

---

## 📋 TESTE

### Após Configurar

1. ✅ Faça deploy no Vercel
2. ✅ Tente fazer upload de um PDF
3. ✅ Verifique se o arquivo aparece no Azure Portal
4. ✅ Teste o download do arquivo

### Se Ainda Der Erro

Verifique:
- ✅ Variáveis de ambiente configuradas no Vercel
- ✅ Connection string está correta
- ✅ Fez redeploy após configurar variáveis
- ✅ Verifique os logs do Vercel para mais detalhes

---

## 🎯 RESUMO

- ✅ **Produção**: Azure Blob Storage obrigatório
- ✅ **Desenvolvimento**: Azure Blob Storage ou armazenamento local
- ✅ **Erros claros**: Mensagens explicativas quando Azure não está configurado
- ✅ **Sem tentativas de criar diretórios**: Em produção, não tenta criar `/var/task/public/uploads`

---

## ⚠️ IMPORTANTE

**Em produção no Vercel, você DEVE configurar o Azure Blob Storage.** Não há outra opção, pois o sistema de arquivos é somente leitura.
