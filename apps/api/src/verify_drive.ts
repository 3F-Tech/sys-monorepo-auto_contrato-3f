import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: "c:/Projects/automacao_contratos/apps/api/.env" });

async function exportAndAnalyze() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}");
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });
  const fileId = "1OsvgXVgRX0kvUhFjz1a83_g63Nqkwv8bEdqKIaTpEzI";

  try {
    const response = await drive.files.export({
      fileId: fileId,
      mimeType: "text/plain",
    });

    const content = response.data as string;
    const regex = /\{\{([\s\S]+?)\}\}/g;
    const variables = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }

    console.log(
      "--- Variáveis encontradas no documento (Export via Drive) ---",
    );
    variables.forEach((v) => console.log(`- ${v}`));
  } catch (error: any) {
    console.error(`❌ Erro: ${error.message}`);
  }
}

exportAndAnalyze();
