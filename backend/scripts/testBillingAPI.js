// Test billing API endpoints
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Models
import { User } from '../models/userScheme.js';
import { Appointment } from '../models/appointmentSchema.js';
import { Encounter } from '../models/encounter.model.js';
import { Invoice } from '../models/billing/invoice.model.js';

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

async function testBillingAPI() {
    console.log("\n=== BILLING API TEST ===");

    try {
        // 1. Check invoice data
        const invoices = await Invoice.find({})
            .populate('patientId', 'firstName lastName')
            .populate('createdBy', 'firstName lastName')
            .limit(5);

        console.log(`\n📋 Found ${invoices.length} invoices:`);

        for (const invoice of invoices) {
            console.log(`\n🧾 Invoice: ${invoice.invoiceNumber}`);
            console.log(`   Patient: ${invoice.patientId.firstName} ${invoice.patientId.lastName}`);
            console.log(`   Total: $${invoice.totalAmount.toFixed(2)}`);
            console.log(`   Paid: $${invoice.totalPaid.toFixed(2)}`);
            console.log(`   Balance: $${invoice.balance.toFixed(2)}`);
            console.log(`   Status: ${invoice.status}`);
            console.log(`   Items: ${invoice.items.length} services`);

            // Show items details
            invoice.items.forEach((item, index) => {
                console.log(`     ${index + 1}. ${item.description} - $${item.netAmount.toFixed(2)}`);
            });

            // Show payments
            if (invoice.payments.length > 0) {
                console.log(`   Payments: ${invoice.payments.length} transactions`);
                invoice.payments.forEach((payment, index) => {
                    console.log(`     ${index + 1}. ${payment.method} - $${payment.amount.toFixed(2)}`);
                });
            }
        }

        // 2. Summary statistics
        console.log("\n📊 BILLING SUMMARY:");

        const stats = await Invoice.aggregate([
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalBilled: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$totalPaid' },
                    totalOutstanding: { $sum: '$balance' },
                    paidInvoices: {
                        $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] }
                    },
                    partialInvoices: {
                        $sum: { $cond: [{ $eq: ['$status', 'Partial'] }, 1, 0] }
                    },
                    pendingInvoices: {
                        $sum: { $cond: [{ $eq: ['$status', 'Sent'] }, 1, 0] }
                    }
                }
            }
        ]);

        const summary = stats[0] || {};
        console.log(`Total Invoices: ${summary.totalInvoices || 0}`);
        console.log(`Total Billed: $${(summary.totalBilled || 0).toFixed(2)}`);
        console.log(`Total Paid: $${(summary.totalPaid || 0).toFixed(2)}`);
        console.log(`Outstanding: $${(summary.totalOutstanding || 0).toFixed(2)}`);
        console.log(`Status Breakdown:`);
        console.log(`  - Paid: ${summary.paidInvoices || 0}`);
        console.log(`  - Partial: ${summary.partialInvoices || 0}`);
        console.log(`  - Pending: ${summary.pendingInvoices || 0}`);

        // 3. Service breakdown
        const serviceStats = await Invoice.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.type',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$items.netAmount' }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        console.log(`\n🔧 SERVICE BREAKDOWN:`);
        serviceStats.forEach(service => {
            console.log(`${service._id}: ${service.count} items, $${service.totalRevenue.toFixed(2)}`);
        });

        // 4. Demo scenario
        console.log("\n🎭 DEMO SCENARIO READY:");
        const testPatient = await User.findOne({ role: 'Patient' });
        const patientInvoices = await Invoice.find({ patientId: testPatient._id });

        console.log(`Patient: ${testPatient.firstName} ${testPatient.lastName}`);
        console.log(`Invoices: ${patientInvoices.length}`);
        console.log(`Demo URLs:`);
        console.log(`  - All Invoices: http://localhost:8080/billing/invoices`);
        console.log(`  - My Invoices (Patient): http://localhost:8080/billing/my-invoices`);
        console.log(`  - Payments: http://localhost:8080/billing/payments`);
        console.log(`  - Reports: http://localhost:8080/billing/reports`);

        // 5. API test endpoints
        console.log("\n🔌 API ENDPOINTS TO TEST:");
        console.log(`GET  http://localhost:4000/api/v1/billing/invoices - All invoices`);
        console.log(`GET  http://localhost:4000/api/v1/billing/invoices/${invoices[0]?._id} - Invoice detail`);
        console.log(`GET  http://localhost:4000/api/v1/billing/patients/${testPatient._id}/billing-history - Patient history`);
        console.log(`GET  http://localhost:4000/api/v1/billing/reports/billing?reportType=summary - Billing report`);
        console.log(`POST http://localhost:4000/api/v1/billing/invoices/${invoices[0]?._id}/payments - Process payment`);

        console.log("\n✅ BILLING SYSTEM READY FOR TESTING!");

    } catch (error) {
        console.error("❌ Error testing billing API:", error);
        throw error;
    }
}

async function main() {
    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    try {
        await testBillingAPI();
    } catch (error) {
        console.error("\n💥 Billing API test failed:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n📪 Database connection closed");
        process.exit(0);
    }
}

// Run the test
main();
