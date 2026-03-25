
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents'
];

export class GoogleDriveService {
  private static auth: any;

  private static getAuth() {
    if (this.auth) return this.auth;
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
    this.auth = google.auth.fromJSON(credentials);
    this.auth.scopes = SCOPES;
    return this.auth;
  }

  /**
   * Copia um arquivo (modelo) para uma pasta de destino específica.
   * @param fileId ID do arquivo modelo
   * @param destinationFolderId ID da pasta de destino
   * @param newFileName Nome para o novo arquivo copiado
   */
  static async copyFile(fileId: string, destinationFolderId: string, newFileName: string, retries = 3) {
    const auth = this.getAuth();
    const drive = google.drive({ version: 'v3', auth });

    for (let i = 0; i < retries; i++) {
        try {
            const response = await drive.files.copy({
                fileId: fileId,
                supportsAllDrives: true,
                requestBody: {
                    name: newFileName,
                    parents: [destinationFolderId],
                },
            });
            return response.data;
        } catch (error: any) {
            const isRateLimit = error.code === 403 || error.message?.includes('Rate limit exceeded');
            if (isRateLimit && i < retries - 1) {
                const delay = Math.pow(2, i) * 2000;
                console.warn(`[DRIVE] Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            console.error('Error copying file in Google Drive:', error);
            throw error;
        }
    }
  }

  /**
   * Lista arquivos de uma pasta (útil para auditoria ou seleção de modelos).
   */
  static async listFiles(folderId: string) {
    const auth = this.getAuth();
    const drive = google.drive({ version: 'v3', auth });

    try {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fields: 'files(id, name, mimeType)',
      });
      return response.data.files;
    } catch (error) {
      console.error('Error listing files in Google Drive:', error);
      throw error;
    }
  }

  /**
   * Exporta um documento do Google Docs para PDF e retorna como Base64.
   * @param fileId ID do arquivo no Google Drive
   */
  static async exportFileToPDF(fileId: string): Promise<string> {
    const auth = this.getAuth();
    const drive = google.drive({ version: 'v3', auth });

    try {
      const response = await drive.files.export(
        {
          fileId: fileId,
          mimeType: 'application/pdf',
        },
        { responseType: 'arraybuffer' }
      );

      const buffer = Buffer.from(response.data as ArrayBuffer);
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error exporting file to PDF:', error);
      throw error;
    }
  }

  /**
   * Deleta um arquivo permanentemente do Google Drive.
   * @param fileId ID do arquivo no Google Drive
   */
  static async deleteFile(fileId: string) {
    const auth = this.getAuth();
    const drive = google.drive({ version: 'v3', auth });

    try {
      await drive.files.delete({
        fileId: fileId,
        supportsAllDrives: true,
      });
      console.log(`[DRIVE] Arquivo ${fileId} deletado com sucesso.`);
      return true;
    } catch (error: any) {
      // Se o arquivo já não existir, tratamos como sucesso na exclusão
      if (error.code === 404) {
        console.warn(`[DRIVE] Arquivo ${fileId} não encontrado (provavelmente já deletado).`);
        return true;
      }
      console.error(`[DRIVE] Erro ao deletar arquivo ${fileId}:`, error);
      throw error;
    }
  }
}
