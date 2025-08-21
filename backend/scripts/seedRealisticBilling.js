// Realistic billing seeder - tạo billing từ medical history thực tế của patient "Trần Nhựt"
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Models
import { User } from '../models/userScheme.js';
import { Appointment } from '../models/appointmentSchema.js';
import { Encounter } from '../models/encounter.model.js';
import { LabOrder } from '../models/labOrder.model.js';
import { LabTest } from '../models/labTest.model.js';
import { Prescription } from '../models/prescriptionSchema.js';
import { ServiceCatalog } from '../models/serviceCatalog.model.js';
import { Invoice } from '../models/billing/invoice.model.js';
import { InsuranceProvider } from '../models/billing/insuranceProvider.model.js';
import { PatientInsurance } from '../models/billing/patientInsurance.model.js';

// Load environment variables
config({ path: './config/config.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ FATAL ERROR: MONGO_URI is not defined in .env file");
    process.exit(1);
}

async function connectDB() {
    try {
        console.log("🔄 Attempting to connect to local MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB Connected Successfully:", mongoose.connection.host);
        return true;
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        return false;
    }
}

// Helper function: generate invoice number
function generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6 chữ số
    return `INV${year}${randomNum}`;
}

// Helper function: calculate item pricing từ ServiceCatalog
async function getServicePrice(serviceName, labTestName = null) {
    try {
        let service;

        if (labTestName) {
            // Tìm lab test trong ServiceCatalog
            service = await ServiceCatalog.findOne({
                serviceType: 'Laboratory',
                $or: [
                    { serviceName: { $regex: labTestName, $options: 'i' } },
                    { serviceName: { $regex: serviceName, $options: 'i' } }
                ]
            });
        } else {
            // Tìm service thông thường
            service = await ServiceCatalog.findOne({
                $or: [
                    { serviceName: { $regex: serviceName, $options: 'i' } },
                    { description: { $regex: serviceName, $options: 'i' } }
                ]
            });
        }

        if (service) {
            return {
                serviceId: service._id,
                serviceName: service.serviceName,
                price: service.price,
                serviceType: service.serviceType
            };
        }

        // Default prices nếu không tìm thấy trong ServiceCatalog
        const defaultPrices = {
            'consultation': 200000, // 200k VND
            'general medicine': 150000,
            'neurology': 300000,
            'prescription': 50000,
            'CBC': 25000,
            'ESR': 15000,
            'paracetamol': 20000,
            'amoxicillin': 30000
        };

        const price = defaultPrices[serviceName.toLowerCase()] || 100000;
        return {
            serviceId: null,
            serviceName: serviceName,
            price: price,
            serviceType: 'Other'
        };
    } catch (error) {
        console.error(`❌ Error getting service price for ${serviceName}:`, error);
        return {
            serviceId: null,
            serviceName: serviceName,
            price: 100000,
            serviceType: 'Other'
        };
    }
}

// Create insurance provider và patient insurance
async function createInsuranceData(patient) {
    try {
        console.log("\n📋 Creating insurance data...");

        // Tạo insurance provider (Vietnam Social Insurance)
        let insuranceProvider = await InsuranceProvider.findOne({ providerName: 'Vietnam Social Insurance' });

        if (!insuranceProvider) {
            insuranceProvider = new InsuranceProvider({
                providerName: 'Vietnam Social Insurance',
                providerCode: 'VSI',
                contactInfo: {
                    phone: '1900-1234',
                    email: 'support@vsi.gov.vn',
                    address: {
                        street: '123 Bảo hiểm xã hội',
                        city: 'Hanoi',
                        state: 'Hanoi',
                        zipCode: '100000'
                    }
                },
                contractDetails: {
                    contractNumber: 'VSI-2025-001',
                    effectiveDate: new Date('2025-01-01'),
                    expirationDate: new Date('2025-12-31'),
                    reimbursementRate: 80 // Bảo hiểm xã hội cover 80%
                },
                isActive: true
            });
            await insuranceProvider.save();
            console.log("✅ Created insurance provider: Vietnam Social Insurance");
        } else {
            console.log("✅ Insurance provider already exists: Vietnam Social Insurance");
        }

        // Tạo patient insurance
        let patientInsurance = await PatientInsurance.findOne({
            patientId: patient._id,
            insuranceProviderId: insuranceProvider._id
        });

        if (!patientInsurance) {
            patientInsurance = new PatientInsurance({
                patientId: patient._id,
                insuranceProviderId: insuranceProvider._id,
                policyNumber: `VSI${patient._id.toString().slice(-8).toUpperCase()}`,
                subscriberName: `${patient.firstName} ${patient.lastName}`,
                relationship: 'Self',
                effectiveDate: new Date('2025-01-01'),
                expirationDate: new Date('2025-12-31'),
                isPrimary: true,
                isActive: true
            });
            await patientInsurance.save();
            console.log(`✅ Created patient insurance for ${patient.firstName} ${patient.lastName}`);
        } else {
            console.log(`✅ Patient insurance already exists for ${patient.firstName} ${patient.lastName}`);
        }

        return { insuranceProvider, patientInsurance };
    } catch (error) {
        console.error("❌ Error creating insurance data:", error);
        return null;
    }
}

