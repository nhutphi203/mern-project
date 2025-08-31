// Simple billing seeder - tạo invoice từ dữ liệu có sẵn
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Models
import { User } from '../models/userScheme.js';
import { Appointment } from '../models/appointmentSchema.js';
import { Encounter } from '../models/encounter.model.js';
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

async function seedSimpleBilling() {
    console.log("\n=== SIMPLE BILLING SEEDING ===");

    try {
        // 1. Get existing data
        const patient = await User.findOne({ role: 'Patient' });
        const doctor = await User.findOne({ role: 'Doctor' });
        const appointment = await Appointment.findOne({ patientId: patient._id });
        const encounter = await Encounter.findOne({ appointmentId: appointment._id });

        if (!patient || !doctor || !appointment || !encounter) {
            console.log("❌ Missing base data. Please run main seeding first.");
            return;
        }

        console.log(`✅ Using Patient: ${patient.firstName} ${patient.lastName}`);
        console.log(`✅ Using Doctor: ${doctor.firstName} ${doctor.lastName}`);

        // 2. Get services
        const consultationService = await ServiceCatalog.findOne({ serviceId: 'CONSULT-001' });
        const labService = await ServiceCatalog.findOne({ serviceId: 'LAB-001' });

        if (!consultationService || !labService) {
            console.log("❌ Missing services in catalog");
            return;
        }

        // 3. Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ patientId: patient._id });
        if (existingInvoice) {
            console.log("✅ Invoice already exists:", existingInvoice.invoiceNumber);
            return;
        }

        // 4. Create simple invoice
        console.log("Creating simple invoice...");

        const items = [
            {
                type: 'Consultation',
                description: consultationService.name,
                serviceCode: consultationService.serviceId,
                quantity: 1,
                unitPrice: consultationService.price,
                totalPrice: consultationService.price,
                netAmount: consultationService.price
            },
            {
                type: 'Laboratory',
                description: labService.name,
                serviceCode: labService.serviceId,
                quantity: 1,
                unitPrice: labService.price,
                totalPrice: labService.price,
                netAmount: labService.price
            }
        ];

        const totalAmount = items.reduce((sum, item) => sum + item.netAmount, 0);

        // Create invoice with all required fields
        const invoiceCount = await Invoice.countDocuments();
        const year = new Date().getFullYear();
        const invoiceNumber = `INV${year}${String(invoiceCount + 1).padStart(6, '0')}`;

        const invoice = new Invoice({
            invoiceNumber: invoiceNumber, // FIX: Set manually since pre-save validation fails
            patientId: patient._id,
            encounterId: encounter._id,
            appointmentId: appointment._id,
            items: items,
            subtotal: totalAmount,
            totalAmount: totalAmount,
            insurance: { // FIX: Add required insurance object
                patientResponsibility: totalAmount // No insurance, patient pays all
            },
            totalPaid: 0,
            balance: totalAmount,
            status: 'Sent',
            createdBy: doctor._id,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        // Save manually to trigger pre-save hook
        await invoice.save();

        console.log("✅ Invoice created successfully:");
        console.log(`  - Invoice Number: ${invoice.invoiceNumber}`);
        console.log(`  - Total Amount: ${totalAmount.toLocaleString('vi-VN')} VND`);
        console.log(`  - Status: ${invoice.status}`);

        // 5. Add a payment
        console.log("Adding payment...");
        invoice.payments.push({
            method: 'Cash',
            amount: consultationService.price, // Partial payment
            processedBy: doctor._id,
            notes: 'Partial payment - consultation fee'
        });

        invoice.totalPaid = consultationService.price;
        await invoice.save(); // Trigger pre-save to update status

        console.log(`✅ Payment added: ${consultationService.price.toLocaleString('vi-VN')} VND`);
        console.log(`✅ Updated Status: ${invoice.status}`);
        console.log(`✅ Remaining Balance: ${invoice.balance.toLocaleString('vi-VN')} VND`);

        console.log("\n=== BILLING SEEDING COMPLETED ===");

    } catch (error) {
        console.error("❌ Error during billing seeding:", error);
        throw error;
    }
}

async function main() {
    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    try {
        await seedSimpleBilling();
        console.log("\n🎉 Simple billing seeding completed successfully!");
    } catch (error) {
        console.error("\n💥 Billing seeding failed:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("📪 Database connection closed");
        process.exit(0);
    }
}

// Run the seeder
main();
