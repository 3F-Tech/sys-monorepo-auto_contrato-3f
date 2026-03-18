
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Projects/automacao_contratos/apps/api/.env' });

async function exploreSharedDrives() {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    console.log('--- Listando Drives Compartilhados ---');
    const response = await drive.drives.list();
    const drives = response.data.drives || [];
    
    if (drives.length === 0) {
      console.log('Nenhum Drive Compartilhado encontrado. Verifique se a conta de serviço foi adicionada como participante.');
      return;
    }

    for (const d of drives) {
      console.log(`🚗 Drive: ${d.name} (${d.id})`);
      
      const filesResponse = await drive.files.list({
        q: "trashed = false",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        driveId: d.id as string,
        corpora: 'drive',
        fields: 'files(id, name, mimeType)',
      });

      const items = filesResponse.data.files || [];
      for (const item of items) {
        console.log(`   📄 [${item.mimeType}] ${item.name} (${item.id})`);
      }
    }

  } catch (error: any) {
    console.error(`❌ Erro: ${error.message}`);
  }
}

exploreSharedDrives();