// Create detailed invoice cho completed encounter
async function createCompletedEncounterInvoice(patient, appointment, encounter, labOrders, prescriptions, insuranceData) {
    try {
        console.log("\n💰 Creating comprehensive invoice for completed encounter...");

        const items = [];
        let totalAmount = 0;

        // 1. CONSULTATION FEE
        const consultationService = await getServicePrice('General Medicine Consultation');
        const consultationItem = {
            type: 'Consultation',
            description: `Consultation - ${appointment.department}`,
            serviceCode: consultationService.serviceId ? consultationService.serviceId.toString().slice(-6) : 'CONS01',
            quantity: 1,
            unitPrice: consultationService.price,
            totalPrice: consultationService.price,
            discountPercent: 0,
            discountAmount: 0,
            taxPercent: 0,
            taxAmount: 0,
            netAmount: consultationService.price
        };
        items.push(consultationItem);
        totalAmount += consultationService.price;

        // 2. LAB TESTS từ all lab orders
        const labTestsMap = new Map(); // Để avoid duplicate lab tests

        for (const labOrder of labOrders) {
            // Populate lab tests để get details
            await labOrder.populate('tests.testId');

            for (const testItem of labOrder.tests) {
                if (testItem.testId && testItem.testId.testName) {
                    const testName = testItem.testId.testName;

                    if (!labTestsMap.has(testName)) {
                        const labService = await getServicePrice('Laboratory Test', testName);

                        const labItem = {
                            type: 'Laboratory',
                            description: `Lab Test - ${testName}`,
                            serviceCode: labService.serviceId ? labService.serviceId.toString().slice(-6) : 'LAB01',
                            quantity: 1,
                            unitPrice: labService.price,
                            totalPrice: labService.price,
                            discountPercent: 0,
                            discountAmount: 0,
                            taxPercent: 0,
                            taxAmount: 0,
                            netAmount: labService.price
                        };

                        items.push(labItem);
                        totalAmount += labService.price;
                        labTestsMap.set(testName, true);

                        console.log(`   📊 Added lab test: ${testName} - ${labService.price} VND`);
                    }
                }
            }
        }

        // 3. MEDICATIONS từ prescriptions
        const medicationsMap = new Map(); // Để avoid duplicates

        for (const prescription of prescriptions) {
            for (const medication of prescription.medications) {
                const medName = medication.name || 'Unknown Medication';

                if (!medicationsMap.has(medName)) {
                    const medService = await getServicePrice(medName);

                    const medItem = {
                        type: 'Pharmacy',
                        description: `Medication - ${medName} ${medication.dosage || ''}`,
                        serviceCode: medService.serviceId ? medService.serviceId.toString().slice(-6) : 'MED01',
                        quantity: medication.quantity || 1,
                        unitPrice: medService.price,
                        totalPrice: medService.price * (medication.quantity || 1),
                        discountPercent: 0,
                        discountAmount: 0,
                        taxPercent: 0,
                        taxAmount: 0,
                        netAmount: medService.price * (medication.quantity || 1)
                    };

                    items.push(medItem);
                    totalAmount += medItem.totalPrice;
                    medicationsMap.set(medName, true);

                    console.log(`   💊 Added medication: ${medName} - ${medItem.totalPrice} VND`);
                }
            }
        }

        // INSURANCE CALCULATION
        const insuranceCoverage = insuranceData.insuranceProvider.contractDetails.reimbursementRate;
        const insuranceAmount = Math.round(totalAmount * (insuranceCoverage / 100));
        const patientResponsibility = totalAmount - insuranceAmount;

        // CREATE INVOICE
        const invoice = new Invoice({
            invoiceNumber: generateInvoiceNumber(),
            patientId: patient._id,
            appointmentId: appointment._id,
            encounterId: encounter._id,
            items: items,
            subtotal: totalAmount,
            totalDiscount: 0,
            totalTax: 0,
            totalAmount: totalAmount,
            insurance: {
                provider: insuranceData.insuranceProvider.providerName,
                policyNumber: insuranceData.patientInsurance.policyNumber,
                coveragePercent: insuranceCoverage,
                coverageAmount: insuranceAmount,
                patientResponsibility: patientResponsibility,
                claimSubmitted: false,
                claimStatus: 'Pending'
            },
            totalPaid: 0,
            balance: totalAmount,
            status: 'Sent', // Valid status từ enum
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            createdBy: appointment.doctorId // Use doctorId from appointment instead of encounter
        });

        await invoice.save();

        console.log(`✅ CREATED COMPREHENSIVE INVOICE:`);
        console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
        console.log(`   Patient: ${patient.firstName} ${patient.lastName}`);
        console.log(`   Total Amount: ${totalAmount.toLocaleString()} VND`);
        console.log(`   Insurance Coverage (${insuranceCoverage}%): ${insuranceAmount.toLocaleString()} VND`);
        console.log(`   Patient Responsibility: ${patientResponsibility.toLocaleString()} VND`);
        console.log(`   Items: ${items.length} services`);

        return invoice;
    } catch (error) {
        console.error("❌ Error creating completed encounter invoice:", error);
        return null;
    }
}

