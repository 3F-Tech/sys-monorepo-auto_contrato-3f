import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { GoogleDriveService } from '../services/googleDriveService';
import { GoogleDocsService } from '../services/googleDocsService';

import { contractSubmissionSchema } from '../schemas/contractSubmissionSchema';

const prisma = new PrismaClient();

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
    'Plano Growth - Seed': '15P5I0MhrwF4wkkFy2v9oIeB8arMyB8TMR9nzLw42iM4',
    'Assessoria': '1FBlxNQ7r-BDFsriSB72F5zxWr6jqteUZ8w3LAfr8eBQ',
    'Consultoria': '10cx6WNRcJSplUcY7WggABKkGqfGGDcB7I-4lAINcxKA',
    'Assessoria + Social Media (Ilimitado)': '13ShCNPFGRe7XWmkJtTZ213XRX1lmwuUTxEjbFQFEsmc',
    'Assessoria + Social Media (Qtd Min Artes)': '1DqgtHInYhir1q64c_Wr19AyZXVZQyqPUWKGV_23uUO8',
    'Assessoria + Social Media (Qtd Min Determinada)': '1eJzhAPw-nxdaG6zUj2W64uf5rsLec98-ImJwPApFFsM',
    'Assessoria + Social Media (Qtd Min Vídeos)': '1DNbKtpXEZvkKLzsxiEPzmDn8_ixng8fdVgWEmBhPO4o',
    'Social Media (Ilimitado)': '1Aa0wRtJ89zV5XWN_nZF8JH-y5BxhMBaqwwOCfzCE_Eo',
    'Social Media (Qtd Min Determinada)': '1br3UGbs6rQhemK9NPCv1X1Ofb-voY2h_eq9zE5-KVhQ'
};

// Mapeamento de Nomes formais para Contratos BOMMA
const BOMMA_CONTRACT_NAMES: Record<string, string> = {
    'Social Media (Qtd Min Determinada)': 'CONTRATO SOCIAL MEDIA (QTD MINIMA DETERMINADA)',
    'Social Media (Ilimitado)': 'CONTRATO SOCIAL MEDIA (ILIMITADO)',
    'Consultoria': 'CONTRATO CONSULTORIA',
    'Assessoria + Social Media (Qtd Min Vídeos)': 'CONTRATO ASSESSORIA E SOCIAL MEDIA (QTD MINIMA VIDEOS)',
    'Assessoria + Social Media (Qtd Min Determinada)': 'CONTRATO ASSESSORIA E SOCIAL MEDIA (QTD MINIMA DETERMINADA)',
    'Assessoria + Social Media (Qtd Min Artes)': 'CONTRATO ASSESSORIA E SOCIAL MEDIA (QTD MINIMA ARTES)',
    'Assessoria + Social Media (Ilimitado)': 'CONTRATO ASSESSORIA E SOCIAL MEDIA (ILIMITADO)',
    'Assessoria': 'CONTRATO ASSESSORIA'
};

/**
 * Helper genérico para processar a submissão de contratos.
 * Realiza validação Zod, automação no Google Drive/Docs e persistência no banco.
 */
