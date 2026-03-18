import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { GoogleSheetsService } from '../services/googleSheetsService';
import { GoogleDriveService } from '../services/googleDriveService';
import { GoogleDocsService } from '../services/googleDocsService';

const prisma = new PrismaClient();
const SPREADSHEET_ID = '1ZQu2yrEEDCmuILw4GlTVVj1miHNcMKo9FgcKoWObqSk';

// IDs das Pastas de Destino por BU (conforme google-drive.rule.md)
const DESTINATION_FOLDERS = {
    'IMPULSE': '1E2zHJstMemuUhvB-9u7AY83ioYy8Ic3H',
    'SEED': '1zymZvOkAOgdnfz5s9m7FnMELDneTIIwF',
    'BOMMA': '1oChogkEyQpZMZzFMPjOEuz_Dt542JRUW'
};

// IDs dos Modelos (IDs extraídos via verify_drive.ts)
const MODEL_IDS = {
    'Plano 1 - Impulse': '1OsvgXVgRX0kvUhFjz1a83_g63Nqkwv8bEdqKIaTpEzI',
    'Plano 2 - Impulse': '1spS9qELVjiyJ9mnmXAHu1denp0-15yAaiZetlDj2sME',
    'Plano 1 - Seed': '1GCXFr7e9V65SHIEprRMq2u4d2oli2rDQnwTeQ_jZPBo',
    'Plano 2 - Seed': '1KYJ2DzZtpHILHvT4N55Gr05qU7afpnXkBy50zTVLwIw',
    'Plano Growth - Seed': '15P5I0MhrwF4wkkFy2v9oIeB8arMyB8TMR9nzLw42iM4'
};

const getContractRow = (data: any, isGrowth: boolean = false) => {
    const row = [
        data['RAZAO SOCIAL DO CONTRATANTE'] || '', // A
        data['CNPJ DO CONTRATANTE'] || '',         // B
        data['LOGRADOURO DO CONTRATANTE'] || '',    // C
        data['NUMERO DO CONTRATANTE'] || '',       // D
        data['BAIRRO DO CONTRATANTE'] || '',       // E
        data['CIDADE DO CONTRATANTE'] || '',       // F
        data['UF DO CONTRATANTE'] || '',           // G
        data['CEP DO CONTRATANTE'] || '',           // H
        data['CARGO DO REPRESENTANTE'] || '',      // I
        data['NOME DO REPRESENTANTE'] || '',       // J
        data['CPF DO REPRESENTANTE'] || '',        // K
        data['VALOR TAXA IMPLEMENTACAO'] || '',     // L
        data['VALOR MENSALIDADE'] || '',           // M
        data['DATA PRIMEIRO PAGAMENTO'] || '',     // N
        data['DIA VENCIMENTO MENSAL'] || '',       // O
        data['PRAZO CONTRATUAL MESES'] || '',      // P (Removido se for Growth)
        data['DATA ASSINATURA CONTRATO'] || '',    // Q -> P se Growth
        data['NOME DO REPRESENTANTE'] || '',       // R -> Q se Growth
        data['CPF DO REPRESENTANTE'] || '',        // S -> R se Growth
        data['NOME TESTEMUNHA 1'] || '',           // T -> S se Growth
        data['CPF TESTEMUNHA 1'] || '',            // U -> T se Growth
        data['NOME VENDEDOR'] || '',               // V -> U se Growth
        data['CPF VENDEDOR'] || '',                // W -> V se Growth
        data['NOME COORD BU'] || '',               // X -> W se Growth
        data['CPF COORD BU'] || '',                // Y -> X se Growth
    ];

    if (isGrowth) {
        // Remove a coluna P (índice 15) para o Plano Growth
        row.splice(15, 1);
    }

    return row;
};

