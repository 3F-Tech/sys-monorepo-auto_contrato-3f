const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: 'c:/Projects/automacao_contratos/apps/api/.env' });

// Mock services
const ClickSignService = {
    sanitizeSignerName: (name) => name.replace(/[0-9]/g, '').trim(),
    maskCPF: (cpf) => cpf,
    getClient: () => {
        const apiToken = process.env.CLICKSIGN_API_TOKEN;
        const apiUrl = (process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1').replace('/api/v1', '/api/v3');
        return axios.create({
            baseURL: apiUrl,
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json',
                'Authorization': apiToken
            }
        });
    },
    async createEnvelope(name) {
        console.log('Mock: createEnvelope', name);
        const client = this.getClient();
        const response = await client.post('/envelopes', { data: { type: 'envelopes', attributes: { name } } });
        return response.data.data;
    },
    async addDocumentToEnvelope(envelopeId, filename, base64Content) {
        console.log('Mock: addDocumentToEnvelope', envelopeId);
        const client = this.getClient();
        const response = await client.post(`/envelopes/${envelopeId}/documents`, {
            data: { type: 'documents', attributes: { filename, content_base64: 'data:application/pdf;base64,JVBERi0xLjQK' } }
        });
        return response.data.data;
    },
    async addSignerToEnvelope(envelopeId, signerData) {
        console.log('Mock: addSignerToEnvelope', signerData.name);
        const client = this.getClient();
        const response = await client.post(`/envelopes/${envelopeId}/signers`, {
            data: {
                type: 'signers',
                attributes: {
                    email: signerData.email,
                    name: this.sanitizeSignerName(signerData.name),
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
    },
    async addBulkRequirements(envelopeId, operations) {
        console.log('Mock: addBulkRequirements', operations.length);
        const client = this.getClient();
        const response = await client.post(`/envelopes/${envelopeId}/bulk_requirements`, {
            'atomic:operations': operations
        });
        return response.data;
    },
    async finalizeEnvelope(envelopeId) {
        console.log('Mock: finalizeEnvelope', envelopeId);
        const client = this.getClient();
        await client.patch(`/envelopes/${envelopeId}`, {
            data: { type: 'envelopes', id: envelopeId, attributes: { status: 'running' } }
        });
    },
    async sendNotification() {
        console.log('Mock: sendNotification');
    }
};

async function testLogic() {
    const fileName = 'Empresa_Impulse_Plano_1';
    const debugMode = 'preencher';
    const isPreencherDebug = fileName.includes('Plano 1 - Impulse') && debugMode === 'preencher';
    
    console.log('isPreencherDebug:', isPreencherDebug);

    try {
        const envelope = await ClickSignService.createEnvelope(fileName);
        const envelopeId = envelope.id;
        const document = await ClickSignService.addDocumentToEnvelope(envelopeId, fileName, 'base64');
        const documentId = document.id;

        const signersToProcess = [];
        if (isPreencherDebug) {
            signersToProcess.push({ email: 'mateus@3fventure.com.br', name: 'Mateus (Contratante)', role: 'contractor' });
            signersToProcess.push({ email: 'maysson@3fventure.com.br', name: 'Maysson (Vendedor)', role: 'witness' });
        }

        const bulkOps = [];
        const addedSignersInfo = [];
        for (const s of signersToProcess) {
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
        console.log('✅ Success!');
    } catch (e) {
        console.error('❌ Failure:', e.response?.data ? JSON.stringify(e.response.data) : e.message);
    }
}

testLogic();
