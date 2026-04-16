import { Request, Response } from 'express';
import { GoogleDriveService } from '../services/googleDriveService';
import { GoogleDocsService } from '../services/googleDocsService';
import { ClickSignService } from '../services/clickSignService';
import { OpenAIService } from '../services/openaiService';
import { contractSubmissionSchema } from '../schemas/contractSubmissionSchema';
import { prisma } from '../prisma';
import { progressTracker } from '../utils/progressTracker';

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
 * Funções Auxiliares e Lógica de Negócio do Clicksign
 */

const BU_SIGNERS_MAP: Record<string, { name: string, email: string, cpf: string }> = {
    'BOMMA': { name: 'Natália Selister Piccoli', email: 'natalia@3fventure.com.br', cpf: '013.266.710-06' },
    'SEED': { name: 'Luís Fernando Mauri Menti', email: 'luisfernando@3fventure.com.br', cpf: '023.275.400-46' },
    'IMPULSE': { name: 'Luís Fernando Mauri Menti', email: 'luisfernando@3fventure.com.br', cpf: '023.275.400-46' }
};

/**
 * Executa o fluxo completo do Clicksign v3 (Envelopes)
 */
const executeClickSignv3Flow = async (params: {
    contractId: bigint,
    fileId: string,
    fileName: string,
    buName: string,
    signerName: string,
    signerEmail: string,
    signerCpf: string,
    witnessEmails: string[],
    trackingId?: string,
    debugMode?: any,
    sellerName?: string,
    sellerEmail?: string,
    sellerCpf?: string,
    coordName?: string,
    coordEmail?: string,
    coordCpf?: string,
    headName?: string,
    headEmail?: string,
    headCpf?: string
}) => {
    const { contractId, fileId, fileName, buName, signerName, signerEmail, signerCpf, witnessEmails, trackingId, debugMode, sellerName, sellerEmail, sellerCpf, coordName, coordEmail, coordCpf, headName, headEmail, headCpf } = params;
    const clicksignStartTime = Date.now();

    console.log(`[CLICKSIGN] Iniciando exportação PDF e upload para Clicksign para contrato ${contractId}...`);
    if (trackingId) {
        progressTracker.emitProgress(trackingId, {
            status: 'processing',
            progress: 60,
            step: 'Clicksign: Exportando PDF...',
            log: 'Convertendo Google Doc para PDF'
        });
    }

    // 1. Exporta Doc para PDF (Base64)
    const pdfBase64 = await GoogleDriveService.exportFileToPDF(fileId);

    console.log('[CLICKSIGN] Iniciando fluxo v3 (Envelopes)...');

    // 2. Criar Envelope (v3)
    const envelope = await ClickSignService.createEnvelope(fileName);
    const envelopeId = envelope.id;
    console.log(`[CLICKSIGN v3] Envelope criado: ${envelopeId}`);

    if (trackingId) {
        progressTracker.emitProgress(trackingId, {
            status: 'processing',
            progress: 70,
            step: 'Clicksign: Criando envelope v3...',
            log: `ID: ${envelopeId}`
        });
    }

    const document = await ClickSignService.addDocumentToEnvelope(envelopeId, fileName, pdfBase64);
    const documentId = document.id;
    console.log(`[CLICKSIGN v3] Documento adicionado: ${documentId}`);

    // === REGRA DE SISTEMA: DEBUG PREENCHER (IMPULSE PLANO 1) ===
    const isImpulseP1 = fileName.toLowerCase().includes('plano 1 - impulse');
    const isPreencherDebug = isImpulseP1 && (debugMode === 'preencher' || signerEmail?.toLowerCase() === 'mateus@3fventure.com.br');

    // 3. Preparar Signatários (v3)
    const signersToProcess: any[] = [];

    if (isPreencherDebug) {
        console.log('[DEBUG] Ativando regra "preencher" para Impulse Plano 1. Ignorando signatários padrão...');
        // O contratante (Cliente) é o Mateus
        signersToProcess.push({
            email: 'mateus@3fventure.com.br',
            name: 'Mateus (Contratante)',
            role: 'contractor'
        });
        // O vendedor representa a Contratada (BU) - Maysson
        signersToProcess.push({
            email: 'maysson@3fventure.com.br',
            name: 'Maysson (Vendedor/Contratada)',
            role: 'contractee'
        });
    } else {
        // 3a. Signatário Contratante (Cliente)
        if (signerEmail && signerName) {
            signersToProcess.push({
                email: signerEmail,
                name: signerName,
                cpf: signerCpf,
                role: 'contractor'
            });
        }

        // 3b. Signatário Contratada (BU)
        const buKey = Object.keys(BU_SIGNERS_MAP).find(k => buName.toUpperCase().includes(k));
        if (buKey) {
            const signerData = { ...BU_SIGNERS_MAP[buKey] };

            if (debugMode === true || debugMode === 'true') {
                const targetEmails = [
                    'luisfernando@3fventure.com.br',
                    'natalia@3fventure.com.br'
                ];
                if (targetEmails.includes(signerData.email.toLowerCase())) {
                    signerData.email = signerData.email.replace('@', '+test@');
                }
            }

            signersToProcess.push({
                ...signerData,
                role: 'contractee'
            });
        }

        // 3c. Vendedor e Testemunhas
        const addedEmails = new Set(signersToProcess.map(s => s.email.toLowerCase()));

        // Vendedor (se houver dados suficientes)
        if (sellerEmail && sellerName && !addedEmails.has(sellerEmail.toLowerCase())) {
            signersToProcess.push({
                email: sellerEmail,
                name: sellerName,
                cpf: sellerCpf,
                role: 'witness'
            });
            addedEmails.add(sellerEmail.toLowerCase());
        }

        // Coordenador da BU
        if (coordEmail && coordName && !addedEmails.has(coordEmail.toLowerCase())) {
            signersToProcess.push({
                email: coordEmail,
                name: `${coordName} (Coordenador)`,
                cpf: coordCpf,
                role: 'witness'
            });
            addedEmails.add(coordEmail.toLowerCase());
        }

        // Head da BU (Regra 6.5)
        if (headEmail && headName && !addedEmails.has(headEmail.toLowerCase())) {
            signersToProcess.push({
                email: headEmail,
                name: `${headName} (Head BU)`,
                cpf: headCpf,
                role: 'witness'
            });
            addedEmails.add(headEmail.toLowerCase());
        }

        // Testemunhas Adicionais
        const KNOWN_WITNESSES: Record<string, string> = {
            'natalia@3fventure.com.br': 'Natália Selister Piccoli',
            'luisfernando@3fventure.com.br': 'Luís Fernando Mauri Menti'
        };

        for (const email of witnessEmails) {
            if (email && !addedEmails.has(email.toLowerCase())) {
                const rawEmail = email.toLowerCase().replace(/\+test/g, '');

                let witnessName = KNOWN_WITNESSES[rawEmail];
                if (!witnessName) {
                    // Busca nome de Head/Sellers no banco de dados para evitar "Testemunha Adicional"
                    const sellerInfo = await prisma.sellers.findUnique({
                        where: { email: rawEmail }
                    });
                    if (sellerInfo && sellerInfo.name) {
                        witnessName = sellerInfo.name;
                    }
                }
                witnessName = witnessName || 'Testemunha Adicional';

                signersToProcess.push({
                    email: email,
                    name: witnessName,
                    role: 'witness'
                });
                addedEmails.add(email.toLowerCase());
            }
        }
    }

    const bulkOps: any[] = [];
    const addedSignersInfo: { id: string, name: string }[] = [];

    for (const s of signersToProcess) {
        if (trackingId) {
            progressTracker.emitProgress(trackingId, {
                status: 'processing',
                progress: 85,
                step: 'Clicksign: Adicionando signatários...',
                log: `Adicionando: ${s.name} (${s.role})`
            });
        }

        const signer = await ClickSignService.addSignerToEnvelope(envelopeId, s);
        const signerId = signer.id;
        addedSignersInfo.push({ id: signerId, name: s.name });

        bulkOps.push({
            op: 'add',
            ref: { type: 'requirements', id: envelopeId },
            data: {
                type: 'requirements',
                attributes: { action: 'provide_evidence', auth: 'email' },
                relationships: {
                    document: { data: { type: 'documents', id: documentId } },
                    signer: { data: { type: 'signers', id: signerId } }
                }
            }
        });

        bulkOps.push({
            op: 'add',
            ref: { type: 'requirements', id: envelopeId },
            data: {
                type: 'requirements',
                attributes: { action: 'agree', role: s.role },
                relationships: {
                    document: { data: { type: 'documents', id: documentId } },
                    signer: { data: { type: 'signers', id: signerId } }
                }
            }
        });
    }

    if (bulkOps.length > 0) {
        await ClickSignService.addBulkRequirements(envelopeId, bulkOps);
    }

    await ClickSignService.finalizeEnvelope(envelopeId);

    const signatureMessage = `Olá! Preciso da sua assinatura eletrônica no contrato ${fileName}. É bem simples, basta seguir o link da Clicksign!`;

    for (const info of addedSignersInfo) {
        await ClickSignService.sendNotification(envelopeId, info.id, signatureMessage);
    }

    return { envelopeId, documentId, signersCount: signersToProcess.length };
};

