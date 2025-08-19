import mongoose from 'mongoose';
import { User } from '../../models/userScheme.js';
import bcrypt from 'bcrypt';

const sampleUsers = [
    // Patients
    {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@patient.com",
        phone: "1234567890",
        nic: "123456789012",
        dob: new Date("1990-05-15"),
        gender: "Male",
        password: "password123",
        role: "Patient",
        authType: "traditional",
        isVerified: true
    },
    {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@patient.com",
        phone: "1234567891",
        nic: "123456789013",
        dob: new Date("1985-08-22"),
        gender: "Female",
        password: "password123",
        role: "Patient",
        authType: "traditional",
        isVerified: true
    },
    {
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@patient.com",
        phone: "1234567892",
        nic: "123456789014",
        dob: new Date("1992-12-03"),
        gender: "Male",
        password: "password123",
        role: "Patient",
        authType: "traditional",
        isVerified: true
    },
    {
        firstName: "Sarah",
        lastName: "Wilson",
        email: "sarah.wilson@patient.com",
        phone: "1234567893",
        nic: "123456789015",
        dob: new Date("1988-04-18"),
        gender: "Female",
        password: "password123",
        role: "Patient",
        authType: "traditional",
        isVerified: true
    },
    {
        firstName: "Robert",
        lastName: "Brown",
        email: "robert.brown@patient.com",
        phone: "1234567894",
        nic: "123456789016",
        dob: new Date("1995-11-07"),
        gender: "Male",
        password: "password123",
        role: "Patient",
        authType: "traditional",
        isVerified: true
    },

    // Doctors
    {
        firstName: "Dr. Emily",
        lastName: "Chen",
        email: "emily.chen@hospital.com",
        phone: "2234567890",
        nic: "223456789012",
        dob: new Date("1980-03-12"),
        gender: "Female",
        password: "doctor123",
        role: "Doctor",
        authType: "traditional",
        isVerified: true,
        doctorDepartment: "Cardiology",
        specialization: "Interventional Cardiology",
        licenseNumber: "DOC001"
    },
    {
        firstName: "Dr. David",
        lastName: "Rodriguez",
        email: "david.rodriguez@hospital.com",
        phone: "2234567891",
        nic: "223456789013",
        dob: new Date("1975-09-25"),
        gender: "Male",
        password: "doctor123",
        role: "Doctor",
        authType: "traditional",
        isVerified: true,
        doctorDepartment: "Internal Medicine",
        specialization: "General Internal Medicine",
        licenseNumber: "DOC002"
    },
    {
        firstName: "Dr. Maria",
        lastName: "Garcia",
        email: "maria.garcia@hospital.com",
        phone: "2234567892",
        nic: "223456789014",
        dob: new Date("1982-07-14"),
        gender: "Female",
        password: "doctor123",
        role: "Doctor",
        authType: "traditional",
        isVerified: true,
        doctorDepartment: "Pediatrics",
        specialization: "Pediatric Emergency Medicine",
        licenseNumber: "DOC003"
    },
    {
        firstName: "Dr. James",
        lastName: "Anderson",
        email: "james.anderson@hospital.com",
        phone: "2234567893",
        nic: "223456789015",
        dob: new Date("1978-01-30"),
        gender: "Male",
        password: "doctor123",
        role: "Doctor",
        authType: "traditional",
        isVerified: true,
        doctorDepartment: "Orthopedics",
        specialization: "Orthopedic Surgery",
        licenseNumber: "DOC004"
    },

    // Technicians
    {
        firstName: "Alex",
        lastName: "Thompson",
        email: "alex.thompson@hospital.com",
        phone: "3234567890",
        nic: "323456789012",
        dob: new Date("1990-06-20"),
        gender: "Male",
        password: "tech123",
        role: "Technician",
        authType: "traditional",
        isVerified: true
    },
    {
        firstName: "Lisa",
        lastName: "Martinez",
        email: "lisa.martinez@hospital.com",
        phone: "3234567891",
        nic: "323456789013",
        dob: new Date("1987-11-12"),
        gender: "Female",
        password: "tech123",
        role: "Technician",
        authType: "traditional",
        isVerified: true
    },
    {
        firstName: "Chris",
        lastName: "Lee",
        email: "chris.lee@hospital.com",
        phone: "3234567892",
        nic: "323456789014",
        dob: new Date("1992-02-28"),
        gender: "Male",
        password: "tech123",
        role: "Technician",
        authType: "traditional",
        isVerified: true
    },

    // Lab Supervisors
    {
        firstName: "Dr. Linda",
        lastName: "White",
        email: "linda.white@hospital.com",
        phone: "4234567890",
        nic: "423456789012",
        dob: new Date("1975-10-15"),
        gender: "Female",
        password: "supervisor123",
        role: "LabSupervisor",
        authType: "traditional",
        isVerified: true,
        doctorDepartment: "Laboratory Medicine",
        specialization: "Clinical Pathology",
        licenseNumber: "LAB001"
    },

    // Receptionists
    {
        firstName: "Nancy",
        lastName: "Davis",
        email: "nancy.davis@hospital.com",
        phone: "5234567890",
        nic: "523456789012",
        dob: new Date("1985-04-08"),
        gender: "Female",
        password: "reception123",
        role: "Receptionist",
        authType: "traditional",
        isVerified: true
    },
    {
        firstName: "Kevin",
        lastName: "Miller",
        email: "kevin.miller@hospital.com",
        phone: "5234567891",
        nic: "523456789013",
        dob: new Date("1990-09-17"),
        gender: "Male",
        password: "reception123",
        role: "Receptionist",
        authType: "traditional",
        isVerified: true
    },

    // Admin
    {
        firstName: "Admin",
        lastName: "User",
        email: "admin@hospital.com",
        phone: "6234567890",
        nic: "623456789012",
        dob: new Date("1980-01-01"),
        gender: "Male",
        password: "admin123",
        role: "Admin",
        authType: "traditional",
        isVerified: true
    },

    // Billing Staff
    {
        firstName: "Jennifer",
        lastName: "Taylor",
        email: "jennifer.taylor@hospital.com",
        phone: "7234567890",
        nic: "723456789012",
        dob: new Date("1986-12-25"),
        gender: "Female",
        password: "billing123",
        role: "BillingStaff",
        authType: "traditional",
        isVerified: true
    }
];

export const seedUsers = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});

        // Insert new data
        const createdUsers = await User.insertMany(sampleUsers);

        console.log(`✅ Successfully seeded ${createdUsers.length} users`);

        // Return users grouped by role for other seeders
        const users = {
            patients: createdUsers.filter(u => u.role === 'Patient'),
            doctors: createdUsers.filter(u => u.role === 'Doctor'),
            technicians: createdUsers.filter(u => u.role === 'Technician'),
            labSupervisors: createdUsers.filter(u => u.role === 'LabSupervisor'),
            receptionists: createdUsers.filter(u => u.role === 'Receptionist'),
            admins: createdUsers.filter(u => u.role === 'Admin'),
            billingStaff: createdUsers.filter(u => u.role === 'BillingStaff')
        };

        return users;
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        throw error;
    }
};
