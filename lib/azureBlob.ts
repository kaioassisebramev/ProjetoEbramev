import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

let containerClient: ContainerClient | null = null;

/**
 * Inicializa o cliente do Azure Blob Storage
 */
function getContainerClient(): ContainerClient {
  if (containerClient) {
    return containerClient;
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'projeto-ebramev-blob';

  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING não configurada');
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  containerClient = blobServiceClient.getContainerClient(containerName);

  return containerClient;
}

/**
 * Faz upload de um arquivo para o Azure Blob Storage
 * @param fileBuffer Buffer do arquivo
 * @param fileName Nome do arquivo
 * @param contentType Tipo MIME do arquivo
 * @returns URL do arquivo no blob storage
 */
export async function uploadToBlob(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const client = getContainerClient();

    // Garante que o container existe
    await client.createIfNotExists({
      access: 'blob', // Permite acesso público aos blobs
    });

    // Gera nome único para o arquivo
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const blockBlobClient = client.getBlockBlobClient(uniqueFileName);

    // Faz upload
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });

    // Retorna a URL do arquivo
    return blockBlobClient.url;
  } catch (error) {
    console.error('Erro ao fazer upload para Azure Blob:', error);
    throw new Error(`Erro ao fazer upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Deleta um arquivo do Azure Blob Storage
 * @param blobUrl URL do arquivo no blob storage
 */
export async function deleteFromBlob(blobUrl: string): Promise<void> {
  try {
    const client = getContainerClient();
    
    // Extrai o nome do blob da URL
    const urlParts = blobUrl.split('/');
    const blobName = urlParts[urlParts.length - 1];
    
    const blockBlobClient = client.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (error) {
    console.error('Erro ao deletar do Azure Blob:', error);
    // Não lança erro para não quebrar o fluxo se o arquivo não existir
  }
}

/**
 * Verifica se o Azure Blob Storage está configurado
 */
export function isBlobStorageConfigured(): boolean {
  return !!process.env.AZURE_STORAGE_CONNECTION_STRING;
}
