import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3007/login', {
      email: 'head@3fventure.com.br',
      password: '0233'
    });
    console.log('Login Success:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('Login Failed:', error.response?.status, JSON.stringify(error.response?.data, null, 2));
  }
}

testLogin();
