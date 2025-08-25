#!/usr/bin/env node

/**
 * Test Appointment Authentication
 * Debug appointment endpoints authentication
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const BASE_URL = 'http://localhost:4000/api/v1';

const log = {
    success: (msg) => console.log('✅ ' + msg),
    error: (msg) => console.log('❌ ' + msg),
    info: (msg) => console.log('ℹ️  ' + msg),
    warning: (msg) => console.log('⚠️  ' + msg),
    header: (msg) => console.log('\n🚀 ' + msg)
};

async function testAppointmentAuth() {
    try {
        log.header('TESTING APPOINTMENT AUTHENTICATION');

        // 1. Login admin
        log.info('Step 1: Login admin...');
        const loginResponse = await fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'nhutadmin@gmail.com',
                password: '11111111',
                role: 'Admin'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            log.error(`Login failed: ${loginData.message}`);
            return;
        }

        log.success('Login successful');
        log.info(`Token: ${loginData.token.substring(0, 20)}...`);

        const token = loginData.token;

        // 2. Test appointment endpoints
        log.header('TESTING APPOINTMENT ENDPOINTS');

        const endpoints = [
            { path: '/appointment/getall', method: 'GET' },
            { path: '/appointment/stats', method: 'GET' }
        ];

        for (const endpoint of endpoints) {
            log.info(`Testing ${endpoint.method} ${endpoint.path}`);

            const response = await fetch(`${BASE_URL}${endpoint.path}`, {
                method: endpoint.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.text();

            log.info(`Status: ${response.status}`);
            log.info(`Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);

            if (response.ok) {
                log.success(`✅ ${endpoint.path} works`);
            } else {
                log.error(`❌ ${endpoint.path} failed`);
            }

            console.log('---');
        }

        // 3. Test with different auth header formats
        log.header('TESTING DIFFERENT AUTH HEADER FORMATS');

        const authFormats = [
            { name: 'Bearer token', header: `Bearer ${token}` },
            { name: 'Plain token', header: token },
            { name: 'JWT token', header: `JWT ${token}` }
        ];

        for (const format of authFormats) {
            log.info(`Testing with ${format.name}`);

            const response = await fetch(`${BASE_URL}/appointment/getall`, {
                method: 'GET',
                headers: {
                    'Authorization': format.header,
                    'Content-Type': 'application/json'
                }
            });

            log.info(`Status: ${response.status}`);

            if (response.ok) {
                log.success(`✅ ${format.name} works`);
            } else {
                log.error(`❌ ${format.name} failed`);
            }
        }

    } catch (error) {
        log.error(`Test failed: ${error.message}`);
        console.error(error);
    }
}

// Run test
testAppointmentAuth().catch(error => {
    console.error('Critical error:', error);
    process.exit(1);
});
