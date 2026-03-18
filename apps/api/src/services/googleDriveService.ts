
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
  static async copyFile(fileId: string, destinationFolderId: string, newFileName: string) {
    const auth = this.getAuth();
    const drive = google.drive({ version: 'v3', auth });

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
    } catch (error) {
      console.error('Error copying file in Google Drive:', error);
      throw error;
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
}
