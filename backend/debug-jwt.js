#!/usr/bin/env node

/**
 * Quick JWT Token Debug
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:4000/api/v1';

async function debugJWT() {
    try {
        console.log('🧪 Testing JWT Token Structure...\n');

        // Login as admin
        const response = await axios.post(`${BASE_URL}/users/login`, {
            email: 'admin.test@hospital.com',
            password: 'Admin123!',
            role: 'Admin'
        });

        if (response.data.success && response.data.token) {
            const token = response.data.token;
            console.log('✅ Login successful, token received');
            console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

            // Decode token without verification to see payload
            const decoded = jwt.decode(token);
            console.log('\n🔍 Decoded Token Payload:');
            console.log(JSON.stringify(decoded, null, 2));

            // Test API call with this token
            console.log('\n🧪 Testing API call with Authorization header...');
            try {
                const apiResponse = await axios.get(`${BASE_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✅ API call successful!');
                console.log('User data received:', apiResponse.data.user?.email);
            } catch (apiError) {
                console.log('❌ API call failed:');
                console.log('Status:', apiError.response?.status);
                console.log('Message:', apiError.response?.data?.message);
                console.log('Headers sent:', {
                    'Authorization': `Bearer ${token.substring(0, 20)}...`,
                    'Content-Type': 'application/json'
                });
            }
        }

    } catch (error) {
        console.error('❌ Login failed:', error.response?.data?.message || error.message);
    }
}

debugJWT();
