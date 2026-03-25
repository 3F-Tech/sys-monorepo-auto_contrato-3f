
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/documents',
];

export class GoogleDocsService {
  private static auth: any;

  private static getAuth() {
    if (this.auth) return this.auth;
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
    this.auth = google.auth.fromJSON(credentials);
    this.auth.scopes = SCOPES;
    return this.auth;
  }

  /**
   * Substitui variáveis no formato {{ VAR }} por valores reais.
   * @param documentId ID do documento no Google Docs
   * @param replacements Objeto com chave sendo o nome da variável e valor o texto substituto
   */
  static async replaceVariables(documentId: string, replacements: Record<string, string>) {
    const auth = this.getAuth();
    const docs = google.docs({ version: 'v1', auth });

    const requests = Object.entries(replacements).flatMap(([key, value]) => [
      {
        replaceAllText: {
          containsText: {
            text: `{{${key}}}`,
            matchCase: true,
          },
          replaceText: value || '',
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: `{{ ${key} }}`,
            matchCase: true,
          },
          replaceText: value || '',
        },
      }
    ]);

    if (requests.length === 0) return;

    try {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests,
        },
      });
    } catch (error) {
      console.error('Error replacing variables in Google Doc:', error);
      throw error;
    }
  }
}