// Create basic invoice cho in-progress encounter
async function createInProgressEncounterInvoice(patient, appointment, encounter, insuranceData) {
    try {
        console.log("\n💰 Creating basic invoice for in-progress encounter...");

        const items = [];

        // Consultation fee only
        const consultationService = await getServicePrice('Neurology Consultation');
        const consultationItem = {
            type: 'Consultation',
            description: `Consultation - ${appointment.department}`,
            serviceCode: consultationService.serviceId ? consultationService.serviceId.toString().slice(-6) : 'CONS02',
            quantity: 1,
            unitPrice: consultationService.price,
            totalPrice: consultationService.price,
            discountPercent: 0,
            discountAmount: 0,
            taxPercent: 0,
            taxAmount: 0,
            netAmount: consultationService.price
        };
        items.push(consultationItem);

        const totalAmount = consultationService.price;
        const insuranceCoverage = insuranceData.insuranceProvider.contractDetails.reimbursementRate;
        const insuranceAmount = Math.round(totalAmount * (insuranceCoverage / 100));
        const patientResponsibility = totalAmount - insuranceAmount;

        const invoice = new Invoice({
            invoiceNumber: generateInvoiceNumber(),
            patientId: patient._id,
            appointmentId: appointment._id,
            encounterId: encounter._id,
            items: items,
            subtotal: totalAmount,
            totalDiscount: 0,
            totalTax: 0,
            totalAmount: totalAmount,
            insurance: {
                provider: insuranceData.insuranceProvider.providerName,
                policyNumber: insuranceData.patientInsurance.policyNumber,
                coveragePercent: insuranceCoverage,
                coverageAmount: insuranceAmount,
                patientResponsibility: patientResponsibility,
                claimSubmitted: false,
                claimStatus: 'Pending'
            },
            totalPaid: 0,
            balance: totalAmount,
            status: 'Draft', // Draft vì encounter chưa hoàn thành
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdBy: appointment.doctorId // Use doctorId from appointment
        });

        await invoice.save();

        console.log(`✅ CREATED IN-PROGRESS INVOICE:`);
        console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
        console.log(`   Status: ${invoice.status} (encounter still in progress)`);
        console.log(`   Total Amount: ${totalAmount.toLocaleString()} VND`);
        console.log(`   Patient Responsibility: ${patientResponsibility.toLocaleString()} VND`);

        return invoice;
    } catch (error) {
        console.error("❌ Error creating in-progress encounter invoice:", error);
        return null;
    }
}

