import { Request, Response } from 'express';
import { GoogleDriveService } from '../services/googleDriveService';
import { GoogleDocsService } from '../services/googleDocsService';
import { ClickSignService } from '../services/clickSignService';
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

                // 1. Limpeza dos placeholders de Testemunhas Fixas (1 a 3)
                // Eles NÃO entram na lista L1/L2 pois já possuem placeholders fixos no doc.
                for (let i = 1; i <= 3; i++) {
                    const nameKey = `NOME-TESTEMUNHA-FIXA-${i}`;
                    const cpfKey = `CPF-TESTEMUNHA-FIXA-${i}`;
                    if (!replacements[nameKey]) replacements[nameKey] = '';
                    if (!replacements[cpfKey]) replacements[cpfKey] = '';
                }

                // 2. Coleta Testemunhas Adicionais (1 a 6) para a lista L1/L2
                for (let i = 1; i <= 6; i++) {
                    const nameKey = `NOME-TESTEMUNHA-${i}`;
                    const cpfKey = `CPF-TESTEMUNHA-${i}`;
                    const name = replacements[nameKey];
                    const cpf = replacements[cpfKey];

                    if (name && cpf) {
                        allWitnessesForList.push(`NOME: ${name}\nCPF: ${cpf}\n`);
                    }
                    // Garante que o placeholder não fique sujo no doc
                    if (!replacements[nameKey]) replacements[nameKey] = '';
                    if (!replacements[cpfKey]) replacements[cpfKey] = '';
                }

                // 3. Distribui nas listas L1 e L2 para o Google Docs
                const l1Witnesses: string[] = [];
                const l2Witnesses: string[] = [];

                allWitnessesForList.forEach((witness, index) => {
                    if (index % 2 === 0) {
                        l1Witnesses.push(witness);
                    } else {
                        l2Witnesses.push(witness);
                    }
                });

                replacements['L1-TESTEMUNHAS'] = l1Witnesses.join('\n');
                replacements['L2-TESTEMUNHAS'] = l2Witnesses.join('\n');

                // Mapeamentos específicos extras conforme o modelo extraído
                replacements['NOME-REPRESENTANTE-CONTRATANTE'] = data['NOME DO REPRESENTANTE'] || '';
                replacements['CPF-REPRESENTANTE-CONTRATANTE'] = data['CPF DO REPRESENTANTE'] || '';

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

                // === AUTOMAÇÃO CLICKSIGN (NOVO) ===
                const clicksignStartTime = Date.now();
                try {
                    console.log(`[CLICKSIGN] Iniciando exportação PDF e upload para Clicksign...`);
                    if (trackingId) {
                        progressTracker.emitProgress(trackingId, {
                            status: 'processing',
                            progress: 60,
                            step: 'Clicksign: Exportando PDF...',
                            log: 'Convertendo Google Doc para PDF'
                        });
                    }

                    // 1. Exporta Doc para PDF (Base64)
                    const pdfBase64 = await GoogleDriveService.exportFileToPDF(newFile.id);

                    console.log('[CLICKSIGN] Iniciando fluxo v3 (Envelopes)...');

                    // 1. Criar Envelope (v3)
                    const envelopeName = fileName;
                    const envelope = await ClickSignService.createEnvelope(envelopeName);
                    const envelopeId = envelope.id;
                    envelopeIdToSave = envelopeId;
                    console.log(`[CLICKSIGN v3] Envelope criado: ${envelopeId}`);
                    if (trackingId) {
                        progressTracker.emitProgress(trackingId, {
                            status: 'processing',
                            progress: 75,
                            step: 'Clicksign: Criando envelope v3...',
                            log: `ID: ${envelopeId}`
                        });
                    }

                    const document = await ClickSignService.addDocumentToEnvelope(envelopeId, fileName, pdfBase64);
                    const documentId = document.id;
                    envelopeIdForDb = documentId; // Mantendo document_id para compatibilidade ou uso específico
                    console.log(`[CLICKSIGN v3] Documento adicionado: ${documentId}`);

                    // 3. Preparar Signatários (v3)

                    // 3a. Signatário Contratante (Cliente)
                    if (data['EMAIL DO REPRESENTANTE'] && data['NOME DO REPRESENTANTE']) {
                        signersToProcess.push({
                            email: data['EMAIL DO REPRESENTANTE'],
                            name: data['NOME DO REPRESENTANTE'],
                            cpf: data['CPF DO REPRESENTANTE'],
                            role: 'contractor'
                        });
                    }

                    // 3b. Signatário Contratada (BU)
                    const BU_SIGNERS_MAP: Record<string, { name: string, email: string, cpf: string }> = {
                        'BOMMA': { name: 'Natália Selister Piccoli', email: 'natalia@bommamkt.com.br', cpf: '013.266.710-06' },
                        'SEED': { name: 'Luís Fernando Mauri Menti', email: 'luisfernando@seedagromarketing.com.br', cpf: '023.275.400-46' },
                        'IMPULSE': { name: 'Luís Fernando Mauri Menti', email: 'luisfernando@3fventure.com.br', cpf: '023.275.400-46' }
                    };

                    const buKey = Object.keys(BU_SIGNERS_MAP).find(k => finalBuName.toUpperCase().includes(k));
                    if (buKey) {
                        signersToProcess.push({
                            ...BU_SIGNERS_MAP[buKey],
                            role: 'contractee' // Luis/Nati/Mateus como representante da Contratada no v3
                        });
                    }

                    // 3c. Testemunhas e Vendedor
                    const addedEmails = new Set(signersToProcess.map(s => s.email.toLowerCase()));

                    // Vendedor
                    if (data['EMAIL VENDEDOR'] && data['NOME VENDEDOR'] && !addedEmails.has(data['EMAIL VENDEDOR'].toLowerCase())) {
                        signersToProcess.push({
                            email: data['EMAIL VENDEDOR'],
                            name: data['NOME VENDEDOR'],
                            cpf: data['CPF VENDEDOR'],
                            role: 'witness'
                        });
                        addedEmails.add(data['EMAIL VENDEDOR'].toLowerCase());
                    }

                    // Testemunhas Fixas e Adicionais
                    const formData = data as any;
                    const possibleWitnesses = [
                        ...Array.from({ length: 3 }, (_, i) => i + 1).map(i => ({ name: `NOME TESTEMUNHA FIXA ${i}`, email: `EMAIL TESTEMUNHA FIXA ${i}`, cpf: `CPF TESTEMUNHA FIXA ${i}` })),
                        ...Array.from({ length: 6 }, (_, i) => i + 1).map(i => ({ name: `NOME TESTEMUNHA ${i}`, email: `EMAIL TESTEMUNHA ${i}`, cpf: `CPF TESTEMUNHA ${i}` }))
                    ];

                    for (const w of possibleWitnesses) {
                            const name = formData[w.name];
                            const email = formData[w.email];
                            const cpf = formData[w.cpf];
                            if (name && email && !addedEmails.has(email.toLowerCase())) {
                                signersToProcess.push({ email, name, cpf, role: 'witness' });
                                addedEmails.add(email.toLowerCase());
                            }
                        }
                    // Loop para criar Signatários e Gerar Lista de Operações para Bulk Requirements
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
                        try {
                            console.log(`[CLICKSIGN v3] Criando signatário: ${s.name} (${s.email})`);
                            const signer = await ClickSignService.addSignerToEnvelope(envelopeId, s);
                            const signerId = signer.id;
                            addedSignersInfo.push({ id: signerId, name: s.name });

                            // REQUISITO 1: Evidência (Autenticação por E-mail) - Essencial para ativação v3
                            bulkOps.push({
                                op: 'add',
                                ref: { type: 'requirements', id: envelopeId },
                                data: {
                                    type: 'requirements',
                                    attributes: {
                                        action: 'provide_evidence',
                                        auth: 'email'
                                    },
                                    relationships: {
                                        document: { data: { type: 'documents', id: documentId } },
                                        signer: { data: { type: 'signers', id: signerId } }
                                    }
                                }
                            });

                            // REQUISITO 2: Concordância (Papel: contractor ou witness)
                            bulkOps.push({
                                op: 'add',
                                ref: { type: 'requirements', id: envelopeId },
                                data: {
                                    type: 'requirements',
                                    attributes: {
                                        action: 'agree',
                                        role: s.role
                                    },
                                    relationships: {
                                        document: { data: { type: 'documents', id: documentId } },
                                        signer: { data: { type: 'signers', id: signerId } }
                                    }
                                }
                            });
                        } catch (err: any) {
                            console.error(`[CLICKSIGN v3] Erro ao criar signatário ${s.name}:`, err.message);
                        }
                    }

                    // 4. Vincular Signatários (Bulk Requirements)
                    if (bulkOps.length > 0) {
                        console.log(`[CLICKSIGN v3] Vinculando ${bulkOps.length} relações...`);
                        await ClickSignService.addBulkRequirements(envelopeId, bulkOps);
                    }

                    // 5. Ativar Envelope
                    await ClickSignService.finalizeEnvelope(envelopeId);
                    console.log(`[CLICKSIGN v3] Envelope ativado!`);

                    // 6. Notificações Individuais
                    const signatureMessage = `Olá!

Preciso da sua assinatura eletrônica.

Para assinar, basta clicar no botão abaixo e seguir o passo-a-passo pela Clicksign. É bem simples!`;

                    for (const info of addedSignersInfo) {
                        try {
                            console.log(`[CLICKSIGN v3] Notificando ${info.name}...`);
                            await ClickSignService.sendNotification(envelopeId, info.id, signatureMessage);
                        } catch (notifyErr: any) {
                            console.error(`[CLICKSIGN v3] Erro ao notificar ${info.name}:`, notifyErr.message);
                        }
                    }

                    console.log(`[CLICKSIGN v3] Fluxo finalizado com sucesso em ${Date.now() - clicksignStartTime}ms`);

                    console.log(`[CLICKSIGN v3] Fluxo finalizado com sucesso em ${Date.now() - clicksignStartTime}ms`);
                    generatedFileLink = `https://docs.google.com/document/d/${newFile.id}/edit`; // Link do Doc continua útil
                    // Opcional: registrar document_key para uso futuro
                } catch (csError: any) {
                    console.error(`[CLICKSIGN] Erro na automação:`, csError.response?.data || csError.message);
                    // Não trava o fluxo principal, mas avisa
                }
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

        const newContract = await (prisma.contracts as any).create({
            data: {
                title,
                cnpj_client: data['CNPJ DO CONTRATANTE'] || '',
                seller_id: BigInt(user.id),
                sdr_id: sdr_id ? BigInt(sdr_id) : null,
                bu_id: Number(bu_id),
                monthly_fee: parseDecimal(data['VALOR MENSALIDADE']),
                implementation_fee: parseDecimal(data['VALOR TAXA IMPLEMENTACAO']),
                contractual_term: isGrowth ? null : parseInteger(data['PRAZO CONTRATUAL MESES']),
                due_date: parseDate(data['DATA PRIMEIRO PAGAMENTO']),
                legal_repre_email: data['EMAIL DO REPRESENTANTE'],
                first_payment_date: parseDate(data['DATA PRIMEIRO PAGAMENTO']),
                first_payment_amount: parseDecimal(data['VALOR DO PRIMEIRO PAGAMENTO']),
                document_id: envelopeIdForDb,
                envelope_id: envelopeIdToSave,
                type_contract: sheetName,
                signed: isAlreadySigned,
                signed_count: isAlreadySigned ? signersToProcess.length : 0,
                total_signers: signersToProcess.length,
                change_status: null,
                link: generatedFileLink
            }
        });

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

        const totalTime = Date.now() - startTime;
        console.log(`[FIM] Contrato processado com sucesso em ${totalTime}ms`);

        if (trackingId) {
            progressTracker.emitProgress(trackingId, {
                status: 'completed',
                progress: 100,
                step: 'Contrato finalizado com sucesso!',
                log: `Finalizado em ${Date.now() - startTime}ms`
            });
        }

        res.json({
            success: true,
            message: `Dados processados com sucesso. Contrato gerado.`,
            link: generatedFileLink,
            processingTime: totalTime
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
        }
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
export const submitSeedGrowth = (req: Request, res: Response) => handleContractSubmit(req, res, 'Plano Growth - Seed');
export const submitBommaAssessoria = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria');
export const submitBommaConsultoria = (req: Request, res: Response) => handleContractSubmit(req, res, 'Consultoria');
export const submitBommaAssessoriaSocialIlimitado = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Ilimitado)');
export const submitBommaAssessoriaSocialArtes = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Qtd Min Artes)');
export const submitBommaAssessoriaSocialDeterminada = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Qtd Min Determinada)');
export const submitBommaAssessoriaSocialVideos = (req: Request, res: Response) => handleContractSubmit(req, res, 'Assessoria + Social Media (Qtd Min Vídeos)');
export const submitBommaSocialIlimitado = (req: Request, res: Response) => handleContractSubmit(req, res, 'Social Media (Ilimitado)');
export const submitBommaSocialDeterminada = (req: Request, res: Response) => handleContractSubmit(req, res, 'Social Media (Qtd Min Determinada)');
