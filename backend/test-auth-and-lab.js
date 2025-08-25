import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

async function testAuthentication() {
    console.log('🔐 Testing Authentication Endpoints');
    
    // Test available users
    const testUsers = [
        { email: 'admin@hospital.com', password: 'password123', role: 'Admin' },
        { email: 'doctor@hospital.com', password: 'password123', role: 'Doctor' },
        { email: 'test.doctor.lab@hospital.com', password: 'password123', role: 'Doctor' },
        { email: 'john.smith@hospital.com', password: 'securepass123', role: 'Doctor' },
        { email: 'nhutadmin@gmail.com', password: '11111111', role: 'Admin' }
    ];

    for (const user of testUsers) {
        console.log(`\n🧪 Testing: ${user.email} (${user.role})`);
        
        try {
            const response = await axios.post(`${BASE_URL}/users/login`, {
                email: user.email,
                password: user.password,
                role: user.role
            });
            
            if (response.data.success) {
                console.log(`✅ Login successful!`);
                console.log(`👤 User: ${response.data.user.firstName} ${response.data.user.lastName}`);
                console.log(`🎭 Role: ${response.data.user.role}`);
                console.log(`🆔 ID: ${response.data.user._id}`);
                console.log(`🔑 Token: ${response.data.token.substring(0, 20)}...`);
                
                // If this is a doctor, test lab endpoint
                if (response.data.user.role === 'Doctor') {
                    console.log(`\n🔬 Testing lab endpoint with this doctor...`);
                    
                    try {
                        const labResponse = await axios.get(`${BASE_URL}/lab/tests`, {
                            headers: {
                                'Authorization': `Bearer ${response.data.token}`
                            }
                        });
                        
                        console.log(`✅ Lab endpoint accessible: ${labResponse.data.success}`);
                        console.log(`📊 Data: ${JSON.stringify(labResponse.data, null, 2)}`);
                        
                    } catch (labError) {
                        console.log(`❌ Lab endpoint error: ${labError.response?.status} - ${labError.response?.data?.message || labError.message}`);
                        
                        if (labError.response?.status === 403) {
                            console.log(`🚨 ACCESS DENIED - Doctor role cannot access lab endpoints`);
                        }
                    }
                }
                
                break; // Found working credentials
            }
            
        } catch (error) {
            console.log(`❌ Login failed: ${error.response?.data?.message || error.message}`);
        }
    }
}

testAuthentication();
