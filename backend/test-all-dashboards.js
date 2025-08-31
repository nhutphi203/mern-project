#!/usr/bin/env node

/**
 * Test All Dashboard Pages
 * Kiểm tra tất cả các dashboard hoạt động đúng
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

async function testAllDashboards() {
    try {
        log.header('TESTING ALL DASHBOARD DATA ENDPOINTS');

        // Test Admin Login
        log.info('1. Testing Admin login...');
        const loginResponse = await fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'nhutadmin@gmail.com',
                password: '11111111',
                role: 'Admin'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            log.error(`Admin login failed: ${loginData.message}`);
            return;
        }

        const token = loginData.token;
        log.success('Admin login successful');

        // Test endpoints used by dashboards
        const endpoints = [
            { name: 'Appointments (All Dashboards)', path: '/appointment/getall' },
            { name: 'Appointment Stats', path: '/appointment/stats' },
            { name: 'All Doctors', path: '/users/doctors' },
            { name: 'All Patients', path: '/users/patients' },
        ];

        log.header('TESTING DASHBOARD DATA ENDPOINTS');

        for (const endpoint of endpoints) {
            log.info(`Testing ${endpoint.name}: ${endpoint.path}`);

            const response = await fetch(`${BASE_URL}${endpoint.path}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (endpoint.path === '/appointment/getall') {
                    log.info(`  📊 Found ${data.appointments?.length || 0} appointments`);

                    // Check data structure
                    if (data.appointments && data.appointments.length > 0) {
                        const sample = data.appointments[0];
                        const hasDoctor = sample.doctor || sample.doctorId;
                        const hasPatient = sample.patientId;

                        log.info(`  🔍 Sample appointment structure:`);
                        log.info(`    - Has doctor data: ${hasDoctor ? '✅' : '❌'}`);
                        log.info(`    - Has patient data: ${hasPatient ? '✅' : '❌'}`);
                        log.info(`    - Doctor field: ${sample.doctor ? 'doctor' : sample.doctorId ? 'doctorId' : 'missing'}`);

                        if (sample.doctor && !sample.doctor.firstName) {
                            log.warning(`    - Doctor missing firstName field`);
                        }
                        if (sample.patientId && !sample.patientId.firstName) {
                            log.warning(`    - Patient missing firstName field`);
                        }
                    }
                } else if (endpoint.path === '/appointment/stats') {
                    log.info(`  📈 Stats: ${JSON.stringify(data.stats, null, 2).substring(0, 100)}...`);
                } else if (endpoint.path === '/users/doctors') {
                    log.info(`  👨‍⚕️ Found ${data.doctors?.length || 0} doctors`);
                } else if (endpoint.path === '/users/patients') {
                    log.info(`  🏥 Found ${data.patients?.length || 0} patients`);
                }

                log.success(`✅ ${endpoint.name} works`);
            } else {
                const errorData = await response.text();
                log.error(`❌ ${endpoint.name} failed: ${response.status} - ${errorData.substring(0, 100)}`);
            }

            console.log('---');
        }

        log.header('🎯 DASHBOARD READINESS SUMMARY');
        log.info('All major dashboard endpoints tested');
        log.info('Frontend should now work properly with null checks');
        log.success('Dashboard testing completed!');

    } catch (error) {
        log.error(`Test failed: ${error.message}`);
        console.error(error);
    }
}

// Run test
testAllDashboards().catch(error => {
    console.error('Critical error:', error);
    process.exit(1);
});
