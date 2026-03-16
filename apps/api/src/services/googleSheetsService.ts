import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export class GoogleSheetsService {
    private static auth: any;

    private static getAuth() {
        if (this.auth) return this.auth;

        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
        
        // Service Account authentication
        this.auth = google.auth.fromJSON(credentials);
        this.auth.scopes = SCOPES;
        
        return this.auth;
    }

    static async appendRow(spreadsheetId: string, range: string, values: any[]) {
        const auth = this.getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        try {
            const response = await sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [values],
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error appending row to Google Sheets:', error);
            throw error;
        }
    }
}
