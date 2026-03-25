import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: "c:/Projects/automacao_contratos/apps/api/.env" });

async function checkFileLocation() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}");
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });
  const fileId = "1E2zHJstMemuUhvB-9u7AY83ioYy8Ic3H";

  try {
    const response = await drive.files.get({
      fileId,
      supportsAllDrives: true,
      fields: "id, name, parents, driveId",
    });
    console.log(`Arquivo: ${response.data.name}`);
    console.log(`Parents: ${response.data.parents}`);
    console.log(`Drive ID: ${response.data.driveId}`);
  } catch (error: any) {
    console.error(`❌ Erro: ${error.message}`);
  }
}

checkFileLocation();