/**
 * Helper genérico para processar a submissão de contratos.
 * Realiza validação Zod, automação no Google Drive/Docs e persistência no banco.
 */
const handleContractSubmit = async (req: any, res: Response, sheetName: string) => {
    const startTime = Date.now();
    const trackingId = req.body.trackingId;
    console.log(`[INÍCIO] Processando submissão de contrato: ${sheetName} (trackingId: ${trackingId})`);

    // Emitir início do processamento
    if (trackingId) {
        progressTracker.emitProgress(trackingId, {
            status: 'processing',
            progress: 5,
            step: 'Iniciando processamento...',
            log: `Assunto: ${sheetName}`
        });
    }

    try {
        // 1. Validar com Zod
        const validation = contractSubmissionSchema.safeParse(req.body);

        if (!validation.success) {
            const errorMessages = validation.error.issues.map((issue: any) => ({
                field: issue.path.join('.'),
                message: issue.message
            }));
            console.warn(`[AVISO] Falha na validação Zod para ${sheetName}:`, JSON.stringify(errorMessages));
            return res.status(400).json({
                error: 'Falha na validação dos dados',
                details: errorMessages
            });
        }

        const { data, bu_id, bu_name, sdr_id } = validation.data;
        const isDebug = data['isDebug'];
        const user = req.user;

        // Declarations moved to function scope
        let generatedFileLink: string | null = null;
        let envelopeIdForDb: string | null = null;
        let envelopeIdToSave: string | null = null;
        let isAlreadySigned = false;
        const signersToProcess: any[] = [];

        const providedEnvelopeId = data['ID DO DOCUMENTO CLICKSIGN'];

        if (providedEnvelopeId) {
            console.log(`[CLICKSIGN] ID do Documento Clicksign fornecido: ${providedEnvelopeId}. Pulando automações...`);
            if (trackingId) {
                progressTracker.emitProgress(trackingId, {
                    status: 'processing',
                    progress: 50,
                    step: 'Verificando documento existente...',
                    log: `ID: ${providedEnvelopeId}`
                });
            }

            try {
                let status: string | null = null;

                // 1. Tenta buscar como um Envelope (v3)
                try {
                    const envelopeData = await ClickSignService.getEnvelope(providedEnvelopeId);
                    status = envelopeData?.attributes?.status;
                    console.log(`[CLICKSIGN] Buscado como Envelope v3: status ${status}`);
                } catch (e: any) {
                    // 2. Tenta buscar como um Documento (v1) se falhar como Envelope
                    console.log(`[CLICKSIGN] Não encontrado como Envelope v3. Buscando como Documento v1...`);
                    status = await ClickSignService.getDocumentStatusV1(providedEnvelopeId);
                    console.log(`[CLICKSIGN] Buscado como Documento v1: status ${status}`);
                }

                envelopeIdForDb = providedEnvelopeId;

                if (status && ['closed', 'completed', 'document_closed'].includes(status)) {
                    isAlreadySigned = true;
                    console.log(`[CLICKSIGN] Documento/Envelope ${providedEnvelopeId} já está completamente assinado!`);
                } else {
                    console.log(`[CLICKSIGN] Documento/Envelope ${providedEnvelopeId} encontrado, status atual: ${status}`);
                }
            } catch (err: any) {
                console.warn(`[CLICKSIGN] Não foi possível verificar o status de ${providedEnvelopeId}:`, err.message);
                envelopeIdForDb = providedEnvelopeId;
            }
        } else if (MODEL_IDS[sheetName as keyof typeof MODEL_IDS]) {
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
            if (trackingId) {
                progressTracker.emitProgress(trackingId, {
                    status: 'processing',
                    progress: 15,
                    step: 'Google Drive: Copiando modelo...',
                    log: `Template ID: ${modelId}`
                });
            }
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

                    // Não envia o e-mail do representante para o Google Docs (apenas banco)
                    if (key === 'EMAIL DO REPRESENTANTE') continue;
                    // Campos internos de negociação — não são variáveis do Google Docs
                    if (key.startsWith('NEGOTIATION_')) continue;

                    // Preserva a chave original com espaços
                    replacements[key] = valStr;
                    // Adiciona versões com hífen e underscore (padrão antigo)
                    replacements[key.replace(/ /g, '-')] = valStr;
                    replacements[key.replace(/ /g, '_')] = valStr;
                }

                // Atalhos universais conforme novos requisitos (Bomma)
                const buNameUpper = (bu_name || 'BU').toUpperCase();
                replacements['CONTRATANTE'] = data['RAZAO SOCIAL DO CONTRATANTE'] || '';

                // Mapeamento de Razão Social da Contratada (cada BU tem a sua)
                const BU_LEGAL_NAMES: Record<string, string> = {
                    'BOMMA': 'BOMMA ASSESSORIA DE MARKETING LTDA',
                    'SEED': 'SEED AGRO MARKETING LTDA',
                    'IMPULSE': 'IMPULSE GESTAO DE NEGOCIOS LTDA'
                };

                const buFound = Object.keys(BU_LEGAL_NAMES).find(k => buNameUpper.includes(k));
                replacements['CONTRATADA'] = buFound ? BU_LEGAL_NAMES[buFound] : '3F VENTURE GESTAO DE NEGOCIOS LTDA';

                // Cleanup: Garante que slots de testemunhas não preenchidos fiquem vazios no documento
                const allWitnessesForList: string[] = [];

                // 1. Limpeza dos placeholders de Testemunhas Fixas (1 a 6)
                // Eles NÃO entram na lista L1/L2 pois já possuem placeholders fixos no doc.
                for (let i = 1; i <= 6; i++) {
                    const nameKey = `NOME-TESTEMUNHA-FIXA-${i}`;
                    const cpfKey = `CPF-TESTEMUNHA-FIXA-${i}`;
                    const emailKey = `EMAIL-TESTEMUNHA-FIXA-${i}`;
                    if (!replacements[nameKey]) replacements[nameKey] = '';
                    if (!replacements[cpfKey]) replacements[cpfKey] = '';
                    if (!replacements[emailKey]) replacements[emailKey] = '';
                }

                // 2. Coleta Testemunhas Adicionais (1 a 6) para a lista L1/L2
                for (let i = 1; i <= 6; i++) {
                    const nameKey = `NOME-TESTEMUNHA-${i}`;
                    const cpfKey = `CPF-TESTEMUNHA-${i}`;
                    const name = replacements[nameKey];
                    const cpf = replacements[cpfKey];

                    if (name && cpf) {
                        // Adiciona o cabeçalho TESTEMUNHA para cada uma e quebra de linha extra para separar blocos
                        allWitnessesForList.push(`TESTEMUNHA\nNOME: ${name}\nCPF: ${cpf}\n`);
                    }
                    // Garante que o placeholder não fique sujo no doc
                    if (!replacements[nameKey]) replacements[nameKey] = '';
                    if (!replacements[cpfKey]) replacements[cpfKey] = '';
                }

                // 3. Distribui nas listas L1 e L2 para o Google Docs (para manter as 2 colunas alinhadas)
                const l1Witnesses: string[] = [];
                const l2Witnesses: string[] = [];

                allWitnessesForList.forEach((witness, index) => {
                    if (index % 2 === 0) {
                        l1Witnesses.push(witness);
                    } else {
                        l2Witnesses.push(witness);
                    }
                });

                // Join com \n para garantir espaçamento entre os blocos de cada coluna
                replacements['L1-TESTEMUNHAS'] = l1Witnesses.join('\n');
                replacements['L2-TESTEMUNHAS'] = l2Witnesses.join('\n');

                // Mapeamentos específicos extras conforme o modelo extraído
                replacements['NOME-REPRESENTANTE-CONTRATANTE'] = data['NOME DO REPRESENTANTE'] || '';
                replacements['CPF-REPRESENTANTE-CONTRATANTE'] = data['CPF DO REPRESENTANTE'] || '';

                // === VENDEDOR (testemunha no documento) ===
                const isCoord = user?.type === 'coord';
                const sellerName = data['NOME VENDEDOR'] || '';
                const sellerCpf = data['CPF VENDEDOR'] || '';

                // === COORDENADOR (testemunha no documento) ===
                // Busca do payload ou fallback automático para o coordenador da BU logado/cadastrado
                let coordName = data['NOME COORD BU'];
                let coordCpf = data['CPF COORD BU'];

                if (!coordName || !coordCpf) {
                    const dbCoord = await prisma.sellers.findFirst({
                        where: {
                            type: 'coord',
                            seller_business: {
                                some: { business_id: Number(bu_id) }
                            }
                        }
                    });
                    if (dbCoord) {
                        coordName = dbCoord.name || '';
                        coordCpf = dbCoord.cpf || '';
                    }
                }

                // --- APLICAÇÃO DA REGRA DE VISIBILIDADE ---
                if (isCoord) {
                    // Se for coordenador, o bloco de vendedor fica COMPLETAMENTE VAZIO
                    // Limpamos todas as variações possíveis (espaço, hífen, underline) para garantir
                    const keysToClear = [
                        'INFOS VENDEDOR', 'INFOS-VENDEDOR', 'INFOS_VENDEDOR',
                        'NOME VENDEDOR', 'NOME-VENDEDOR', 'NOME_VENDEDOR',
                        'CPF VENDEDOR', 'CPF-VENDEDOR', 'CPF_VENDEDOR'
                    ];
                    keysToClear.forEach(key => {
                        replacements[key] = '';
                    });

                    // O WitnessSection.vue coloca o NOME VENDEDOR no slot de testemunha fixa seguinte
                    // às testemunhas fixas (ex: slot 3). Quando o coord cria o contrato, o próprio
                    // nome do coord vai para esse slot. Precisamos limpá-lo.
                    if (sellerName) {
                        for (let i = 1; i <= 6; i++) {
                            if (replacements[`NOME-TESTEMUNHA-FIXA-${i}`] === sellerName) {
                                replacements[`NOME TESTEMUNHA FIXA ${i}`] = '';
                                replacements[`NOME-TESTEMUNHA-FIXA-${i}`] = '';
                                replacements[`CPF TESTEMUNHA FIXA ${i}`] = '';
                                replacements[`CPF-TESTEMUNHA-FIXA-${i}`] = '';
                                replacements[`EMAIL TESTEMUNHA FIXA ${i}`] = '';
                                replacements[`EMAIL-TESTEMUNHA-FIXA-${i}`] = '';
                                break;
                            }
                        }
                    }
                } else {
                    // Se for vendedor, preenchemos o bloco INFOS-VENDEDOR com os rótulos e dados
                    const block = sellerName && sellerCpf
                        ? `TESTEMUNHA\nNOME: ${sellerName}\nCPF: ${sellerCpf}`
                        : '';
                    
                    // Preenche todas as variações para garantir compatibilidade com qualquer template
                    replacements['INFOS VENDEDOR'] = block;
                    replacements['INFOS-VENDEDOR'] = block;
                    replacements['INFOS_VENDEDOR'] = block;

                    replacements['NOME VENDEDOR'] = sellerName;
                    replacements['NOME-VENDEDOR'] = sellerName;
                    replacements['NOME_VENDEDOR'] = sellerName;

                    replacements['CPF VENDEDOR'] = sellerCpf;
                    replacements['CPF-VENDEDOR'] = sellerCpf;
                    replacements['CPF_VENDEDOR'] = sellerCpf;
                }

                // O Coordenador sempre é preenchido em suas variáveis específicas
                replacements['NOME-COORDENADOR'] = coordName || '';
                replacements['CPF-COORDENADOR'] = coordCpf || '';
                replacements['NOME-COORD-BU'] = coordName || '';
                replacements['CPF-COORD-BU'] = coordCpf || '';
                replacements['INFOS-COORDENADOR'] = (coordName && coordCpf)
                    ? `TESTEMUNHA\nNOME: ${coordName}\nCPF: ${coordCpf}`
                    : '';

                // === SIGNATÁRIO DA CONTRATADA (assinatura no documento) ===
                const buSignerKey = Object.keys(BU_SIGNERS_MAP).find(k => buNameUpper.includes(k));
                if (buSignerKey) {
                    replacements['NOME-CONTRATADA'] = BU_SIGNERS_MAP[buSignerKey].name;
                    replacements['CPF-CONTRATADA'] = BU_SIGNERS_MAP[buSignerKey].cpf;
                }


                // === HEAD DA BU (testemunha nos contratos Bomma/Seed) ===
                const headBu = await prisma.sellers.findFirst({
                    where: {
                        type: 'head',
                        seller_business: {
                            some: { business_id: Number(bu_id) }
                        }
                    }
                });
                replacements['NOME-HEAD-BU'] = headBu?.name || '';
                replacements['CPF-HEAD-BU'] = headBu?.cpf || '';

                // === CLÁUSULA DE NEGOCIAÇÃO DINÂMICA ({{negotiation_seller}}) ===
                const renderedClause = data['NEGOTIATION_RENDERED_CLAUSE'];
                if (renderedClause) {
                    replacements['negotiation_seller'] = String(renderedClause);
                    console.log(`[DOCS] Cláusula de negociação injetada via {{negotiation_seller}}`);
                }

                console.log(`[DOCS] Substituindo variáveis no documento...`);
                if (trackingId) {
                    progressTracker.emitProgress(trackingId, {
                        status: 'processing',
                        progress: 40,
                        step: 'Google Docs: Preenchendo contrato...',
                        log: `Substituindo variáveis.`
                    });
                }
                await GoogleDocsService.replaceVariables(newFile.id, replacements);
                console.log(`[DOCS] Variáveis substituídas! Tempo: ${Date.now() - docsStartTime}ms`);

                // === AUTOMAÇÃO CLICKSIGN (REMOVIDO DO FLUXO PRINCIPAL) ===
                // O envio para o Clicksign agora é feito via endpoint separado ou bypass
                generatedFileLink = `https://docs.google.com/document/d/${newFile.id}/edit`;
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

        // Conversão de valores para o banco (reutilizando funções locais se existissem, mas estão dentro do escopo)
        const parseDecimal = (val: any) => {
            if (val === undefined || val === null || val === '') return null;
            const cleaned = String(String(val)).replace(/\./g, '').replace(',', '.').replace('R$ ', '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? null : parsed;
        };

        const parseDate = (val: any) => {
            if (val === undefined || val === null || val === '') return null;
            if (typeof val === 'string' && val.includes('/')) {
                const parts = val.split('/');
                if (parts.length === 3) {
                    const [day, month, year] = parts;
                    const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
                    return isNaN(date.getTime()) ? null : date;
                }
            }
            const date = new Date(val);
            return isNaN(date.getTime()) ? null : date;
        };

        const parseInteger = (val: any) => {
            if (val === undefined || val === null || val === '') return null;
            const parsed = parseInt(String(val));
            return isNaN(parsed) ? null : parsed;
        };

        const newContract = await (prisma.contracts as any).create({
            data: {
                title,
                cnpj_client: data['CNPJ DO CONTRATANTE'] || '',
                seller_id: BigInt(user.id),
                sdr_id: sdr_id ? BigInt(sdr_id) : null,
                bu_id: Number(bu_id),
                monthly_fee: 0,
                implementation_fee: parseDecimal(data['VALOR TAXA IMPLEMENTACAO']),
                contractual_term: parseInteger(data['PRAZO CONTRATUAL MESES']),
                due_date: parseDate(data['DATA PRIMEIRO PAGAMENTO']),
                legal_repre_email: data['EMAIL DO REPRESENTANTE'],
                first_payment_date: parseDate(data['DATA PRIMEIRO PAGAMENTO']),
                first_payment_amount: parseDecimal(data['VALOR DO PRIMEIRO PAGAMENTO']) || parseDecimal(data['VALOR MENSALIDADE']) || 0,
                document_id: providedEnvelopeId ? providedEnvelopeId : null,
                envelope_id: providedEnvelopeId ? (envelopeIdToSave || providedEnvelopeId) : null,
                type_contract: sheetName,
                signed: isAlreadySigned,
                signed_date: isAlreadySigned ? new Date() : null,
                signed_count: isAlreadySigned ? signersToProcess.length : 0,
                total_signers: signersToProcess.length,
                change_status: null,
                link: generatedFileLink,
                approved: !!providedEnvelopeId, // Se for bypass, já nasce aprovado
                approved_at: providedEnvelopeId ? new Date() : null,
                fin_phone: data['TELEFONE FINANCEIRO CONTRATANTE'] || null,
                fin_email: data['EMAIL FINANCEIRO CONTRATANTE'] || null,
                negotiation_template_id: data['NEGOTIATION_TEMPLATE_ID'] ? BigInt(data['NEGOTIATION_TEMPLATE_ID']) : null,
                negotiation_clause: data['NEGOTIATION_RENDERED_CLAUSE'] || null,
            }
        });

        // === SINCRONIZAÇÃO IMEDIATA (NOVO) ===
        // Se foi fornecido um ID ou se já marcamos como assinado, forçamos um sync 
        // para garantir que todos os campos (signed_date, etc) sejam preenchidos.
        if (providedEnvelopeId || isAlreadySigned) {
            try {
                console.log(`[SYNC] Iniciando sincronização imediata para o contrato ${newContract.id}...`);
                const { ContractService } = await import('../services/contractService.js');
                await ContractService.syncWithClickSign(newContract.id);
            } catch (syncErr: any) {
                console.warn(`[SYNC] Falha na sincronização imediata (não crítico):`, syncErr.message);
            }
        }

        // 4. Salvar e-mails das testemunhas vinculados ao contrato
        const witnessEmails: string[] = [];
        const typedData = data as any;

        // Coletar e-mails de testemunhas adicionais (1 a 6)
        for (let i = 1; i <= 6; i++) {
            const email = typedData[`EMAIL TESTEMUNHA ${i}`];
            if (email && email.trim() !== '') witnessEmails.push(email.trim());
        }

        // Coletar e-mails de testemunhas fixas mapeadas no form
        for (let i = 1; i <= 3; i++) {
            const email = typedData[`EMAIL TESTEMUNHA FIXA ${i}`];
            if (email && email.trim() !== '' && !witnessEmails.includes(email.trim())) {
                witnessEmails.push(email.trim());
            }
        }

        if (witnessEmails.length > 0) {
            await (prisma as any).witnesses_email.createMany({
                data: witnessEmails.map(email => ({
                    contract_id: newContract.id,
                    email: email
                }))
            });
            console.log(`[DB] ${witnessEmails.length} e-mails de testemunhas salvos.`);
        }

        console.log(`[DB] Registro de contrato criado (ID: ${newContract.id}). Tempo: ${Date.now() - dbStartTime}ms`);

        // === CÁLCULO DE MÉTRICAS (P1, TCV) VIA IA ===
        // Aguarda o cálculo antes de finalizar para que o TCV esteja correto ao redirecionar
        const negotiationClause = data['NEGOTIATION_RENDERED_CLAUSE'];
        if (negotiationClause) {
            const contractId = newContract.id;
            const metricsParams = {
                renderedClause: String(negotiationClause),
                implementationFee: parseDecimal(data['VALOR TAXA IMPLEMENTACAO']) ?? 0,
                contractualTerm: parseInteger(data['PRAZO CONTRATUAL MESES']),
                firstPaymentAmount: parseDecimal(data['VALOR DO PRIMEIRO PAGAMENTO']),
                monthlyFee: parseDecimal(data['VALOR MENSALIDADE']),
            };

            if (trackingId) {
                progressTracker.emitProgress(trackingId, {
                    status: 'processing',
                    progress: 85,
                    step: 'Calculando métricas financeiras (IA)...',
                    log: 'Calculando P1 e TCV via IA'
                });
            }

            try {
                const metrics = await OpenAIService.calculateContractMetrics(metricsParams);
                console.log(`[METRICS] Contrato ${contractId}: P1=${metrics.p1}, TCV=${metrics.tcv}`);
                await prisma.contracts.update({
                    where: { id: contractId },
                    data: {
                        first_payment_amount: metrics.p1,
                        tcv: metrics.tcv,
                    },
                });
                console.log(`[METRICS] Contrato ${contractId}: métricas salvas no banco.`);
            } catch (err: any) {
                console.error(`[METRICS] Falha ao calcular métricas do contrato ${contractId}:`, err.message);
                // Não bloqueia o fluxo — contrato já foi criado, métricas ficam zeradas
            }
        }

        const totalTime = Date.now() - startTime;
        console.log(`[FIM] Contrato processado com sucesso em ${totalTime}ms`);

        if (trackingId) {
            progressTracker.emitProgress(trackingId, {
                status: 'completed',
                progress: 100,
                step: 'Contrato finalizado com sucesso!',
                log: `Finalizado em ${Date.now() - startTime}ms`
            });
            progressTracker.clearHistory(trackingId);
        }

        res.json({
            success: true,
            message: `Dados processados com sucesso. Rascunho gerado.`,
            link: generatedFileLink,
            processingTime: totalTime,
            contractId: newContract.id.toString()
        });
    } catch (error: any) {
        console.error(`[ERRO] Falha ao processar contrato ${sheetName}:`, error);

        if (trackingId) {
            progressTracker.emitProgress(trackingId, {
                status: 'error',
                progress: 0,
                step: 'Erro na geração do contrato',
                error: error instanceof Error ? error.message : String(error)
            });
            progressTracker.clearHistory(trackingId);
        }
        res.status(500).json({ error: 'Falha ao processar contrato', details: error.message });
    }
};

/**
 * Handler para aprovação e envio manual para o Clicksign
 */
export const sendContractToClickSign = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { trackingId, isDebug } = req.body;
    const startTime = Date.now();

    console.log(`[MANUAL] Iniciando envio do contrato ${id} para o Clicksign...`);

    if (trackingId) {
        progressTracker.emitProgress(trackingId, {
            status: 'processing',
            progress: 10,
            step: 'Buscando dados do contrato...',
            log: `ID: ${id}`
        });
    }

    try {
        const contract = await prisma.contracts.findUnique({
            where: { id: BigInt(id) },
            include: {
                witnesses_email: true,
                sellers: true,
                business: true
            }
        });

        if (!contract) {
            return res.status(404).json({ error: 'Contrato não encontrado' });
        }

        if (contract.approved) {
            return res.status(400).json({ error: 'Este contrato já foi aprovado e enviado' });
        }

        if (!contract.link) {
            return res.status(400).json({ error: 'O contrato ainda não possui um documento gerado' });
        }

        // Extrair ID do arquivo do link do Google Drive
        const fileIdMatch = contract.link.match(/\/d\/(.*)\//);
        const fileId = fileIdMatch ? fileIdMatch[1] : null;

        if (!fileId) {
            return res.status(400).json({ error: 'Não foi possível extrair o ID do arquivo do link do Drive' });
        }

        // Buscar Coordenador da BU
        const coordinator = await prisma.sellers.findFirst({
            where: {
                type: 'coord',
                seller_business: {
                    some: { business_id: contract.bu_id }
                }
            }
        });

        // Buscar Head da BU (Regra 6.5)
        const head = await prisma.sellers.findFirst({
            where: {
                type: 'head',
                seller_business: {
                    some: { business_id: contract.bu_id }
                }
            }
        });

        // Executar o fluxo do Clicksign
        const witnessEmails = contract.witnesses_email.map(w => w.email);

        // Quando o criador é um coordenador, não adicionar o coord do banco como
        // signatário extra — o findFirst retorna o primeiro coord da BU no banco,
        // que pode ser uma pessoa completamente diferente de quem criou o contrato.
        const creatorIsCoord = contract.sellers?.type === 'coord';

        const result = await executeClickSignv3Flow({
            contractId: contract.id,
            fileId: fileId,
            fileName: contract.title || 'Contrato',
            buName: contract.business?.name || '',
            signerName: contract.title?.split(' & ')[0] || '',
            signerEmail: contract.legal_repre_email || '',
            signerCpf: '',
            witnessEmails: witnessEmails,
            trackingId: trackingId,
            debugMode: isDebug,
            sellerName: contract.sellers?.name || '',
            sellerEmail: contract.sellers?.email || '',
            sellerCpf: contract.sellers?.cpf || '',
            coordName: creatorIsCoord ? '' : (coordinator?.name || ''),
            coordEmail: creatorIsCoord ? '' : (coordinator?.email || ''),
            coordCpf: creatorIsCoord ? '' : (coordinator?.cpf || ''),
            headName: head?.name || '',
            headEmail: head?.email || '',
            headCpf: head?.cpf || ''
        });

        // Atualizar o Banco
        await prisma.contracts.update({
            where: { id: contract.id },
            data: {
                approved: true,
                approved_at: new Date(),
                envelope_id: result.envelopeId,
                document_id: result.documentId,
                total_signers: result.signersCount
            }
        });

        if (trackingId) {
            progressTracker.emitProgress(trackingId, {
                status: 'completed',
                progress: 100,
                step: 'Contrato enviado com sucesso!',
                log: `Envelope: ${result.envelopeId}`
            });
            progressTracker.clearHistory(trackingId);
        }

        res.json({
            success: true,
            message: 'Contrato enviado para assinatura com sucesso',
            envelopeId: result.envelopeId,
            totalSigners: result.signersCount
        });

    } catch (error: any) {
        console.error(`[ERRO MANUAL] Falha ao enviar contrato ${id}:`, error);
        if (trackingId) {
            progressTracker.emitProgress(trackingId, {
                status: 'error',
                progress: 0,
                step: 'Erro no envio manual',
                error: error.message
            });
            progressTracker.clearHistory(trackingId);
        }
        res.status(500).json({ error: 'Falha ao enviar contrato para assinatura', details: error.message });
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
export const submitSeedGrowth = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano Growth - Seed');
export const submitBommaAssessoria = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria');
export const submitBommaConsultoria = (req: Request, res: Response) => handleContractSubmit(req, res, 'Consultoria');
export const submitBommaAssessoriaSocialIlimitado = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Ilimitado)');
export const submitBommaAssessoriaSocialArtes = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Qtd Min Artes)');
export const submitBommaAssessoriaSocialDeterminada = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Qtd Min Determinada)');
export const submitBommaAssessoriaSocialVideos = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Qtd Min Vídeos)');
export const submitBommaSocialIlimitado = (req: Request, res: Response) => handleContractSubmit(req, res, 'Social Media (Ilimitado)');
export const submitBommaSocialDeterminada = (req: Request, res: Response) => handleContractSubmit(req, res, 'Social Media (Qtd Min Determinada)');
