#!/usr/bin/env node

/**
 * Test Authentication Fix - Debug middleware issues
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:4000/api/v1';

async function testAuthFix() {
    try {
        console.log('🧪 TESTING AUTHENTICATION FIX\n');

        // Step 1: Login and get token
        console.log('1️⃣ Testing login...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            email: 'admin.test@hospital.com',
            password: 'Admin123!',
            role: 'Admin'
        });

        if (!loginResponse.data.success) {
            console.log('❌ Login failed');
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('   Token:', token ? 'Received' : 'Missing');
        
        // Decode token to verify payload
        const decoded = jwt.decode(token);
        console.log('   Decoded Token:', JSON.stringify(decoded, null, 2));

        // Step 2: Test protected endpoint with different header formats
        console.log('\n2️⃣ Testing protected endpoints...');
        
        // Test format 1: "Bearer token"
        console.log('\n🔹 Testing with "Bearer token" format:');
        try {
            const response1 = await axios.get(`${BASE_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Bearer format works:', response1.data.user ? `User: ${response1.data.user.email}` : 'No user data');
        } catch (error) {
            console.log('❌ Bearer format failed:', error.response?.status, error.response?.data?.message);
        }

        // Test format 2: "JWT token"  
        console.log('\n🔹 Testing with "JWT token" format:');
        try {
            const response2 = await axios.get(`${BASE_URL}/users/me`, {
                headers: {
                    'Authorization': `JWT ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ JWT format works:', response2.data.user ? `User: ${response2.data.user.email}` : 'No user data');
        } catch (error) {
            console.log('❌ JWT format failed:', error.response?.status, error.response?.data?.message);
        }

        // Test format 3: Direct token
        console.log('\n🔹 Testing with direct token:');
        try {
            const response3 = await axios.get(`${BASE_URL}/users/me`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Direct token works:', response3.data.user ? `User: ${response3.data.user.email}` : 'No user data');
        } catch (error) {
            console.log('❌ Direct token failed:', error.response?.status, error.response?.data?.message);
        }

        // Test with cookie approach
        console.log('\n🔹 Testing with cookies:');
        try {
            const response4 = await axios.get(`${BASE_URL}/users/me`, {
                headers: {
                    'Cookie': `adminToken=${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Cookie format works:', response4.data.user ? `User: ${response4.data.user.email}` : 'No user data');
        } catch (error) {
            console.log('❌ Cookie format failed:', error.response?.status, error.response?.data?.message);
        }

        // Step 3: Test medical records endpoint
        console.log('\n3️⃣ Testing Medical Records endpoint...');
        try {
            const medicalResponse = await axios.get(`${BASE_URL}/medical-records`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Medical Records access successful');
            console.log('   Records count:', medicalResponse.data.records ? medicalResponse.data.records.length : 'No records');
        } catch (error) {
            console.log('❌ Medical Records access failed:', error.response?.status, error.response?.data?.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAuthFix();
