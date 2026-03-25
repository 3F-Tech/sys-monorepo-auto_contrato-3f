import { GoogleDriveService } from '../apps/api/src/services/googleDriveService';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

async function main() {
  const folderId = '1oChogkEyQpZMZzFMPjOEuz_Dt542JRUW'; // BOMMA Folder
  console.log(`Checking files in folder: ${folderId}`);
  
  try {
    const files = await GoogleDriveService.listFiles(folderId);
    console.log('Success! Files found:', files?.length);
    if (files) {
        files.forEach((f: any) => console.log(`- ${f.name} (${f.id})`));
    }
  } catch (error: any) {
    console.error('FAILED to list files:');
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
        console.error(error);
    }
  }
}

main();
