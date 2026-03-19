import axios from 'axios';

export class ClickSignService {
    private static apiToken = process.env.CLICKSIGN_API_TOKEN;
    private static apiUrl = process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1';

    private static getClient() {
        return axios.create({
            baseURL: this.apiUrl,
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            },
            params: {
                access_token: this.apiToken
            }
        });
    }

    /**
     * Faz o upload de um documento para o Clicksign via Base64.
     * @param base64Content Conteúdo do PDF em Base64
     * @param path Caminho/nome do arquivo no Clicksign (ex: "/contratos/nome.pdf")
     */
    static async createDocument(base64Content: string, path: string) {
        const client = this.getClient();
        
        try {
            const response = await client.post('/documents', {
                document: {
                    path,
                    content_base64: `data:application/pdf;base64,${base64Content}`,
                    deadline_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias default
                    auto_close: true,
                    locale: 'pt-BR',
                    sequence_enabled: false
                }
            });
            return response.data.document;
        } catch (error: any) {
            console.error('Error creating document in Clicksign:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Adiciona um signatário a um documento específico.
     * @param documentKey Chave única do documento no Clicksign
     * @param signerData Dados do signatário (email, nome, cpf, role, etc)
     */
    static async addSigner(documentKey: string, signerData: {
        email: string,
        name: string,
        cpf?: string,
        role: 'witness' | 'signer' | 'approver' | 'party',
        auth_group?: 'email' | 'sms' | 'whatsapp'
    }) {
        const client = this.getClient();

        try {
            // 1. Criar o signatário (ou recuperar se já existir)
            const signerResponse = await client.post('/signers', {
                signer: {
                    email: signerData.email,
                    auth_group: signerData.auth_group || 'email',
                    name: signerData.name,
                    documentation: signerData.cpf,
                    has_documentation: !!signerData.cpf
                }
            });

            const signerKey = signerResponse.data.signer.key;

            // 2. Vincular o signatário ao documento (Listar como Signatário)
            await client.post('/lists', {
                list: {
                    document_key: documentKey,
                    signer_key: signerKey,
                    sign_as: signerData.role,
                    message: 'Prezado, por favor assine o contrato da 3F Venture.'
                }
            });

            return signerKey;
        } catch (error: any) {
            console.error('Error adding signer in Clicksign:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Notifica os signatários para assinarem (dispara os e-mails).
     * @param documentKey Chave única do documento
     */
    static async sendSignatureRequests(documentKey: string) {
        const client = this.getClient();

        try {
            await client.post('/notifications', {
                request: {
                    document_key: documentKey,
                    message: 'Prezado, o contrato está pronto para sua assinatura.'
                }
            });
            return true;
        } catch (error: any) {
            console.error('Error sending signature requests in Clicksign:', error.response?.data || error.message);
            throw error;
        }
    }
}
