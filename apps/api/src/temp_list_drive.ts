import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: "c:/Projects/automacao_contratos/apps/api/.env" });

async function checkFolder() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}");
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });
  const folderId = "1NkfGzmFXkpRsDl2RIwGszvip4vwTm7Nq";

  try {
    const response = await drive.files.get({
      fileId: folderId,
      fields: "id, name, mimeType",
      supportsAllDrives: true,
    });

    console.log("--- Metadata da Pasta ---");
    console.log(response.data);

    const listResponse = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    console.log("--- Arquivos na pasta ---");
    listResponse.data.files?.forEach((f) =>
      console.log(`- ${f.name} (ID: ${f.id}, Type: ${f.mimeType})`),
    );
  } catch (error: any) {
    console.error(`❌ Erro: ${error.message}`);
  }
}

checkFolder();
