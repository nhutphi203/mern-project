// Check patient Trần Nhựt's real medical history for billing
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Models
import { User } from '../models/userScheme.js';
import { Appointment } from '../models/appointmentSchema.js';
import { Encounter } from '../models/encounter.model.js';
import { LabOrder } from '../models/labOrder.model.js';
import { LabResult } from '../models/labResult.model.js';
import { LabTest } from '../models/labTest.model.js'; // ADD: Missing LabTest import
import { Prescription } from '../models/prescriptionSchema.js';

// Load environment variables
config({ path: './config/config.env' });

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB Connected Successfully");
        return true;
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        return false;
    }
}

async function checkPatientHistory() {
    console.log("\n=== PATIENT TRẦN NHỰT MEDICAL HISTORY ===");

    try {
        const patient = await User.findOne({ firstName: 'Trần', lastName: 'Nhựt' });
        if (!patient) {
            console.log("❌ Patient Trần Nhựt not found");
            return;
        }

        console.log(`📋 Patient: ${patient.firstName} ${patient.lastName} - ID: ${patient._id}`);
        console.log(`📧 Email: ${patient.email}`);
        console.log(`📞 Phone: ${patient.phone}`);

        // Check appointments
        const appointments = await Appointment.find({ patientId: patient._id })
            .populate('doctorId', 'firstName lastName')
            .sort({ appointment_date: -1 });

        console.log(`\n🏥 APPOINTMENTS (${appointments.length}):`);
        appointments.forEach((apt, i) => {
            console.log(`${i + 1}. ${apt._id}`);
            console.log(`   Date: ${apt.appointment_date}`);
            console.log(`   Department: ${apt.department}`);
            console.log(`   Doctor: Dr. ${apt.doctorId?.firstName} ${apt.doctorId?.lastName}`);
            console.log(`   Status: ${apt.status}`);
            console.log(`   HasVisited: ${apt.hasVisited}`);
        });

        // Check encounters
        const encounters = await Encounter.find({ patientId: patient._id })
            .populate('appointmentId')
            .sort({ checkInTime: -1 });

        console.log(`\n👥 ENCOUNTERS (${encounters.length}):`);
        encounters.forEach((enc, i) => {
            console.log(`${i + 1}. ${enc._id}`);
            console.log(`   CheckIn: ${enc.checkInTime}`);
            console.log(`   CheckOut: ${enc.checkOutTime || 'N/A'}`);
            console.log(`   Status: ${enc.status}`);
            console.log(`   Appointment: ${enc.appointmentId}`);
        });

        // Check lab orders
        const labOrders = await LabOrder.find({ patientId: patient._id })
            .populate('tests.testId', 'testName testCode price')
            .sort({ orderedAt: -1 });

        console.log(`\n🧪 LAB ORDERS (${labOrders.length}):`);
        labOrders.forEach((order, i) => {
            console.log(`${i + 1}. ${order._id}`);
            console.log(`   OrderId: ${order.orderId}`);
            console.log(`   Ordered: ${order.orderedAt}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Amount: ${order.totalAmount.toLocaleString('vi-VN')} VND`);
            console.log(`   Appointment: ${order.appointmentId || 'N/A'}`);
            console.log(`   Encounter: ${order.encounterId || 'N/A'}`);
            console.log(`   Tests:`);
            order.tests.forEach((test, j) => {
                console.log(`     ${j + 1}. ${test.testId?.testName} (${test.testId?.testCode})`);
                console.log(`        Price: ${test.testId?.price?.toLocaleString('vi-VN')} VND`);
                console.log(`        Status: ${test.status}`);
                console.log(`        Completed: ${test.completedAt || 'Pending'}`);
            });
        });

        // Check lab results
        const labResults = await LabResult.find({ patientId: patient._id })
            .populate('testId', 'testName testCode price')
            .sort({ createdAt: -1 });

        console.log(`\n📊 LAB RESULTS (${labResults.length}):`);
        labResults.forEach((result, i) => {
            console.log(`${i + 1}. ${result._id}`);
            console.log(`   Test: ${result.testId?.testName} (${result.testId?.testCode})`);
            console.log(`   Value: ${result.numericResult || result.textResult || 'N/A'}`);
            console.log(`   Unit: ${result.unit || 'N/A'}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Date: ${result.resultDate || result.createdAt}`);
        });

        // Check prescriptions
        const prescriptions = await Prescription.find({ patientId: patient._id })
            .sort({ createdAt: -1 });

        console.log(`\n💊 PRESCRIPTIONS (${prescriptions.length}):`);
        prescriptions.forEach((presc, i) => {
            console.log(`${i + 1}. ${presc._id}`);
            console.log(`   Created: ${presc.createdAt}`);
            console.log(`   Status: ${presc.status}`);
            console.log(`   Appointment: ${presc.appointmentId || 'N/A'}`);
            console.log(`   Medical Record: ${presc.medicalRecordId || 'N/A'}`);
            console.log(`   Medications (${presc.medications.length}):`);
            presc.medications.forEach((med, j) => {
                console.log(`     ${j + 1}. ${med.name} ${med.dosage}`);
                console.log(`        Frequency: ${med.frequency}`);
                console.log(`        Duration: ${med.duration}`);
                console.log(`        Notes: ${med.notes || 'N/A'}`);
            });
        });

        console.log("\n=== BILLING REQUIREMENTS ===");
        console.log("✅ Ready to create realistic billing invoices for:");
        console.log(`   - ${appointments.length} appointments`);
        console.log(`   - ${encounters.length} encounters`);
        console.log(`   - ${labOrders.length} lab orders`);
        console.log(`   - ${prescriptions.length} prescriptions`);

    } catch (error) {
        console.error("❌ Error checking patient history:", error);
        throw error;
    }
}

async function main() {
    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    try {
        await checkPatientHistory();
    } catch (error) {
        console.error("\n💥 Patient history check failed:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n📪 Database connection closed");
        process.exit(0);
    }
}

// Run the check
main();
