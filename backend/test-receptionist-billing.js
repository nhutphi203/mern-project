#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

async function testReceptionistBilling() {
    try {
        // Login as Receptionist
        console.log('🔐 Logging in as Receptionist...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
            email: 'receptionist.test@hospital.com',
            password: 'Reception123!',
            role: 'Receptionist'
        });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed');
            return;
        }

        console.log('✅ Receptionist login successful');
        const token = loginResponse.data.token;

        // Test billing/invoices access
        console.log('\n💳 Testing billing/invoices access...');
        try {
            const billingResponse = await axios.get(`${BASE_URL}/billing/invoices`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ SUCCESS: Receptionist can access billing/invoices');
            console.log('Response status:', billingResponse.status);
            console.log('Data count:', billingResponse.data?.invoices?.length || 0);
        } catch (error) {
            console.error('❌ FAILED: Receptionist cannot access billing/invoices');
            console.error('Status:', error.response?.status);
            console.error('Message:', error.response?.data?.message);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testReceptionistBilling();
