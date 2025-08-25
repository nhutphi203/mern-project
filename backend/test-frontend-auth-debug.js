#!/usr/bin/env node

/**
 * Debug Frontend Authentication Issues
 * Test login flow và appointment endpoints
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000';

const log = {
    success: (msg) => console.log('✅ ' + msg),
    error: (msg) => console.log('❌ ' + msg),
    info: (msg) => console.log('ℹ️  ' + msg),
    warning: (msg) => console.log('⚠️  ' + msg),
    header: (msg) => console.log('\n🚀 ' + msg)
};

async function debugFrontendAuth() {
    try {
        log.header('FRONTEND AUTHENTICATION DEBUG');

        // Test 1: Login với admin credentials
        log.info('Testing login with admin credentials...');
        const loginResponse = await fetch(`${API_BASE}/api/v1/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'nhutadmin@gmail.com',
                password: '11111111'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            log.error(`Login failed: ${loginData.message}`);
            return;
        }

        log.success('Login successful!');
        log.info(`User: ${loginData.user.firstName} ${loginData.user.lastName}`);
        log.info(`Role: ${loginData.user.role}`);
        log.info(`Token: ${loginData.token.substring(0, 20)}...`);

        const token = loginData.token;

        // Test 2: Test appointment endpoints với token
        log.header('TESTING APPOINTMENT ENDPOINTS');

        // Test getall endpoint
        log.info('Testing GET /api/v1/appointment/getall...');
        const getAllResponse = await fetch(`${API_BASE}/api/v1/appointment/getall`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (getAllResponse.ok) {
            const getAllData = await getAllResponse.json();
            log.success(`GET getall success: ${getAllData.appointments?.length || 0} appointments`);
        } else {
            const errorData = await getAllResponse.json();
            log.error(`GET getall failed (${getAllResponse.status}): ${errorData.message}`);
        }

        // Test stats endpoint
        log.info('Testing GET /api/v1/appointment/stats...');
        const statsResponse = await fetch(`${API_BASE}/api/v1/appointment/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            log.success('GET stats success');
            log.info(`Stats: ${JSON.stringify(statsData.stats || statsData.data, null, 2)}`);
        } else {
            const errorData = await statsResponse.json();
            log.error(`GET stats failed (${statsResponse.status}): ${errorData.message}`);
        }

        // Test 3: Verify user details
        log.header('TESTING USER VERIFICATION');

        log.info('Testing GET /api/v1/users/me...');
        const meResponse = await fetch(`${API_BASE}/api/v1/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (meResponse.ok) {
            const meData = await meResponse.json();
            log.success('User verification successful!');
            log.info(`Verified user: ${meData.user.firstName} ${meData.user.lastName} (${meData.user.role})`);
        } else {
            const errorData = await meResponse.json();
            log.error(`User verification failed (${meResponse.status}): ${errorData.message}`);
        }

        // Test 4: Check appointment router middleware
        log.header('CHECKING APPOINTMENT ROUTER MIDDLEWARE');

        // Test without auth header
        log.info('Testing appointment endpoint without auth...');
        const noAuthResponse = await fetch(`${API_BASE}/api/v1/appointment/getall`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (noAuthResponse.status === 401) {
            log.success('No auth = 401 (correct behavior)');
        } else {
            log.warning(`No auth = ${noAuthResponse.status} (unexpected)`);
        }

        log.header('🎯 DEBUG SUMMARY');
        log.info('Check the results above to identify authentication issues');

    } catch (error) {
        log.error(`Debug failed: ${error.message}`);
    }
}

// Run debug
debugFrontendAuth().catch(error => {
    console.error('Critical error:', error);
    process.exit(1);
});
