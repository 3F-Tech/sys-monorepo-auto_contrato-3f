import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { GoogleSheetsService } from '../services/googleSheetsService';

const prisma = new PrismaClient();
const SPREADSHEET_ID = '1ZQu2yrEEDCmuILw4GlTVVj1miHNcMKo9FgcKoWObqSk';

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

        // 2. Salvar no Banco de Dados
        const razaoSocial = data['RAZAO SOCIAL DO CONTRATANTE'] || 'Sem Nome';
        const finalBuName = bu_name || 'BU';
        const title = `${razaoSocial} & ${finalBuName} (${sheetName})`;
        
        // Conversão de valores para o banco
        const parseDecimal = (val: string) => {
            if (!val) return null;
            return parseFloat(val.replace(/\./g, '').replace(',', '.'));
        };

        const parseDate = (val: string) => {
            if (!val) return null;
            const [day, month, year] = val.split('/');
            return new Date(`${year}-${month}-${day}T12:00:00Z`); // Meio-dia para evitar problemas de fuso
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
                link: null
            }
        });

        res.json({ success: true, message: `Dados enviados para ${sheetName} e salvos no banco com sucesso` });
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