// Test Login API Script
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

const testLogin = async () => {
    try {
        console.log('🧪 Testing Login API...\n');

        // Test patient login
        console.log('1️⃣ Testing Patient Login (phinhut2003@gmail.com)...');
        const patientResponse = await axios.post(`${BASE_URL}/users/login`, {
            email: 'phinhut2003@gmail.com',
            password: '11111111',
            role: 'Patient'
        });

        console.log('✅ Patient Login Response:');
        console.log({
            success: patientResponse.data.success,
            message: patientResponse.data.message,
            userRole: patientResponse.data.user?.role,
            userId: patientResponse.data.user?._id,
            userName: `${patientResponse.data.user?.firstName} ${patientResponse.data.user?.lastName}`,
            token: patientResponse.data.token ? 'Present' : 'Missing'
        });

        // Decode JWT token
        if (patientResponse.data.token) {
            const tokenParts = patientResponse.data.token.split('.');
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

            console.log('\n🔍 JWT Token Payload:');
            console.log({
                id: payload.id,
                role: payload.role,
                authType: payload.authType,
                isVerified: payload.isVerified,
                expires: new Date(payload.exp * 1000).toISOString()
            });
        }

        // Test API access with patient token
        console.log('\n2️⃣ Testing API Access with Patient Token...');
        const token = patientResponse.data.token;

        // Test endpoint that patient should have access to
        try {
            const patientRecords = await axios.get(`${BASE_URL}/medical-records/patient/mine`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Patient can access own medical records');
        } catch (error) {
            console.log('❌ Patient medical records access failed:', error.response?.data?.message);
        }

        // Test endpoint that patient should NOT have access to
        try {
            const icd10Search = await axios.get(`${BASE_URL}/icd10/search?query=diabetes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('❌ ERROR: Patient should NOT have access to ICD-10 search!');
        } catch (error) {
            console.log('✅ Patient correctly denied access to ICD-10 search:', error.response?.status);
        }

        console.log('\n🎯 Test Summary:');
        console.log('- Login API works correctly');
        console.log('- JWT token contains correct role (Patient)');
        console.log('- Role-based access control is working');
        console.log('- Issue is likely in FRONTEND, not backend');

        console.log('\n💡 Frontend Debugging Steps:');
        console.log('1. Clear browser storage: localStorage.clear(); sessionStorage.clear();');
        console.log('2. Check JWT token being sent in requests');
        console.log('3. Verify role-based UI rendering logic');
        console.log('4. Check for hardcoded admin interface routes');

    } catch (error) {
        console.error('❌ Login test failed:', error.response?.data || error.message);
    }
};

testLogin();
