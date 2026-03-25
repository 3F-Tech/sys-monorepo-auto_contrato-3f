import { Request, Response } from 'express';
import { prisma } from '../prisma';

/**
 * Handle Webhooks from Clicksign (v3)
 */
export const handleClicksignWebhook = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        console.log('[WEBHOOK CLICKSIGN] Body Completo:', JSON.stringify(payload, null, 2));
        
        // Clicksign v3 webhook payload structures can vary, but usually:
        // { event: "closed", data: { id: "...", type: "envelopes" } }
        // { event: "closed", envelope: { id: "..." } }
        const event = payload.event?.name;
        // O Webhook da Clicksign dispara para Documentos, então pegamos o ID do Documento
        const clicksignKey = payload.document?.key || payload.envelope?.id || payload.data?.id;

        console.log(`[WEBHOOK CLICKSIGN] Evento recebido: "${event}" para Clicksign Key: ${clicksignKey}`);

        // Eventos de Assinatura Individual ou Finalização
        const validClosedEvents = ['closed', 'auto_close', 'close', 'document_closed'];
        const isSignedEvent = event === 'signer_signed';
        const isClosedEvent = event && validClosedEvents.includes(event);

        if (isSignedEvent || isClosedEvent) {
            // Busca o contrato pelo clicksignKey (pode ser document_id ou envelope_id)
            const contract = await (prisma.contracts as any).findFirst({
                where: {
                    OR: [
                        { document_id: clicksignKey },
                        { envelope_id: clicksignKey }
                    ]
                }
            });

            if (contract) {
                if (isClosedEvent) {
                    console.log(`[TRIGGER] Contrato "${contract.title}" totalmente assinado!`);
                    await (prisma.contracts as any).update({
                        where: { id: contract.id },
                        data: {
                            signed: true,
                            signed_date: new Date(),
                            signed_count: contract.total_signers > 0 ? contract.total_signers : undefined,
                            change_status: 'Assinado via Clicksign'
                        }
                    });
                } else if (isSignedEvent) {
                    console.log(`[WEBHOOK] Signatário assinou o contrato "${contract.title}". Atualizando contagem...`);
                    // Incrementamos a contagem se ainda não for o total
                    const newCount = (contract.signed_count || 0) + 1;
                    await (prisma.contracts as any).update({
                        where: { id: contract.id },
                        data: {
                            signed_count: newCount
                        }
                    });
                }
            } else {
                console.error(`[WEBHOOK] ERRO: Documento Clicksign ${clicksignKey} não encontrado no banco.`);
            }
        }

        // Retornar 200 OK para a Clicksign
        return res.status(200).json({ status: 'received' });
    } catch (error: any) {
        console.error('[WEBHOOK CLICKSIGN] Erro Crítico:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