const handleContractSubmit = async (req: any, res: Response, sheetName: string) => {
    const startTime = Date.now();
    console.log(`[INÍCIO] Processando submissão de contrato: ${sheetName}`);
    
    try {
        // 1. Validar com Zod
        const validation = contractSubmissionSchema.safeParse(req.body);

        if (!validation.success) {
            const errorMessages = validation.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }));
            console.warn(`[AVISO] Falha na validação Zod para ${sheetName}:`, JSON.stringify(errorMessages));
            return res.status(400).json({
                error: 'Falha na validação dos dados',
                details: errorMessages
            });
        }

        const { data, bu_id, bu_name } = validation.data;
        const user = req.user;

        // 2. Automação de Cópia e Edição no Google Drive/Docs
        let generatedFileLink = null;
        if (MODEL_IDS[sheetName as keyof typeof MODEL_IDS]) {
            const driveStartTime = Date.now();
            const modelId = MODEL_IDS[sheetName as keyof typeof MODEL_IDS];
            const destinationFolderId = (DESTINATION_FOLDERS as any)[(bu_name || 'IMPULSE').toUpperCase()] || DESTINATION_FOLDERS.IMPULSE;
            const razaoSocial = data['RAZAO SOCIAL DO CONTRATANTE'] || 'Sem Nome';
            const finalBuName = bu_name || 'BU';
            
            // Determina o nome do arquivo (Rename para BOMMA conforme solicitado)
            let fileName = `${razaoSocial} & ${finalBuName} (${sheetName})`;
            if (finalBuName.toUpperCase() === 'BOMMA' && BOMMA_CONTRACT_NAMES[sheetName]) {
                fileName = `${razaoSocial} & BOMMA ASSESSORIA DE MARKETING LTDA - ${BOMMA_CONTRACT_NAMES[sheetName]}`;
            }

            console.log(`[DRIVE] Iniciando cópia do arquivo modelo: ${modelId}`);
            const newFile = await GoogleDriveService.copyFile(modelId, destinationFolderId, fileName);
            
            if (newFile && newFile.id) {
                console.log(`[DRIVE] Arquivo copiado com sucesso! ID: ${newFile.id}. Tempo: ${Date.now() - driveStartTime}ms`);
                
                const docsStartTime = Date.now();
                // Mapeamento de variáveis para o Google Docs (convertendo espaços para traços conforme o modelo)
                const replacements: Record<string, string> = {};
for (const [key, value] of Object.entries(data)) {
                    let valStr = String(value || '');
                    
                    // Garante que o Instagram tenha o @ para o documento
                    if (key === 'LINK INSTAGRAM CONTRATANTE' && valStr && !valStr.startsWith('@')) {
                        valStr = `@${valStr}`;
                    }

                    // Garante que valores monetários tenham o R$ para o documento
                    if ((key.includes('VALOR MENSALIDADE') || key.includes('VALOR TAXA IMPLEMENTACAO')) && valStr && !valStr.includes('R$')) {
                        valStr = `R$ ${valStr}`;
                    }

                    replacements[key.replace(/ /g, '-')] = valStr;
                    replacements[key.replace(/ /g, '_')] = valStr;
                }

                // Mapeamentos específicos extras conforme o modelo extraído
                replacements['NOME-REPRESENTANTE-CONTRATANTE'] = data['NOME DO REPRESENTANTE'] || '';
                replacements['CPF-REPRESENTANTE-CONTRATANTE'] = data['CPF DO REPRESENTANTE'] || '';

                console.log(`[DOCS] Substituindo variáveis no documento...`);
                await GoogleDocsService.replaceVariables(newFile.id, replacements);
                generatedFileLink = `https://docs.google.com/document/d/${newFile.id}/edit`;
                console.log(`[DOCS] Variáveis substituídas! Tempo: ${Date.now() - docsStartTime}ms`);
            }
        }

        // 3. Salvar no Banco de Dados
        const dbStartTime = Date.now();
        const razaoSocial = data['RAZAO SOCIAL DO CONTRATANTE'] || 'Sem Nome';
        const finalBuName = bu_name || 'BU';
        
        // Título padronizado para o banco (Segue o mesmo do arquivo se for BOMMA)
        let title = `${razaoSocial} & ${finalBuName} (${sheetName})`;
        if (finalBuName.toUpperCase() === 'BOMMA' && BOMMA_CONTRACT_NAMES[sheetName]) {
            title = `${razaoSocial} & BOMMA ASSESSORIA DE MARKETING LTDA - ${BOMMA_CONTRACT_NAMES[sheetName]}`;
        }
        
        const isGrowth = sheetName.toLowerCase().includes('growth');

        // Conversão de valores para o banco
        const parseDecimal = (val: any) => {
            if (val === undefined || val === null || val === '') return null;
            const cleaned = String(String(val)).replace(/\./g, '').replace(',', '.');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? null : parsed;
        };

        const parseDate = (val: any) => {
            if (val === undefined || val === null || val === '') return null;

            // Tenta converter DD/MM/YYYY
            if (typeof val === 'string' && val.includes('/')) {
                const parts = val.split('/');
                if (parts.length === 3) {
                    const [day, month, year] = parts;
                    const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
                    return isNaN(date.getTime()) ? null : date;
                }
            }

            // Fallback para conversão direta (ISO strings, etc)
            const date = new Date(val);
            return isNaN(date.getTime()) ? null : date;
        };

        const parseInteger = (val: any) => {
            if (val === undefined || val === null || val === '') return null;
            const parsed = parseInt(String(val));
            return isNaN(parsed) ? null : parsed;
        };

        await prisma.contracts.create({
            data: {
                title,
                cnpj_client: data['CNPJ DO CONTRATANTE'] || '',
                seller_id: BigInt(user.id),
                bu_id: Number(bu_id),
                monthly_fee: parseDecimal(data['VALOR MENSALIDADE']),
                implementation_fee: parseDecimal(data['VALOR TAXA IMPLEMENTACAO']),
                contractual_term: isGrowth ? null : parseInteger(data['PRAZO CONTRATUAL MESES']),
                due_date: parseDate(data['DATA PRIMEIRO PAGAMENTO']),
                type_contract: sheetName,
                signed: false,
                change_status: null,
                link: generatedFileLink
            }
        });
        console.log(`[DB] Registro criado no banco. Tempo: ${Date.now() - dbStartTime}ms`);

        const totalTime = Date.now() - startTime;
        console.log(`[FIM] Contrato processado com sucesso em ${totalTime}ms`);

        res.json({
            success: true,
            message: `Dados processados com sucesso. Contrato gerado.`,
            link: generatedFileLink,
            processingTime: totalTime
        });
    } catch (error: any) {
        console.error(`[ERRO] Falha ao processar contrato ${sheetName}:`, error);
        res.status(500).json({ error: 'Falha ao processar contrato', details: error.message });
    }
};

