import { prisma } from '../prisma';
import { ClickSignService } from './clickSignService';

export class ContractService {
    /**
     * Sincroniza o status de um contrato com o Clicksign (v3 e fallback v1).
     * Atualiza signed_count, total_signers, signed e signed_date.
     */
    static async syncWithClickSign(contractId: bigint) {
        console.log(`[SERVICE] Iniciando sincronização para o contrato ID: ${contractId}`);

        const contract = await prisma.contracts.findUnique({
            where: { id: contractId }
        });

        if (!contract) {
            throw new Error(`Contrato com ID ${contractId} não encontrado.`);
        }

        const clicksignId = (contract as any).envelope_id || contract.document_id || '';
        if (!clicksignId) {
            console.warn(`[SYNC] Contrato "${contract.title}" não possui ID do Clicksign.`);
            return contract;
        }

        let signedCount = 0;
        let totalSigners = contract.total_signers || 0;
        let isFullySigned = false;
        let foundEnvelopeId: string | null = null;

        try {
            let signersToUpdate: any[] = [];
            
            // 1. Tenta v3 (Envelopes/Requirements)
            try {
                const { envelopeId, signers: rawSigners } = await ClickSignService.getEnvelopeSigners(clicksignId);
                const envIdToUse = envelopeId || clicksignId;
                foundEnvelopeId = envelopeId;

                const requirements = await ClickSignService.getEnvelopeRequirements(envIdToUse);
                
                // Mapeia emails dos signatários via include=signer
                const signerEmailMap = new Map<string, string>();
                requirements.forEach((req: any) => {
                    const signerId = req.relationships?.signer?.data?.id;
                    const signerData = req.included?.find((inc: any) => inc.id === signerId && inc.type === 'signers');
                    if (signerId && signerData?.attributes?.email) {
                        signerEmailMap.set(signerId, signerData.attributes.email);
                    }
                });

                // Lógica de status por requisitos
                const signerStatus = new Map<string, { signed: boolean, email: string, name: string }>();
                
                requirements.forEach((req: any) => {
                    const signerId = req.relationships?.signer?.data?.id;
                    if (!signerId) return;
                    
                    const isCompleted = 
                        (req.attributes?.status || '').toLowerCase() === 'completed' || 
                        (req.attributes?.modified && req.attributes?.modified !== req.attributes?.created);
                    
                    const email = signerEmailMap.get(signerId) || '';
                    const name = req.included?.find((inc: any) => inc.id === signerId)?.attributes?.name || '';

                    if (!signerStatus.has(signerId) || isCompleted) {
                        signerStatus.set(signerId, { 
                            signed: isCompleted || (signerStatus.get(signerId)?.signed || false),
                            email,
                            name
                        });
                    }
                });

                signedCount = Array.from(signerStatus.values()).filter(v => v.signed).length;
                totalSigners = signerStatus.size;

                if (totalSigners === 0) {
                    totalSigners = rawSigners.length;
                }

                // Prepara assinatura para o banco
                signersToUpdate = Array.from(signerStatus.values()).map(s => ({
                    email: s.email,
                    name: s.name,
                    signed: s.signed,
                    signed_at: s.signed ? new Date() : null
                }));

                // Verificação final do Envelope
                try {
                    const envelopeData = await ClickSignService.getEnvelope(envIdToUse);
                    if (envelopeData?.attributes?.status === 'closed') {
                        isFullySigned = true;
                        signedCount = totalSigners;
                    }
                } catch (e) { /* ignore */ }

                isFullySigned = isFullySigned || (totalSigners > 0 && signedCount >= totalSigners);
                
            } catch (v3Error: any) {
                console.log(`[SYNC] Falha v3 (${v3Error.message}), tentando v1...`);
                // 2. Fallback v1 (Documentos Legados)
                try {
                    const docV1 = await ClickSignService.getDocumentV1(contract.document_id || '');
                    const document = docV1.document;
                    
                    if (document.status === 'closed') {
                        isFullySigned = true;
                    }

                    const listSigners = document.list || [];
                    totalSigners = listSigners.length;
                    signedCount = listSigners.filter((s: any) => s.signature?.signed_at).length;

                    signersToUpdate = listSigners.map((s: any) => ({
                        email: s.email,
                        name: s.name || s.email,
                        signed: !!s.signature?.signed_at,
                        signed_at: s.signature?.signed_at ? new Date(s.signature.signed_at) : null
                    }));

                    if (isFullySigned) {
                        signedCount = totalSigners;
                    }
                } catch (v1Error: any) {
                    console.warn(`[SYNC] Contrato "${contract.title}" (${clicksignId}): indisponível na v3 (${v3Error.message}) e v1 (${v1Error.message}). Retornando sem alteração.`);
                    return contract;
                }
            }

            // 3. Atualiza o Banco de Dados (Contrato)
            // Se o contador local bater ou se o status do envelope no Clicksign for 'closed'
            const markAsSigned = isFullySigned || (totalSigners > 0 && signedCount >= totalSigners);
            
            const updated = await prisma.contracts.update({
                where: { id: contractId },
                data: {
                    signed_count: signedCount,
                    total_signers: totalSigners > 0 ? totalSigners : undefined,
                    signed: markAsSigned,
                    // Define signed_date se acabou de ser assinado ou se está assinado mas não tinha data
                    signed_date: (markAsSigned && !contract.signed_date) ? new Date() : undefined,
                    ...(foundEnvelopeId && foundEnvelopeId !== (contract as any).envelope_id ? { envelope_id: foundEnvelopeId } : {})
                }
            });

            console.log(`[SYNC] Contrato "${contract.title}" sincronizado: ${signedCount}/${totalSigners} (Assinado: ${markAsSigned})`);
            return updated;

        } catch (error: any) {
            console.error(`[SYNC] Erro interno durante sincronização do contrato ${contractId}:`, error.message);
            throw error;
        }
    }
}