// Main seeding function
async function seedRealisticBilling() {
    try {
        console.log("🚀 STARTING REALISTIC BILLING SEEDING FOR PATIENT TRẦN NHỰT");
        console.log("=".repeat(60));

        // Find patient "Trần Nhựt"
        const patient = await User.findOne({
            firstName: 'Trần',
            lastName: 'Nhựt',
            role: 'Patient'
        });

        if (!patient) {
            console.error("❌ Patient 'Trần Nhựt' not found!");
            return;
        }

        console.log(`✅ Found patient: ${patient.firstName} ${patient.lastName} (${patient.email})`);

        // Get patient's appointments với populate
        const appointments = await Appointment.find({ patientId: patient._id })
            .populate('doctorId', 'firstName lastName')
            .sort({ appointmentDate: -1 });

        console.log(`📅 Found ${appointments.length} appointments for patient`);

        // Get patient's encounters  
        const encounters = await Encounter.find({ patientId: patient._id })
            .sort({ checkInTime: -1 });

        console.log(`🏥 Found ${encounters.length} encounters for patient`);

        // Get patient's lab orders
        const labOrders = await LabOrder.find({ patientId: patient._id })
            .populate('tests.testId')
            .sort({ orderDate: -1 });

        console.log(`🧪 Found ${labOrders.length} lab orders for patient`);

        // Get patient's prescriptions
        const prescriptions = await Prescription.find({ patientId: patient._id })
            .sort({ prescriptionDate: -1 });

        console.log(`💊 Found ${prescriptions.length} prescriptions for patient`);

        // Create insurance data
        const insuranceData = await createInsuranceData(patient);
        if (!insuranceData) {
            console.error("❌ Failed to create insurance data");
            return;
        }

        const invoices = [];

        // Process each encounter
        for (const encounter of encounters) {
            const appointment = appointments.find(apt => apt._id.toString() === encounter.appointmentId.toString());

            if (!appointment) {
                console.log(`⚠️  No appointment found for encounter ${encounter._id}`);
                continue;
            }

            console.log(`\n🔄 Processing encounter: ${encounter.status} - ${appointment.department}`);

            if (encounter.status === 'Finished') {
                // Get lab orders và prescriptions for this encounter
                const encounterLabOrders = labOrders.filter(lo =>
                    lo.encounterId && lo.encounterId.toString() === encounter._id.toString()
                );
                const encounterPrescriptions = prescriptions.filter(p =>
                    p.encounterId && p.encounterId.toString() === encounter._id.toString()
                );

                console.log(`   📊 Lab orders for this encounter: ${encounterLabOrders.length}`);
                console.log(`   💊 Prescriptions for this encounter: ${encounterPrescriptions.length}`);

                const invoice = await createCompletedEncounterInvoice(
                    patient, appointment, encounter, encounterLabOrders, encounterPrescriptions, insuranceData
                );
                if (invoice) invoices.push(invoice);

            } else if (encounter.status === 'InProgress') {
                const invoice = await createInProgressEncounterInvoice(
                    patient, appointment, encounter, insuranceData
                );
                if (invoice) invoices.push(invoice);
            }
        }

        console.log("\n" + "=".repeat(60));
        console.log(`🎉 REALISTIC BILLING SEEDING COMPLETED!`);
        console.log(`📋 Total invoices created: ${invoices.length}`);
        console.log(`👤 Patient: ${patient.firstName} ${patient.lastName}`);
        console.log(`🏥 Based on real medical history: ${appointments.length} appointments, ${encounters.length} encounters`);
        console.log(`💰 Billing reflects actual services: consultations + lab tests + medications`);
        console.log("=".repeat(60));

        return invoices;

    } catch (error) {
        console.error("❌ Error in realistic billing seeding:", error);
    }
}

// Run the seeding
async function main() {
    console.log("🔧 Main function started");

    const connected = await connectDB();
    if (!connected) {
        console.error("❌ Failed to connect to database");
        process.exit(1);
    }

    try {
        console.log("📋 Starting realistic billing seeding...");
        await seedRealisticBilling();
        console.log("\n✅ Realistic billing seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        process.exit(0);
    }
}

// Execute if this file is run directly - simplified check
const isMainModule = process.argv[1] && process.argv[1].includes('seedRealisticBilling.js');

if (isMainModule) {
    console.log("🚀 Script started directly - calling main()");
    main();
} else {
    console.log("📦 Script imported as module");
}

export { seedRealisticBilling };
