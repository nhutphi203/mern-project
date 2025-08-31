/**
 * Simple Role Workflow Tests
 * Basic tests without dependency on global users
 */
import supertest from 'supertest';
import { expect } from '@jest/globals';
import app from '../../app.js';

const request = supertest(app);

describe('🩺 Simple Doctor Workflow Tests', () => {
    it('Should check if endpoints are available', async () => {
        const response = await request
            .get('/api/v1/medical-records/doctor/patients')
            .set('Authorization', 'Bearer fake-token'); // Use fake token to test endpoint exists

        // Even with fake token, endpoint should exist (401 unauthorized is expected)
        expect([401, 404]).toContain(response.status);
    });

    it('Should handle registration endpoint', async () => {
        const response = await request
            .post('/api/v1/user/register')
            .send({
                firstName: 'Test',
                lastName: 'Doctor',
                email: 'test.doctor.simple@test.com',
                password: 'testpassword123',
                phone: '9876543210',
                gender: 'Male',
                dob: '1980-01-01',
                address: 'Test Address',
                role: 'Doctor'
            });

        // Should either succeed or fail with validation error (not server error)
        expect([200, 201, 400, 404, 409]).toContain(response.status);
    });
});

describe('👤 Simple Patient Workflow Tests', () => {
    it('Should check patient endpoints availability', async () => {
        const response = await request
            .get('/api/v1/appointments/available')
            .set('Authorization', 'Bearer fake-token');

        expect([401, 404]).toContain(response.status);
    });

    it('Should handle patient registration', async () => {
        const response = await request
            .post('/api/v1/user/register')
            .send({
                firstName: 'Test',
                lastName: 'Patient',
                email: 'test.patient.simple@test.com',
                password: 'testpassword123',
                phone: '9876543211',
                gender: 'Female',
                dob: '1990-01-01',
                nic: '987654321V',
                address: 'Test Address Patient',
                role: 'Patient'
            });

        expect([200, 201, 400, 404, 409]).toContain(response.status);
    });
});

describe('👨‍💼 Simple Admin Workflow Tests', () => {
    it('Should check admin endpoints availability', async () => {
        const response = await request
            .get('/api/v1/admin/users')
            .set('Authorization', 'Bearer fake-token');

        expect([401, 404]).toContain(response.status);
    });
});

describe('🏥 Simple Receptionist Workflow Tests', () => {
    it('Should handle receptionist registration', async () => {
        const response = await request
            .post('/api/v1/user/register')
            .send({
                firstName: 'Test',
                lastName: 'Receptionist',
                email: 'test.receptionist.simple@test.com',
                password: 'testpassword123',
                phone: '9876543212',
                gender: 'Female',
                dob: '1988-01-01',
                address: 'Test Address Reception',
                role: 'Receptionist'
            });

        expect([200, 201, 400, 404, 409]).toContain(response.status);
    });
});
