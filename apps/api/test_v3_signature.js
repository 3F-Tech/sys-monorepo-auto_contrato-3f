const axios = require('axios');
require('dotenv').config({ path: 'c:/Projects/automacao_contratos/apps/api/.env' });

const API_KEY = process.env.CLICKSIGN_API_TOKEN;
const BASE_URL = 'https://sandbox.clicksign.com/api/v3';

const clientV3 = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/vnd.api+json'
    }
});

async function runSignatureTest() {
    try {
        console.log('1. Criando Envelope...');
        const envRes = await clientV3.post('/envelopes', { data: { type: 'envelopes', attributes: { name: 'Teste Sig ' + Date.now() } } });
        const envelopeId = envRes.data.data.id;

        console.log('2. Adicionando Documento...');
        const docRes = await clientV3.post(`/envelopes/${envelopeId}/documents`, {
            data: { type: 'documents', attributes: { filename: 'teste.pdf', content_base64: 'data:application/pdf;base64,JVBERi0xLjQKJf...' } }
        });
        const documentId = docRes.data.data.id;

        console.log('3. Criando Signatário...');
        const s1 = await clientV3.post(`/envelopes/${envelopeId}/signers`, {
            data: { type: 'signers', attributes: { email: 'pedrobartelle+sig@3fventure.com.br', name: 'Pedro Augusto', documentation: '026.971.350-65', has_documentation: true, group: 1 } }
        });
        const signerId = s1.data.data.id;

        console.log('4. Vinculando com action: "signature" e role: "signer"...');
        await clientV3.post(`/envelopes/${envelopeId}/requirements`, {
            data: {
                type: 'requirements',
                attributes: { action: 'signature', role: 'signer' },
                relationships: {
                    document: { data: { type: 'documents', id: documentId } },
                    signer: { data: { type: 'signers', id: signerId } }
                }
            }
        });

        console.log('5. Ativando Envelope...');
        await clientV3.patch(`/envelopes/${envelopeId}`, {
            data: { type: 'envelopes', id: envelopeId, attributes: { status: 'running' } }
        });
        console.log('✅ SUCESSO COM SIGNATURE/SIGNER!');

    } catch (e) {
        console.log('❌ FALHA:', JSON.stringify(e.response?.data || e.message));
    }
}

runSignatureTest();
