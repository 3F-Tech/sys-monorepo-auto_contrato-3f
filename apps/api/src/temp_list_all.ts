
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Projects/automacao_contratos/apps/api/.env' });

async function listAllAccessible() {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    const response = await drive.files.list({
      pageSize: 20,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    
    console.log('--- Ultimos 20 arquivos acessíveis ---');
    response.data.files?.forEach(f => console.log(`- ${f.name} (ID: ${f.id}, Type: ${f.mimeType})`));
  } catch (error: any) {
    console.error(`❌ Erro: ${error.message}`);
  }
}

listAllAccessible();
