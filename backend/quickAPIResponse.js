// Quick API response check
import axios from 'axios';

async function checkAPIResponse() {
    try {
        // Login
        const loginResponse = await axios.post('http://localhost:4000/api/v1/users/login', {
            email: 'nhutadmin@gmail.com',
            password: '11111111',
            role: 'Admin'
        }, { withCredentials: true });

        const cookies = loginResponse.headers['set-cookie'];
        const cookieString = cookies ? cookies.join('; ') : '';

        // Get lab queue
        const response = await axios.get('http://localhost:4000/api/v1/lab/queue', {
            headers: { 'Cookie': cookieString }
        });

        console.log('🔍 API Response Structure:');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAPIResponse();
