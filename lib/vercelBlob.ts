import { put, del } from '@vercel/blob';

/**
 * Faz upload de um arquivo para o Vercel Blob Storage
 * @param fileBuffer Buffer do arquivo
 * @param fileName Nome do arquivo
 * @param contentType Tipo MIME do arquivo
 * @returns URL do arquivo no blob storage
 */
export async function uploadToVercelBlob(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN não configurado');
    }

    // Faz upload para Vercel Blob
    const blob = await put(fileName, fileBuffer, {
      access: 'public',
      contentType,
      token,
    });

    return blob.url;
  } catch (error) {
    console.error('Erro ao fazer upload para Vercel Blob:', error);
    throw new Error(`Erro ao fazer upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Deleta um arquivo do Vercel Blob Storage
 * @param blobUrl URL do arquivo no blob storage
 */
export async function deleteFromVercelBlob(blobUrl: string): Promise<void> {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      throw new Error('BLOB_READ_WRITE_TOKEN não configurado');
    }

    await del(blobUrl, { token });
  } catch (error) {
    console.error('Erro ao deletar do Vercel Blob:', error);
    // Não lança erro para não quebrar o fluxo se o arquivo não existir
  }
}

/**
 * Verifica se o Vercel Blob Storage está configurado
 */
export function isVercelBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}
