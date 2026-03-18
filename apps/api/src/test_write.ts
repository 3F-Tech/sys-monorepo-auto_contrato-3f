
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Projects/automacao_contratos/apps/api/.env' });

async function testWrite() {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const destinationFolderId = '1E2zHJstMemuUhvB-9u7AY83ioYy8Ic3H';

  try {
    console.log('--- Testando Escrita no Drive Compartilhado ---');
    const response = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: 'TESTE_ESCRITA.txt',
        parents: [destinationFolderId],
        mimeType: 'text/plain',
      },
      media: {
        mimeType: 'text/plain',
        body: 'Teste de escrita Antigravity',
      },
    });
    console.log(`✅ Sucesso! Arquivo criado com ID: ${response.data.id}`);
  } catch (error: any) {
    console.error(`❌ Erro: ${error.message}`);
  }
}

testWrite();
