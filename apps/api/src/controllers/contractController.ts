import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { ClickSignService } from '../services/clickSignService';
import { GoogleDriveService } from '../services/googleDriveService';

/**
 * @openapi
 * /contracts:
 *   get:
 *     summary: Listar todos os contratos
 *     tags:
 *       - Contracts
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contracts'
 */
export const getContracts = async (req: Request, res: Response) => {
    try {
        const contracts = await prisma.contracts.findMany();
        res.json(contracts);
    } catch (error: any) {
        console.error('Erro ao obter contratos:', error);
        res.status(500).json({ error: 'Falha ao obter contratos', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/seller/{sellerId}:
 *   get:
 *     summary: Listar contratos por ID do Vendedor
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Vendedor (BigInt)
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contracts'
 */
export const getContractBySellerId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contracts = await prisma.contracts.findMany({
            where: { seller_id: BigInt(id) },
        });
        res.json(contracts);
    } catch (error: any) {
        console.error('Erro ao obter contratos por ID do vendedor:', error);
        res.status(500).json({ error: 'Falha ao obter contratos', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/bu/{buId}:
 *   get:
 *     summary: Listar contratos por ID da BU
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: buId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da Unidade de Negócio
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contracts'
 */
export const getContractByBuId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contracts = await prisma.contracts.findMany({
            where: { bu_id: Number(id) },
        });
        res.json(contracts);
    } catch (error: any) {
        console.error('Erro ao obter contratos por ID da BU:', error);
        res.status(500).json({ error: 'Falha ao obter contratos', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/head/{headId}:
 *   get:
 *     summary: Listar contratos da equipe (por ID do Head)
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: headId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Head (BigInt)
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contracts'
 */
export const getContractByHeadId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Find all sellers whose head_id matches
        const teamSellers = await prisma.sellers.findMany({
            where: { head_id: BigInt(id) },
            select: { id: true }
        });
        
        const sellerIds = teamSellers.map(s => s.id);
        
        // We also want to include the head's own contracts, just in case
        sellerIds.push(BigInt(id));

        const contracts = await prisma.contracts.findMany({
            where: { seller_id: { in: sellerIds } },
        });
        
        res.json(contracts);
    } catch (error: any) {
        console.error('Erro ao obter contratos da equipe:', error);
        res.status(500).json({ error: 'Falha ao obter contratos da equipe', details: error.message });
    }
};

/**
 * @openapi
 * /contracts:
 *   post:
 *     summary: Criar novo registro de contrato no banco
 *     tags:
 *       - Contracts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/Contracts'
 *     responses:
 *       201:
 *         description: Contrato criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contracts'
 */
export const createContract = async (req: Request, res: Response) => {
    try {
        const { data } = req.body;
        if (!data) return res.status(400).json({ error: 'Dados não fornecidos' });

        const contract = await prisma.contracts.create({
            data: {
                ...data
            },
        });

        res.json(contract);
    } catch (error: any) {
        console.error('Erro ao criar contrato:', error);
        res.status(500).json({ error: 'Falha ao criar contrato', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/{id}:
 *   put:
 *     summary: Atualizar status/dados de um contrato
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Contrato (BigInt)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signed:
 *                 type: boolean
 *               signed_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               link:
 *                 type: string
 *               created_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               change_status:
 *                 type: string
 *                 nullable: true
 *               change_description:
 *                 type: string
 *                 nullable: true
 *               first_payment_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               fin_phone:
 *                 type: string
 *                 nullable: true
 *               fin_email:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Contrato atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contracts'
 */
export const updateContract = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { signed, signed_date, created_at, link, change_status, change_description, first_payment_date, due_date, fin_phone, fin_email } = req.body;

        // Verifica se pelo menos uma propriedade foi enviada no body (mesmo que seja false ou null)
        if (signed === undefined && signed_date === undefined && created_at === undefined && link === undefined && change_status === undefined && change_description === undefined && first_payment_date === undefined && due_date === undefined && fin_phone === undefined && fin_email === undefined) {
            return res.status(400).json({ error: 'Dados não fornecidos' });
        }

        // Validação adicional: não permitir solicitação de mudança em contratos assinados
        if (change_status === 'alert') {
            const existingContract = await prisma.contracts.findUnique({
                where: { id: BigInt(id) },
                select: { signed: true }
            });
            if (existingContract?.signed) {
                return res.status(403).json({ error: 'Não é possível solicitar alteração em um contrato já assinado.' });
            }
        }

        const existing = await prisma.contracts.findUnique({
            where: { id: BigInt(id) }
        });

        const contract = await prisma.contracts.update({
            where: { id: BigInt(id) },
            data: {
                ...(signed !== undefined && { signed }),
                ...(signed !== undefined && signed === true && {
                    signed_count: existing?.total_signers || 0,
                    signed_date: signed_date || new Date().toISOString()
                }),
                ...(signed_date !== undefined && signed === undefined && { signed_date }),
                ...(created_at !== undefined && { created_at }),
                ...(link !== undefined && { link }),
                ...(change_status !== undefined && { change_status }),
                ...(change_description !== undefined && { change_description }),
                ...(first_payment_date !== undefined && { first_payment_date }),
                ...(due_date !== undefined && { due_date }),
                ...(fin_phone !== undefined && { fin_phone }),
                ...(fin_email !== undefined && { fin_email })
            },
        });

        res.json(contract);
    } catch (error: any) {
        console.error('Erro ao atualizar contrato:', error);
        res.status(500).json({ error: 'Falha ao atualizar contrato', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/{id}:
 *   delete:
 *     summary: Excluir um contrato
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Contrato (BigInt)
 *     responses:
 *       200:
 *         description: Contrato deletado
 */
export const deleteContract = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const targetId = BigInt(id);
        const requester = req.user;

        console.log(`[DELETE] Iniciando exclusão do contrato ID: ${targetId} por ${requester?.email} (${requester?.type})`);

        // 1. Buscar detalhes do contrato para limpeza externa e validação de permissão
        const contract = await (prisma.contracts as any).findUnique({
            where: { id: targetId },
            select: { 
                document_id: true, 
                envelope_id: true,
                title: true,
                canceled_at: true,
                approved: true,
                link: true
            }
        });

        if (!contract) {
            return res.status(404).json({ error: 'Contrato não encontrado para exclusão.' });
        }

        // Validação de RBAC: 
        // - Admin pode excluir qualquer coisa.
        // - Outros cargos só podem excluir se estiver cancelado ou se for um rascunho (approved: false).
        const isAdmin = requester?.type === 'admin';
        const isCanceled = !!(contract as any).canceled_at;
        const isDraft = (contract as any).approved === false;

        if (!isAdmin && !isCanceled && !isDraft) {
            return res.status(403).json({ 
                error: 'Você não tem permissão para excluir este contrato. Ele deve ser cancelado primeiro.' 
            });
        }

        const clicksignId = (contract as any).envelope_id || contract.document_id;
        
        // Extração do ID do Drive: Sempre extrai do link, pois document_id é reservado para o Clicksign
        let driveFileId = null;
        if (contract.link) {
            const match = contract.link.trim().match(/\/d\/(.*?)(\/|$)/);
            if (match && match[1]) {
                driveFileId = match[1].trim();
                console.log(`[DELETE] ID do Drive extraído do link: ${driveFileId}`);
            }
        }

        // 2. Limpeza no Clicksign
        if (clicksignId) {
            console.log(`[DELETE] Tentando cancelar no Clicksign: ${clicksignId}`);
            try {
                await ClickSignService.cancelDocument(clicksignId);
            } catch (csError: any) {
                console.warn(`[DELETE] Falha ao cancelar no Clicksign (prosseguindo):`, csError.message);
            }
        }

        // 3. Limpeza no Google Drive
        if (driveFileId) {
            console.log(`[DELETE] Tentando deletar no Google Drive: ${driveFileId}`);
            try {
                await GoogleDriveService.deleteFile(driveFileId);
            } catch (gdError: any) {
                console.warn(`[DELETE] Falha ao deletar no Google Drive (prosseguindo):`, gdError.message);
            }
        }

        // 4. Excluir do Banco de Dados
        const result = await prisma.$transaction(async (tx) => {
            // Deletar dependências (witnesses_email)
            await tx.witnesses_email.deleteMany({
                where: { contract_id: targetId }
            });

            // Deletar o contrato principal
            return await tx.contracts.delete({
                where: { id: targetId },
            });
        });

        // Serialização explícita para evitar erros de BigInt/JSON no Windows
        const serialized = JSON.parse(JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(serialized);
    } catch (error: any) {
        console.error('Erro ao deletar contrato:', error);
        res.status(500).json({ 
            error: 'Falha ao deletar contrato', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
};

/**
 * @openapi
 * /contracts/{id}/cancel:
 *   post:
 *     summary: Cancelar um contrato pendente no Clicksign e no sistema
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Contrato (BigInt)
 *     responses:
 *       200:
 *         description: Contrato cancelado com sucesso
 */
export const cancelContract = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const targetId = BigInt(id);

        console.log(`[CANCEL] Iniciando cancelamento do contrato ID: ${targetId}`);

        // 1. Busca o contrato no banco
        const contract = await prisma.contracts.findUnique({
            where: { id: targetId }
        });

        if (!contract) {
            return res.status(404).json({ error: 'Contrato não encontrado.' });
        }

        if (contract.signed) {
            return res.status(403).json({ error: 'Não é possível cancelar um contrato já assinado.' });
        }
        
        if ((contract as any).canceled_at) {
            return res.status(400).json({ error: 'Este contrato já está cancelado.' });
        }

        // 2. Tenta cancelar no Clicksign (se possuir document_id)
        if (contract.document_id) {
            console.log(`[CANCEL] Solicitando cancelamento no Clicksign para o ID: ${contract.document_id}`);
            try {
                // Aqui o ClickSignService.cancelDocument importado deveria ser usado
                // Import deve ser add acima se ainda não existir
                const { ClickSignService } = await import('../services/clickSignService.js');
                await ClickSignService.cancelDocument(contract.document_id);
                console.log(`[CANCEL] Clicksign cancelado com sucesso.`);
            } catch (clickSignError: any) {
                console.error(`[CANCEL] Erro ao cancelar no Clicksign (ignorando forçado):`, clickSignError.message);
            }
        }

        // 3. Atualiza o status no banco de dados
        const updatedContract = await (prisma.contracts as any).update({
            where: { id: targetId },
            data: {
                canceled_at: new Date(),
                change_description: contract.change_description 
                    ? `${contract.change_description} (Cancelado pelo usuário)` 
                    : 'Cancelado pelo usuário.'
            }
        });

        // Serialização para corrigir BigInt
        const serialized = JSON.parse(JSON.stringify(updatedContract, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({ success: true, message: 'Contrato cancelado com sucesso.', contract: serialized });
    } catch (error: any) {
        console.error('Erro ao cancelar contrato:', error);
        res.status(500).json({ 
            error: 'Falha ao cancelar contrato', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
};

/**
 * @openapi
 * /contracts/{id}/sync:
 *   post:
 *     summary: Sincronizar status de assinaturas com o Clicksign
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Contrato (BigInt)
 *     responses:
 *       200:
 *         description: Status sincronizado
 */
export const syncContractStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const targetId = BigInt(id);

        console.log(`[SYNC] Solicitando sincronização para o contrato ID: ${targetId}...`);

        const { ContractService } = await import('../services/contractService.js');
        const updatedContract = await ContractService.syncWithClickSign(targetId);

        // Serialização para corrigir BigInt
        const serialized = JSON.parse(JSON.stringify(updatedContract, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({ success: true, contract: serialized });
    } catch (error: any) {
        console.error('[SYNC] Erro na rota de sincronização:', error.message);
        res.status(500).json({ error: 'Erro ao sincronizar status', details: error.message });
    }
};

export const getContractSigners = async (req: Request, res: Response) => {
    const { id } = req.params;
    const targetId = BigInt(id);

    try {
        const contract = await prisma.contracts.findUnique({
            where: { id: targetId }
        });

        if (!contract) {
            return res.status(404).json({ error: 'Contrato não encontrado' });
        }

        const clicksignId = (contract as any).envelope_id || contract.document_id;
        if (!clicksignId) {
            return res.json({ success: true, signers: [] });
        }

        try {
            // Busca dados v3
            let envelopeIdToUse = clicksignId;
            try {
                const { envelopeId, signers: rawSigners } = await ClickSignService.getEnvelopeSigners(clicksignId);
                envelopeIdToUse = envelopeId || clicksignId;
                
                const requirements = await ClickSignService.getEnvelopeRequirements(envelopeIdToUse);
                
                const signerDataMap = new Map<string, { signerId: string, name: string, email: string, signed: boolean }>();

                // Inicializa o mapa com os dados básicos dos signatários
                rawSigners.forEach((s: any) => {
                    signerDataMap.set(s.id, {
                        signerId: s.id,
                        name: s.attributes?.name || 'Sem nome',
                        email: s.attributes?.email || 'Sem e-mail',
                        signed: false
                    });
                });

                // Mapeia o status via requisitos (lógica v3)
                requirements.forEach((req: any) => {
                    const signerId = req.relationships?.signer?.data?.id;
                    if (!signerId || !signerDataMap.has(signerId)) return;

                    const isCompleted = 
                        (req.attributes?.status || '').toLowerCase() === 'completed' || 
                        (req.attributes?.modified && req.attributes?.modified !== req.attributes?.created);

                    const current = signerDataMap.get(signerId)!;
                    current.signed = isCompleted || current.signed;
                });

                const signersList = Array.from(signerDataMap.values());
                return res.json({ success: true, signers: signersList });

            } catch (v3Error) {
                console.warn(`[GET SIGNERS] Erro v3 para ${clicksignId}:`, (v3Error as any).message);
                
                // Fallback para API v1
                try {
                    const docV1 = await ClickSignService.getDocumentV1(contract.document_id || '');
                    const listSigners = docV1.document?.signers || [];
                    const signEvents = (docV1.document?.events || []).filter((e: any) => e.name === 'sign');
                    
                    const signersList = listSigners.map((s: any) => {
                        const sigEvent = signEvents.find((e: any) => e.data?.signer?.email === s.email);
                        return {
                            name: s.name || s.email,
                            email: s.email,
                            signed: !!sigEvent
                        };
                    });
                    
                    return res.json({ success: true, signers: signersList });
                } catch (v1Error: any) {
                    console.error('[GET SIGNERS] Erro em ambas APIs', v1Error.message);
                    return res.json({ success: true, signers: [], message: 'Contrato legado ou indisponível' });
                }
            }
        } catch (error: any) {
            console.error('[GET SIGNERS] Erro ao importar serviço:', error);
            return res.status(500).json({ error: 'Erro interno ao processar signatários' });
        }
    } catch (error: any) {
        console.error('[GET SIGNERS] Erro principal:', error);
        res.status(500).json({ error: 'Erro ao buscar signatários' });
    }
};

export const sendSignerReminder = async (req: Request, res: Response) => {
    const { id, signerId } = req.params;
    const { message } = req.body as { message?: string };
    const targetId = BigInt(id);

    try {
        const contract = await prisma.contracts.findUnique({
            where: { id: targetId },
            select: { envelope_id: true, approved: true, signed: true }
        });

        if (!contract) {
            return res.status(404).json({ error: 'Contrato não encontrado' });
        }
        if (!contract.envelope_id) {
            return res.status(400).json({ error: 'Contrato não possui envelope Clicksign' });
        }
        if (!contract.approved) {
            return res.status(400).json({ error: 'Contrato ainda não foi enviado ao Clicksign' });
        }
        if (contract.signed) {
            return res.status(400).json({ error: 'Contrato já foi completamente assinado' });
        }

        const reminderMessage = (message && message.trim())
            ? message.trim()
            : 'Olá! Você tem um contrato aguardando a sua assinatura. Por favor, verifique seu email para assinar.';

        await ClickSignService.sendNotification(contract.envelope_id, signerId, reminderMessage);

        res.json({ success: true });
    } catch (error: any) {
        console.error('[SEND REMINDER] Erro ao enviar lembrete:', error.message);
        res.status(500).json({ error: 'Erro ao enviar lembrete', details: error.message });
    }
};