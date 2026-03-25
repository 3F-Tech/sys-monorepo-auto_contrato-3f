
const axios = require('axios');
require('dotenv').config({ path: __dirname + '/../.env' });

async function testClickSign() {
    const token = process.env.CLICKSIGN_API_TOKEN;
    const url = process.env.CLICKSIGN_API_URL || 'https://sandbox.clicksign.com/api/v1';

    console.log('Testing with Token:', token ? (token.substring(0, 4) + '...') : 'UNDEFINED');
    console.log('URL:', url);

    // Test 1: Query Param (Standard for v1)
    try {
        console.log('\n--- Test 1: Query Param ---');
        const res = await axios.get(`${url}/documents`, {
            params: { access_token: token },
            headers: { 'Accept': 'application/vnd.api+json' }
        });
        console.log('Success! Documents found:', res.data.documents?.length);
    } catch (e) {
        console.log('Test 1 Failed:', e.response?.data || e.message);
    }

    // Test 2: Authorization Header (Standard for newer APIs)
    try {
        console.log('\n--- Test 2: Authorization Bearer ---');
        const res = await axios.get(`${url}/documents`, {
            headers: { 
                'Accept': 'application/vnd.api+json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Success! Documents found:', res.data.documents?.length);
    } catch (e) {
        console.log('Test 2 Failed:', e.response?.data || e.message);
    }

    // Test 3: Legacy Header (Token)
    try {
        console.log('\n--- Test 3: Token Header ---');
        const res = await axios.get(`${url}/documents`, {
            headers: { 
                'Accept': 'application/vnd.api+json',
                'Token': token
            }
        });
        console.log('Success! Documents found:', res.data.documents?.length);
    } catch (e) {
        console.log('Test 3 Failed:', e.response?.data || e.message);
    }
}

testClickSign();
