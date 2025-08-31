#!/usr/bin/env node

/**
 * Simple Encounter Test
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

async function testQuick() {
    try {
        // Login doctor first
        const loginResponse = await fetch('http://localhost:4000/api/v1/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'dr.ha@mediflow.dev',
                password: '11111111',
                role: 'Doctor'
            })
        });

        const loginData = await loginResponse.json();
        console.log('Login status:', loginResponse.status);
        console.log('Login success:', loginData.success);

        if (!loginData.success) {
            console.log('Login failed:', loginData.message);
            return;
        }

        // Test encounter endpoint
        const encounterResponse = await fetch('http://localhost:4000/api/v1/encounters/doctor-queue', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Encounter status:', encounterResponse.status);
        const encounterData = await encounterResponse.text();
        console.log('Encounter response:', encounterData.substring(0, 200));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testQuick();
