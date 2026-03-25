
const axios = require('axios');
require('dotenv').config({ path: __dirname + '/../.env' });

async function testSignAs() {
    const token = process.env.CLICKSIGN_API_TOKEN;
    const url = process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1';
    
    // We'll create a new document first to be clean
    const client = axios.create({
        baseURL: url,
        params: { access_token: token },
        headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/json' }
    });

    try {
        console.log('--- Step 1: Create Document ---');
        const docRes = await client.post('/documents', {
            document: {
                path: '/test/test_sign_as.pdf',
                content_base64: 'data:application/pdf;base64,JVBERi0xLjQKJ favor ignore this content, it is just a minimal pdf header for testing...',
                // Minimal valid PDF Base64
                content_base64: 'data:application/pdf;base64,JVBERi0xLjEKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL1Jlc291cmNlcyA8PCA+CiAgICAgL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXQogID4+CmVuZG9iagp0cmFpbGVyCiAgPDwgL1Jvb3QgMSAwIFIKICA+PgolJUVPRgo='
            }
        });
        const documentKey = docRes.data.document.key;
        console.log('Document Created:', documentKey);

        console.log('\n--- Step 2: Create Signer ---');
        const signerRes = await client.post('/signers', {
            signer: {
                email: 'mateus+test_roles@3fventure.com.br',
                name: 'Mateus Roles',
                auths: ['email'],
                delivery: 'email',
                has_documentation: false
            }
        });
        const signerKey = signerRes.data.signer.key;
        console.log('Signer Created:', signerKey);

        const rolesToTest = ['signer', 'witness', 'party', 'signatario', 'testemunha', 'transferor', 'transferee', 'intervening', 'guarantor'];

        for (const role of rolesToTest) {
            try {
                console.log(`\nTesting role: ${role}`);
                const res = await client.post('/lists', {
                    list: {
                        document_key: documentKey,
                        signer_key: signerKey,
                        sign_as: role
                    }
                });
                console.log(`SUCCESS with role: ${role}`);
            } catch (e) {
                console.log(`FAILED with role: ${role}. Error:`, e.response?.data?.errors || e.message);
            }
        }

    } catch (e) {
        console.log('Setup Error:', e.response?.data || e.message);
    }
}

testSignAs();
