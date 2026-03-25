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
 *               change_status:
 *                 type: string
 *                 nullable: true
 *               change_description:
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
        const { signed, signed_date, link, change_status, change_description } = req.body;
        
        // Verifica se pelo menos uma propriedade foi enviada no body (mesmo que seja false ou null)
        if (signed === undefined && signed_date === undefined && link === undefined && change_status === undefined && change_description === undefined) {
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

        const contract = await prisma.contracts.update({
            where: { id: BigInt(id) },
            data: {
                ...(signed !== undefined && { signed }),
                ...(signed_date !== undefined && { signed_date }),
                ...(link !== undefined && { link }),
                ...(change_status !== undefined && { change_status }),
                ...(change_description !== undefined && { change_description })
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
export const deleteContract = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const targetId = BigInt(id);

        console.log(`[DELETE] Iniciando exclusão do contrato ID: ${targetId}`);

        // 1. Buscar detalhes do contrato para limpeza externa
        const contract = await (prisma.contracts as any).findUnique({
            where: { id: targetId },
            select: { 
                document_id: true, 
                envelope_id: true,
                title: true
            }
        });

        if (!contract) {
            return res.status(404).json({ error: 'Contrato não encontrado para exclusão.' });
        }

        const clicksignId = (contract as any).envelope_id || contract.document_id;
        const driveFileId = contract.document_id; // No nosso sistema v3, document_id armazena o ID do arquivo no Drive

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

        const contract = await prisma.contracts.findUnique({
            where: { id: targetId }
        });

        if (!contract) return res.status(404).json({ error: 'Contrato não encontrado' });
        const clicksignId = (contract as any).envelope_id || contract.document_id || '';
        if (!clicksignId) return res.status(400).json({ error: 'Contrato não possui ID do Clicksign para sincronizar' });

        console.log(`[SYNC] Sincronizando contrato "${contract.title}" (ClickSign ID: ${clicksignId})...`);

        let signedCount = 0;
        let totalSigners = contract.total_signers || 0;
        let isFullySigned = false;

        try {
            const { ClickSignService } = await import('../services/clickSignService.js');
            try {
                // Busca os requisitos com os signatários incluídos
                const { envelopeId } = await ClickSignService.getEnvelopeSigners(clicksignId);
                const requirements = await ClickSignService.getEnvelopeRequirements(envelopeId || clicksignId);
                
                // Lógica final v3: Um signatário "assinou" se seus requisitos foram modificados após a criação
                // (ou se tiverem o status 'completed' se a API começar a enviar).
                const signerStatus = new Map<string, boolean>();
                
                requirements.forEach((req: any) => {
                    const signerId = req.relationships?.signer?.data?.id;
                    if (!signerId) return;
                    
                    const isCompleted = 
                        (req.attributes?.status || '').toLowerCase() === 'completed' || 
                        (req.attributes?.modified && req.attributes?.modified !== req.attributes?.created);
                    
                    // Se o signatário já tinha um requisito "não assinado", mantemos. 
                    // Se todos os requisitos de um signatário forem "completed", ele assinou.
                    // Na v3, geralmente 1 requisito modificado = assinou (mesmo que tenha 2, eles modificam juntos).
                    if (!signerStatus.has(signerId) || isCompleted) {
                        signerStatus.set(signerId, isCompleted || (signerStatus.get(signerId) || false));
                    }
                });

                signedCount = Array.from(signerStatus.values()).filter(v => v).length;
                totalSigners = signerStatus.size;

                // Fallback se totalSigners vier zerado
                if (totalSigners === 0) {
                    const { signers } = await ClickSignService.getEnvelopeSigners(envelopeId || clicksignId);
                    totalSigners = signers.length;
                }

                console.log(`[CLICKSIGN DEBUG] Final Count V3: ${signedCount}/${totalSigners}`);

                // Se encontramos um envelopeId diferente (fallback), salvamos
                if (envelopeId && envelopeId !== (contract as any).envelope_id) {
                    await (prisma.contracts as any).update({
                        where: { id: targetId },
                        data: { envelope_id: envelopeId }
                    });
                    console.log(`[SYNC] Envelope ID atualizado: ${envelopeId}`);
                }

                // Verifica se está assinado
                isFullySigned = (totalSigners > 0 && signedCount >= totalSigners);
                
                try {
                    const envelopeData = await ClickSignService.getEnvelope(envelopeId || clicksignId);
                    if (envelopeData?.attributes?.status === 'closed') {
                        isFullySigned = true;
                    }
                } catch (e) { /* ignore */ }

            } catch (v3Error) {
                console.log('[SYNC] Não encontrado na v3, tentando v1...');
                // Tenta v1 se v3 falhar (contratos legados)
                try {
                    const statusV1 = await ClickSignService.getDocumentStatusV1(contract.document_id || '');
                    if (statusV1 === 'closed') {
                        isFullySigned = true;
                        if (totalSigners === 0) totalSigners = 5; // Fallback comum em nosso sistema
                        signedCount = totalSigners;
                    }
                } catch (v1Error: any) {
                    console.error('[SYNC] Erro em ambas APIs (v3/v1):', (v3Error as any).message, v1Error.message);
                    throw v3Error; // Relança o erro da v3 que é mais provável ser o atual
                }
            }

            // Atualiza o banco
            const updated = await prisma.contracts.update({
                where: { id: targetId },
                data: {
                    signed_count: signedCount,
                    total_signers: totalSigners > 0 ? totalSigners : undefined,
                    signed: isFullySigned || (totalSigners > 0 && signedCount >= totalSigners),
                    signed_date: (isFullySigned && !contract.signed_date) ? new Date() : undefined
                }
            });

            const serialized = JSON.parse(JSON.stringify(updated, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));

            // Envia resposta final
            res.json({ success: true, contract: serialized });
        } catch (error: any) {
            console.error('[SYNC] Erro interno:', error);
            res.status(500).json({ error: 'Erro ao sincronizar', details: error.message });
        }
    } catch (error: any) {
        console.error('[SYNC] Erro principal:', error);
        res.status(500).json({ error: 'Erro ao buscar contrato para sincronizar' });
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
            const { ClickSignService } = await import('../services/clickSignService.js');
            
            // Busca dados v3
            let envelopeIdToUse = clicksignId;
            try {
                const { envelopeId, signers: rawSigners } = await ClickSignService.getEnvelopeSigners(clicksignId);
                envelopeIdToUse = envelopeId || clicksignId;
                
                const requirements = await ClickSignService.getEnvelopeRequirements(envelopeIdToUse);
                
                const signerDataMap = new Map<string, { name: string, email: string, signed: boolean }>();

                // Inicializa o mapa com os dados básicos dos signatários
                rawSigners.forEach((s: any) => {
                    signerDataMap.set(s.id, {
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
                // Se falhar a v3, tentamos retornar apenas uma lista vazia ou erro amigável
                console.warn('[GET SIGNERS] Erro v3:', (v3Error as any).message);
                return res.json({ success: true, signers: [], message: 'Contrato legado ou indisponível na v3' });
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