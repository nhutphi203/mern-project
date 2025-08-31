import request from 'supertest';
import app from './app.js';

async function testLoginFlow() {
    try {
        console.log('🔐 Testing login flow...');
        
        // Test Doctor Login
        console.log('1. Testing Doctor Login...');
        const doctorResponse = await request(app)
            .post('/api/v1/user/login')
            .send({
                email: 'test.doctor@hospital.com',
                password: 'testpassword123'
            });
            
        console.log('Doctor Response Status:', doctorResponse.status);
        console.log('Doctor Response Body:', JSON.stringify(doctorResponse.body, null, 2));
        
        // Test Patient Login
        console.log('\n2. Testing Patient Login...');
        const patientResponse = await request(app)
            .post('/api/v1/user/login')
            .send({
                email: 'test.patient@email.com',
                password: 'testpassword123'
            });
            
        console.log('Patient Response Status:', patientResponse.status);
        console.log('Patient Response Body:', JSON.stringify(patientResponse.body, null, 2));
        
        // Test with token if login successful
        if (doctorResponse.status === 200 && doctorResponse.body.token) {
            console.log('\n3. Testing Token Authentication...');
            const testResponse = await request(app)
                .get('/api/v1/medical-records/enhanced')
                .set('Authorization', `Bearer ${doctorResponse.body.token}`);
                
            console.log('Token Test Status:', testResponse.status);
            console.log('Token Test Body:', JSON.stringify(testResponse.body, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Login test error:', error);
    }
}

testLoginFlow();
