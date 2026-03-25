
const axios = require('axios');
require('dotenv').config({ path: __dirname + '/../.env' });

async function testCPF() {
    const token = process.env.CLICKSIGN_API_TOKEN;
    const url = process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1';

    const client = axios.create({
        baseURL: url,
        params: { access_token: token },
        headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/json' }
    });

    const cpfWithFormatting = '013.266.710-06';
    const cpfDigitsOnly = cpfWithFormatting.replace(/\D/g, '');

    console.log('Testing CPF with formatting:', cpfWithFormatting);
    try {
        await client.post('/signers', {
            signer: {
                email: 'mateus+cpf1@3fventure.com.br',
                name: 'Mateus CPF Um',
                auths: ['email'],
                delivery: 'email',
                documentation: cpfWithFormatting,
                has_documentation: true
            }
        });
        console.log('Success with formatting!');
    } catch (e) {
        console.log('Failed with formatting:', e.response?.data?.errors || e.message);
    }

    console.log('\nTesting CPF digits only:', cpfDigitsOnly);
    try {
        const res = await client.post('/signers', {
            signer: {
                email: 'mateus+cpf2@3fventure.com.br',
                name: 'Mateus CPF Dois',
                auths: ['email'],
                delivery: 'email',
                documentation: cpfDigitsOnly,
                has_documentation: true
            }
        });
        console.log('Success with digits only! Key:', res.data.signer.key);
    } catch (e) {
        console.log('Failed with digits only:', e.response?.data?.errors || e.message);
    }
}

testCPF();
