# 📦 Configuração do Azure Blob Storage

## ✅ IMPLEMENTAÇÃO CONCLUÍDA

O sistema está configurado para salvar arquivos PDF no Azure Blob Storage (`projeto-ebramev-blob`).

### Como Funciona

1. **Se Azure Blob estiver configurado**: Arquivos são salvos no blob storage
2. **Se não estiver configurado**: Arquivos são salvos localmente (fallback)

---

## 🔧 CONFIGURAÇÃO NO VERCEL

### Variáveis de Ambiente Necessárias

Adicione no Vercel Dashboard → Settings → Environment Variables:

```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=SEU_ACCOUNT;AccountKey=SUA_KEY;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=projeto-ebramev-blob
```

### Como Obter a Connection String

1. Acesse o [Azure Portal](https://portal.azure.com)
2. Vá em **Storage Accounts**
3. Selecione sua conta de storage (ou crie uma nova)
4. Vá em **Access Keys**
5. Copie a **Connection string** (pode ser key1 ou key2)
6. Cole no Vercel como `AZURE_STORAGE_CONNECTION_STRING`

### Container Name

O container `projeto-ebramev-blob` será criado automaticamente se não existir.

**Ou configure manualmente:**

```env
AZURE_STORAGE_CONTAINER_NAME=projeto-ebramev-blob
```

---

## 🧪 TESTE LOCAL

Para testar localmente, adicione no arquivo `.env.local`:

```env
AZURE_STORAGE_CONNECTION_STRING=sua-connection-string-aqui
AZURE_STORAGE_CONTAINER_NAME=projeto-ebramev-blob
```

---

## 📋 FUNCIONALIDADES

### Upload
- ✅ Upload automático para Azure Blob Storage
- ✅ Fallback para armazenamento local se não configurado
- ✅ Validação de tipo (apenas PDF)
- ✅ Validação de tamanho (máx. 10MB)

### Download
- ✅ Links funcionam tanto para Blob Storage quanto local
- ✅ URLs do Blob são acessíveis publicamente

### Exclusão
- ✅ Remove arquivo do Blob Storage ou sistema local
- ✅ Remove referência do banco de dados

---

## ⚠️ IMPORTANTE

1. **Container será criado automaticamente** na primeira vez
2. **Arquivos antigos** (salvos localmente) continuarão funcionando
3. **Novos uploads** usarão o Blob Storage se configurado
4. **URLs do Blob** começam com `https://` (ex: `https://seuaccount.blob.core.windows.net/...`)

---

## 🔍 VERIFICAÇÃO

Após configurar, faça upload de um arquivo e verifique:

1. No banco de dados, o campo `caminhoUrl` deve ter uma URL do Azure
2. O link de download deve abrir o arquivo diretamente do Blob Storage
3. Verifique no Azure Portal se o arquivo foi salvo no container
