#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/v1';

async function testLabTechLogin() {
    try {
        console.log('🧪 Testing Lab Technician login...');
        
        const response = await axios.post(`${BASE_URL}/users/login`, {
            email: 'lab.test@hospital.com',
            password: 'Lab123456!',
            role: 'Technician'
        });

        if (response.data.success) {
            console.log('✅ Lab Technician login successful!');
            console.log('User:', response.data.user.firstName, response.data.user.lastName);
            console.log('Role:', response.data.user.role);
            console.log('Token:', response.data.token ? 'Present' : 'Missing');
        }
    } catch (error) {
        console.error('❌ Lab Technician login failed:', error.response?.data?.message || error.message);
        console.log('Response data:', error.response?.data);
    }
}

testLabTechLogin();