/**
 * @openapi
 * /contracts-sheets/impulse-plano-1:
 *   post:
 *     summary: Submeter contrato Plano 1 - Impulse
 *     tags:
 *       - Contract Automation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/ContractData'
 *               bu_id:
 *                 type: integer
 *               bu_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso
 */
export const submitImpulsePlano1 = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano 1 - Impulse');

/**
 * @openapi
 * /contracts-sheets/impulse-plano-2:
 *   post:
 *     summary: Submeter contrato Plano 2 - Impulse
 *     tags:
 *       - Contract Automation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/ContractData'
 *               bu_id:
 *                 type: integer
 *               bu_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso
 */
export const submitImpulsePlano2 = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano 2 - Impulse');

/**
 * @openapi
 * /contracts-sheets/seed-plano-1:
 *   post:
 *     summary: Submeter contrato Plano 1 - Seed
 *     tags:
 *       - Contract Automation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/ContractData'
 *               bu_id:
 *                 type: integer
 *               bu_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso
 */
export const submitSeedPlano1 = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano 1 - Seed');

/**
 * @openapi
 * /contracts-sheets/seed-plano-2:
 *   post:
 *     summary: Submeter contrato Plano 2 - Seed
 *     tags:
 *       - Contract Automation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/ContractData'
 *               bu_id:
 *                 type: integer
 *               bu_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso
 */
export const submitSeedPlano2 = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano 2 - Seed');

/**
 * @openapi
 * /contracts-sheets/seed-plano-growth:
 *   post:
 *     summary: Submeter contrato Plano Growth - Seed
 *     tags:
 *       - Contract Automation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/ContractData'
 *               bu_id:
 *                 type: integer
 *               bu_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso
 */
export const submitSeedGrowth = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano Growth - Seed');export const submitBommaAssessoria = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria');
export const submitBommaConsultoria = (req: Request, res: Response) => handleContractSubmit(req, res, 'Consultoria');
export const submitBommaAssessoriaSocialIlimitado = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Ilimitado)');
export const submitBommaAssessoriaSocialArtes = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Qtd Min Artes)');
export const submitBommaAssessoriaSocialDeterminada = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Qtd Min Determinada)');
export const submitBommaAssessoriaSocialVideos = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Qtd Min V�deos)');
export const submitBommaSocialIlimitado = (req: Request, res: Response) => handleContractSubmit(req, res, 'Social Media (Ilimitado)');
export const submitBommaSocialDeterminada = (req: Request, res: Response) => handleContractSubmit(req, res, 'Social Media (Qtd Min Determinada)');
