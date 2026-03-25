import axios from 'axios';

export class ClickSignService {
    private static getClient() {
        const apiToken = process.env.CLICKSIGN_API_TOKEN;
        // Note: Em v3 a URL base costuma ser /api/v3
        const apiUrl = (process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1').replace('/api/v1', '/api/v3');

        return axios.create({
            baseURL: apiUrl,
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json',
                'Authorization': apiToken
            }
        });
    }

    /**
     * Cria um Envelope no Clicksign (v3).
     */
    static async createEnvelope(name: string) {
        const client = this.getClient();
        try {
            const response = await client.post('/envelopes', {
                data: {
                    type: 'envelopes',
                    attributes: {
                        name
                    }
                }
            });
            return response.data.data;
        } catch (error: any) {
            console.error('Error creating envelope in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Adiciona um documento PDF ao envelope (v3).
     */
    static async addDocumentToEnvelope(envelopeId: string, filename: string, base64Content: string) {
        const client = this.getClient();
        try {
            const response = await client.post(`/envelopes/${envelopeId}/documents`, {
                data: {
                    type: 'documents',
                    attributes: {
                        filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
                        content_base64: `data:application/pdf;base64,${base64Content}`
                    }
                }
            });
            return response.data.data;
        } catch (error: any) {
            console.error('Error adding document to envelope in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Auxiliar para formatar CPF com máscara (v3 exige assim em algumas contas).
     */
    private static maskCPF(cpf: string) {
        const d = cpf.replace(/\D/g, '');
        if (d.length !== 11) return cpf;
        return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
    }

    /**
     * Adiciona um signatário ao envelope (v3).
     */
    static async addSignerToEnvelope(envelopeId: string, signerData: {
        email: string,
        name: string,
        cpf?: string
    }) {
        const client = this.getClient();
        try {
            const response = await client.post(`/envelopes/${envelopeId}/signers`, {
                data: {
                    type: 'signers',
                    attributes: {
                        email: signerData.email,
                        name: signerData.name,
                        documentation: signerData.cpf ? this.maskCPF(signerData.cpf) : undefined,
                        has_documentation: !!signerData.cpf,
                        group: 1,
                        location_required_enabled: false,
                        refusable: false,
                        communicate_events: {
                            signature_request: 'email',
                            signature_reminder: 'email',
                            document_signed: 'email'
                        }
                    }
                }
            });
            return response.data.data;
        } catch (error: any) {
            console.error('Error adding signer to envelope in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Cria as relações (requirements) entre signatários e documentos em lote (v3).
     */
    static async addBulkRequirements(envelopeId: string, operations: any[]) {
        const client = this.getClient();
        try {
            const response = await client.post(`/envelopes/${envelopeId}/bulk_requirements`, {
                'atomic:operations': operations
            });
            return response.data;
        } catch (error: any) {
            console.error('Error adding bulk requirements in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Finaliza o envelope (v3) - Muda status para 'running'.
     */
    static async finalizeEnvelope(envelopeId: string) {
        const client = this.getClient();
        try {
            await client.patch(`/envelopes/${envelopeId}`, {
                data: {
                    type: 'envelopes',
                    id: envelopeId,
                    attributes: {
                        status: 'running'
                    }
                }
            });
            return true;
        } catch (error: any) {
            console.error('Error finalizing envelope in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Envia notificação para um signatário específico (v3).
     */
    static async sendNotification(envelopeId: string, signerId: string, message: string) {
        const client = this.getClient();
        try {
            const response = await client.post(`/envelopes/${envelopeId}/signers/${signerId}/notifications`, {
                data: {
                    type: 'notifications',
                    attributes: {
                        message
                    }
                }
            });
            return response.data.data;
        } catch (error: any) {
            console.error('Error sending notification in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Busca os dados de um Envelope pelo ID (v3).
     */
    static async getEnvelope(envelopeId: string) {
        const client = this.getClient();
        try {
            const response = await client.get(`/envelopes/${envelopeId}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting envelope in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Busca os dados de um Documento pelo ID (v3).
     */
    static async getDocumentV3(documentId: string) {
        const client = this.getClient();
        try {
            const response = await client.get(`/documents/${documentId}`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting document in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Busca os signatários de um Envelope (v3).
     */
    static async getEnvelopeSigners(clicksignId: string) {
        const client = this.getClient();
        try {
            const response = await client.get(`/envelopes/${clicksignId}/signers`);
            const signers = response.data.data;
            // if (signers.length > 0) {
            //     console.log(`[CLICKSIGN DEBUG] First signer keys:`, Object.keys(signers[0]));
            //     console.log(`[CLICKSIGN DEBUG] First signer attributes:`, Object.keys(signers[0].attributes || {}));
            //     console.log(`[CLICKSIGN DEBUG] Full first signer:`, JSON.stringify(signers[0]));
            // }
            // console.log(`[CLICKSIGN DEBUG] All statuses:`, signers.map((s: any) => s.attributes?.status).join(', '));
            return { signers, envelopeId: clicksignId };
        } catch (error: any) {
            if (error.response?.status === 404) {
                try {
                    console.log(`[CLICKSIGN] ID ${clicksignId} não é um envelope. Tentando como documento v3...`);
                    const doc = await this.getDocumentV3(clicksignId);
                    const envId = doc.relationships?.envelope?.data?.id;
                    
                    if (envId) {
                        console.log(`[CLICKSIGN] Envelope encontrado: ${envId}. Buscando signatários...`);
                        const response = await client.get(`/envelopes/${envId}/signers`);
                        const signers = response.data.data;
                        if (signers.length > 0) {
                            console.log(`[CLICKSIGN DEBUG Fallback] First signer attributes:`, Object.keys(signers[0].attributes || {}));
                            console.log(`[CLICKSIGN DEBUG Fallback] Full first signer:`, JSON.stringify(signers[0]));
                        }
                        console.log(`[CLICKSIGN DEBUG Fallback] All statuses:`, signers.map((s: any) => s.attributes?.status).join(', '));
                        return { signers, envelopeId: envId };
                    } else {
                        console.warn(`[CLICKSIGN] Documento ${clicksignId} não possui envelope vinculado.`);
                    }
                } catch (e) {
                    console.error(`[CLICKSIGN] Falha no fallback para ${clicksignId}:`, (e as any).message);
                }
            }
            console.error('Error getting signers in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Busca os requisitos (requirements) de um Envelope (v3).
     * É aqui que fica o status de quem já assinou na v3.
     */
    static async getEnvelopeRequirements(envelopeId: string) {
        const client = this.getClient();
        try {
            // Adicionamos include=signer para facilitar o mapeamento
            const response = await client.get(`/envelopes/${envelopeId}/requirements?include=signer`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting requirements in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Busca os documentos de um Envelope (v3).
     */
    static async getEnvelopeDocuments(envelopeId: string) {
        const client = this.getClient();
        try {
            const response = await client.get(`/envelopes/${envelopeId}/documents`);
            return response.data.data;
        } catch (error: any) {
            console.error('Error getting documents in Clicksign v3:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    private static getV1Client() {
        const apiToken = process.env.CLICKSIGN_API_TOKEN;
        const apiUrl = process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1';
        return axios.create({
            baseURL: apiUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            params: {
                access_token: apiToken
            }
        });
    }

    static async getDocumentStatusV1(documentKey: string) {
        const client = this.getV1Client();
        try {
            const response = await client.get(`/documents/${documentKey}`);
            return response.data.document.status;
        } catch (error: any) {
            console.error('Error getting document in Clicksign v1:', JSON.stringify(error.response?.data || error.message));
            throw error;
        }
    }

    /**
     * Tenta cancelar na v3 (como envelope) ou na v1 (como documento).
     */
    static async cancelDocument(clicksignId: string): Promise<boolean> {
        // Tenta v3 como envelope primeiro
        try {
            const clientV3 = this.getClient();
            await clientV3.patch(`/envelopes/${clicksignId}/cancel`);
            return true;
        } catch (errV3: any) {
            // Se der erro 404, não é um envelope v3. Continua para v1.
            // Se der erro por não estar running, tenta alterar o status para canceled.
            if (errV3.response?.status === 404 || errV3.response?.status === 422) {
                try {
                    const clientV3 = this.getClient();
                    await clientV3.patch(`/envelopes/${clicksignId}`, {
                        data: {
                            type: 'envelopes',
                            id: clicksignId,
                            attributes: { status: 'canceled' }
                        }
                    });
                    return true;
                } catch (e2) {
                    // Ignora, vai para v1
                }
            } else {
                console.error('Error canceling envelope in v3:', errV3.response?.data || errV3.message);
            }
        }

        // Tenta cancelar na v1
        try {
            const clientV1 = this.getV1Client();
            await clientV1.patch(`/documents/${clicksignId}/cancel`);
            return true;
        } catch (errV1: any) {
            console.error('Error canceling document in v1:', errV1.response?.data || errV1.message);
            throw new Error('Não foi possível cancelar o documento/envelope no Clicksign.');
        }
    }
}
