
const axios = require('axios');
require('dotenv').config({ path: __dirname + '/../.env' });

async function testAddSigner() {
    const token = process.env.CLICKSIGN_API_TOKEN;
    const url = process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1';

    const client = axios.create({
        baseURL: url,
        params: { access_token: token },
        headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/json' }
    });

    try {
        console.log('--- Test: FINAL (auths array + delivery) ---');
        const payload = {
            signer: {
                email: 'mateus+testfinal@3fventure.com.br',
                name: 'Mateus Teste Final',
                auths: ['email'],
                delivery: 'email',
                has_documentation: false
            }
        };
        const res = await client.post('/signers', payload);
        console.log('Success! Key:', res.data.signer.key);
    } catch (e) {
        console.log('Failed:', e.response?.data || e.message);
    }
}

testAddSigner();
