/**
 * 👥 USER SEEDER FOR MEDICAL RECORDS TESTING
 * Tạo test users cho hệ thống Medical Records
 */

import axios from 'axios';
import colors from 'colors';

const BASE_URL = 'http://localhost:4000/api/v1';

const log = {
    success: (msg) => console.log('✅ ' + msg.green),
    error: (msg) => console.log('❌ ' + msg.red),
    info: (msg) => console.log('ℹ️  ' + msg.blue),
    header: (msg) => console.log('\n' + '🚀 ' + msg.cyan.bold)
};

// Test users to create
const TEST_USERS = [
    {
        firstName: "Dr. John",
        lastName: "Smith",
        email: "doctor@test.com",
        phone: "1234567890",
        nic: "1234567890",
        dob: "1980-01-01",
        gender: "Male",
        password: "password123",
        role: "Doctor",
        doctorDepartment: "Cardiology",
        specialization: "Cardiologist",
        licenseNumber: "DOC001"
    },
    {
        firstName: "Jane",
        lastName: "Doe",
        email: "patient@test.com",
        phone: "0987654321",
        nic: "0987654321",
        dob: "1990-05-15",
        gender: "Female",
        password: "password123",
        role: "Patient"
    },
    {
        firstName: "Admin",
        lastName: "User",
        email: "admin@test.com",
        phone: "1111111111",
        nic: "1111111111",
        dob: "1985-12-25",
        gender: "Male",
        password: "password123",
        role: "Admin"
    }
];

async function createTestUsers() {
    log.header('CREATING TEST USERS FOR MEDICAL RECORDS');

    try {
        for (const user of TEST_USERS) {
            try {
                let endpoint;
                let payload = { ...user };

                if (user.role === 'Doctor') {
                    endpoint = '/users/doctor/addnew';
                    // Remove fields not needed for doctor creation
                    delete payload.role;
                } else if (user.role === 'Admin') {
                    endpoint = '/users/admin/addnew';
                    delete payload.role;
                } else {
                    endpoint = '/users/patient/register';
                    delete payload.role;
                    delete payload.doctorDepartment;
                    delete payload.specialization;
                    delete payload.licenseNumber;
                }

                console.log(`Creating ${user.role}: ${user.email}`);

                const response = await axios.post(`${BASE_URL}${endpoint}`, payload);

                if (response.data.success) {
                    log.success(`Created ${user.role}: ${user.email}`);
                } else {
                    log.error(`Failed to create ${user.role}: ${response.data.message}`);
                }
            } catch (error) {
                if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                    log.info(`${user.role} ${user.email} already exists - skipping`);
                } else {
                    log.error(`Error creating ${user.role}: ${error.message}`);
                }
            }
        }

        log.header('TEST USERS SETUP COMPLETE');
        log.info('You can now run medical records tests');

    } catch (error) {
        log.error(`Failed to setup test users: ${error.message}`);
        process.exit(1);
    }
}

// 🚀 Run user seeder
createTestUsers().catch(error => {
    log.error(`Critical error: ${error.message}`);
    process.exit(1);
});

export { createTestUsers, TEST_USERS };
