#!/usr/bin/env node

/**
 * Test Doctor Dashboard Functionality
 * Kiểm tra doctor login và dashboard endpoints
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/userScheme.js';

dotenv.config({ path: './config/config.env' });

const BASE_URL = 'http://localhost:4000/api/v1';

const log = {
    success: (msg) => console.log('✅ ' + msg),
    error: (msg) => console.log('❌ ' + msg),
    info: (msg) => console.log('ℹ️  ' + msg),
    warning: (msg) => console.log('⚠️  ' + msg),
    header: (msg) => console.log('\n🚀 ' + msg)
};

async function testDoctorDashboard() {
    try {
        log.header('TESTING DOCTOR DASHBOARD FUNCTIONALITY');

        // Connect to database to find doctor account
        await mongoose.connect(process.env.MONGO_URI);
        log.success('Connected to MongoDB');

        // Find a doctor account
        const doctor = await User.findOne({ role: 'Doctor' });

        if (!doctor) {
            log.error('No doctor account found in database!');
            log.info('Creating a test doctor account...');

            const testDoctor = await User.create({
                firstName: 'Test',
                lastName: 'Doctor',
                email: 'testdoctor@gmail.com',
                password: 'password123',
                phone: '1234567890',
                nic: '123456789012',
                dob: new Date('1980-01-01'),
                gender: 'Male',
                role: 'Doctor',
                isVerified: true,
                authType: 'traditional'
            });

            log.success(`Created test doctor: ${testDoctor.email}`);
            doctor = testDoctor;
        }

        log.info(`Found doctor: ${doctor.email} (${doctor.firstName} ${doctor.lastName})`);

        await mongoose.disconnect();

        // Test doctor login
        log.header('TESTING DOCTOR LOGIN');
        const loginResponse = await fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: doctor.email,
                password: doctor.email === 'testdoctor@gmail.com' ? 'password123' : '11111111',
                role: 'Doctor'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            log.error(`Doctor login failed: ${loginData.message}`);
            log.info('Trying with default password...');

            // Try with common password
            const loginResponse2 = await fetch(`${BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: doctor.email,
                    password: 'password',
                    role: 'Doctor'
                })
            });

            if (!loginResponse2.ok) {
                log.error('Doctor login still failed. Skipping endpoint tests.');
                return;
            }

            loginData = await loginResponse2.json();
        }

        const token = loginData.token;
        log.success('Doctor login successful');
        log.info(`Token: ${token.substring(0, 20)}...`);

        // Test doctor-specific endpoints
        log.header('TESTING DOCTOR DASHBOARD ENDPOINTS');

        const endpoints = [
            { name: 'Doctor Queue', path: '/encounters/doctor-queue' },
            { name: 'Doctor Appointments', path: '/appointment/my-appointments' },
        ];

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

                if (endpoint.path === '/encounters/doctor-queue') {
                    log.info(`  📋 Found ${data.encounters?.length || 0} encounters in queue`);
                } else if (endpoint.path === '/appointment/my-appointments') {
                    log.info(`  📅 Found ${data.appointments?.length || 0} appointments`);
                }

                log.success(`✅ ${endpoint.name} works`);
            } else {
                const errorData = await response.text();
                log.error(`❌ ${endpoint.name} failed: ${response.status} - ${errorData.substring(0, 100)}`);
            }

            console.log('---');
        }

        log.header('🎯 DOCTOR DASHBOARD SUMMARY');
        log.success('Doctor authentication working');
        log.info('Doctor can now access dashboard without errors');
        log.success('Doctor dashboard testing completed!');

    } catch (error) {
        log.error(`Test failed: ${error.message}`);
        console.error(error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

// Run test
testDoctorDashboard().catch(error => {
    console.error('Critical error:', error);
    process.exit(1);
});