const handleContractSubmit = async (req: any, res: Response, sheetName: string) => {
    try {
        const { data, bu_id, bu_name } = req.body;
        const user = req.user;

        if (!data) return res.status(400).json({ error: 'Dados não fornecidos' });

        // 1. Enviar para o Google Sheets
        const isGrowth = sheetName.toLowerCase().includes('growth');
        const row = getContractRow(data, isGrowth);
        const safeSheetName = sheetName.trim();

        await GoogleSheetsService.appendRow(SPREADSHEET_ID, safeSheetName, row);

        // 2. Automação de Cópia e Edição no Google Drive/Docs (Apenas para Plan 1 Impulse inicialmente)
        let generatedFileLink = null;
        if (MODEL_IDS[sheetName as keyof typeof MODEL_IDS]) {
            const modelId = MODEL_IDS[sheetName as keyof typeof MODEL_IDS];
            const destinationFolderId = (DESTINATION_FOLDERS as any)[bu_name?.toUpperCase()] || DESTINATION_FOLDERS.IMPULSE;
            const razaoSocial = data['RAZAO SOCIAL DO CONTRATANTE'] || 'Sem Nome';
            const finalBuName = bu_name || 'BU';
            const fileName = `${razaoSocial} & ${finalBuName} (${sheetName})`;

            const newFile = await GoogleDriveService.copyFile(modelId, destinationFolderId, fileName);
            if (newFile && newFile.id) {
                // Mapeamento de variáveis para o Google Docs (convertendo espaços para traços conforme o modelo)
                const replacements: Record<string, string> = {};
                for (const [key, value] of Object.entries(data)) {
                    const docKey = key.replace(/ /g, '-');
                    replacements[docKey] = String(value || '');
                }
                
                // Mapeamentos específicos extras conforme o modelo extraído
                replacements['NOME-REPRESENTANTE-CONTRATANTE'] = data['NOME DO REPRESENTANTE'] || '';
                replacements['CPF-REPRESENTANTE-CONTRATANTE'] = data['CPF DO REPRESENTANTE'] || '';

                await GoogleDocsService.replaceVariables(newFile.id, replacements);
                generatedFileLink = `https://docs.google.com/document/d/${newFile.id}/edit`;
            }
        }

        // 3. Salvar no Banco de Dados
        const razaoSocial = data['RAZAO SOCIAL DO CONTRATANTE'] || 'Sem Nome';
        const finalBuName = bu_name || 'BU';
        const title = `${razaoSocial} & ${finalBuName} (${sheetName})`;
        
        // Conversão de valores para o banco
        const parseDecimal = (val: string) => {
            if (!val) return null;
            return parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
        };

        const parseDate = (val: string) => {
            if (!val) return null;
            const [day, month, year] = String(val).split('/');
            if (!year) return null;
            return new Date(`${year}-${month}-${day}T12:00:00Z`);
        };

        await prisma.contracts.create({
            data: {
                title,
                cnpj_client: data['CNPJ DO CONTRATANTE'] || '',
                seller_id: BigInt(user.id),
                bu_id: Number(bu_id),
                monthly_fee: parseDecimal(data['VALOR MENSALIDADE']),
                implementation_fee: parseDecimal(data['VALOR TAXA IMPLEMENTACAO']),
                contractual_term: isGrowth ? null : parseInt(data['PRAZO CONTRATUAL MESES']),
                due_date: parseDate(data['DATA PRIMEIRO PAGAMENTO']),
                type_contract: sheetName,
                signed: false,
                change_status: null,
                link: generatedFileLink
            }
        });

        res.json({ 
            success: true, 
            message: `Dados processados com sucesso. Contrato: ${generatedFileLink || 'Via Sheets'}`,
            link: generatedFileLink
        });
    } catch (error: any) {
        console.error(`Error submitting to ${sheetName}:`, error);
        res.status(500).json({ error: 'Falha ao processar contrato', details: error.message });
    }
};

export const submitImpulsePlano1 = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano 1 - Impulse');
export const submitImpulsePlano2 = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano 2 - Impulse');
export const submitSeedPlano1 = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano 1 - Seed');
export const submitSeedPlano2 = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano 2 - Seed');
export const submitSeedGrowth = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano Growth - Seed');