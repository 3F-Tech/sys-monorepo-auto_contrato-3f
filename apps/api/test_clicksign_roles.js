const axios = require('axios');
require('dotenv').config({ path: 'c:/Projects/automacao_contratos/apps/api/.env' });

const API_KEY = process.env.CLICKSIGN_API_TOKEN;
const API_URL = process.env.CLICKSIGN_API_URL;

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
    },
    params: {
        access_token: API_KEY
    }
});

async function testRoles() {
    console.log('--- TESTANDO MAIS ROLES NO CLICKSIGN /LISTS ---');
    
    const documentKey = 'c62bbdfa-1bf1-4566-b527-59c2e1951bef'; 
    const signerKey = '72767ce2-ec3c-4698-b309-4046d04571f4';

    const rolesToTest = ['contractee', 'contratante', 'contratada', 'signatory', 'subscriber', 'issuer'];
    
    for (const role of rolesToTest) {
        try {
            console.log(`Testando vincular com role: ${role}...`);
            await client.post('/lists', {
                list: {
                    document_key: documentKey,
                    signer_key: signerKey,
                    sign_as: role
                }
            });
            console.log(`✅ Role ${role} ACEITA!`);
        } catch (error) {
            console.log(`❌ Role ${role} REJEITADA:`, error.response?.data?.errors || error.message);
        }
    }
}

testRoles();
