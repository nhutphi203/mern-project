// Test encounters API
import axios from 'axios';

async function testEncountersAPI() {
    try {
        console.log('🏥 Testing Encounters API...\n');

        // Login first
        const loginResponse = await axios.post('http://localhost:4000/api/v1/users/login', {
            email: 'nhutadmin@gmail.com',
            password: '11111111',
            role: 'Admin'
        }, { withCredentials: true });

        const cookies = loginResponse.headers['set-cookie'];
        const cookieString = cookies ? cookies.join('; ') : '';

        // Test encounters API
        const response = await axios.get('http://localhost:4000/api/v1/encounters?limit=10', {
            headers: { 'Cookie': cookieString }
        });

        console.log('✅ Encounters API Response:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Encounters count: ${response.data.encounters?.length || 0}`);

        if (response.data.encounters && response.data.encounters.length > 0) {
            console.log('\n📋 Sample encounters:');
            response.data.encounters.forEach((encounter, index) => {
                console.log(`   ${index + 1}. ${encounter._id}`);
                console.log(`      Patient: ${encounter.patientId?.firstName} ${encounter.patientId?.lastName}`);
                console.log(`      Status: ${encounter.status}`);
                console.log(`      CheckIn: ${encounter.checkInTime || 'N/A'}`);
            });
        } else {
            console.log('   No encounters found');
        }

    } catch (error) {
        console.error('❌ Encounters API Test Failed:', error.response?.data || error.message);
    }
}

testEncountersAPI();
