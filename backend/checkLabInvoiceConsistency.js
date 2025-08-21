// Check Lab Results vs Invoice consistency
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config', 'config.env') });

// Import models
import { LabOrder } from './models/labOrder.model.js';
import { LabResult } from './models/labResult.model.js';
import { Invoice } from './models/billing/invoice.model.js';
import { Appointment } from './models/appointmentSchema.js';
import { Encounter } from './models/encounter.model.js';

async function checkDataConsistency() {
    try {
        console.log('🔍 CHECKING LAB RESULTS vs INVOICE CONSISTENCY\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Check Lab Orders
        const labOrders = await LabOrder.find()
            .populate('patientId', 'firstName lastName')
            .populate('doctorId', 'firstName lastName')
            .sort({ createdAt: -1 });

        console.log('📊 LAB ORDERS SUMMARY:');
        console.log(`   Total Lab Orders: ${labOrders.length}`);

        const ordersByStatus = {};
        labOrders.forEach(order => {
            ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
        });

        Object.entries(ordersByStatus).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });

        console.log('\n📋 LAB ORDERS DETAILS:');
        labOrders.forEach(order => {
            console.log(`   ${order.orderNumber} - ${order.patientId?.firstName} ${order.patientId?.lastName} - Status: ${order.status}`);
            console.log(`      Tests: ${order.tests.map(t => t.testName).join(', ')}`);
            console.log(`      Created: ${order.createdAt.toLocaleDateString()}`);
        });

        // 2. Check Lab Results
        const labResults = await LabResult.find()
            .populate('labOrderId')
            .populate('patientId', 'firstName lastName')
            .sort({ createdAt: -1 });

        console.log('\n🧪 LAB RESULTS SUMMARY:');
        console.log(`   Total Lab Results: ${labResults.length}`);

        const resultsByStatus = {};
        labResults.forEach(result => {
            resultsByStatus[result.status] = (resultsByStatus[result.status] || 0) + 1;
        });

        Object.entries(resultsByStatus).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });

        console.log('\n🧪 LAB RESULTS DETAILS:');
        labResults.forEach(result => {
            console.log(`   ${result.reportNumber} - ${result.patientId?.firstName} ${result.patientId?.lastName} - Status: ${result.status}`);
            console.log(`      Lab Order: ${result.labOrderId?.orderNumber || 'N/A'}`);
            console.log(`      Tests: ${result.results.length} test results`);
            console.log(`      Created: ${result.createdAt.toLocaleDateString()}`);
        });

        // 3. Check Invoices
        const invoices = await Invoice.find()
            .populate('patientId', 'firstName lastName')
            .populate('encounterId')
            .sort({ createdAt: -1 });

        console.log('\n💰 INVOICES SUMMARY:');
        console.log(`   Total Invoices: ${invoices.length}`);

        const invoicesByStatus = {};
        invoices.forEach(invoice => {
            invoicesByStatus[invoice.status] = (invoicesByStatus[invoice.status] || 0) + 1;
        });

        Object.entries(invoicesByStatus).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });

        console.log('\n💰 INVOICE DETAILS:');
        invoices.forEach(invoice => {
            console.log(`   ${invoice.invoiceNumber} - ${invoice.patientId?.firstName} ${invoice.patientId?.lastName} - Status: ${invoice.status}`);
            console.log(`      Total: ${invoice.totalAmount.toLocaleString()} VND`);
            console.log(`      Items: ${invoice.items.length} items`);

            const labItems = invoice.items.filter(item => item.type === 'lab');
            if (labItems.length > 0) {
                console.log(`      Lab Items: ${labItems.length}`);
                labItems.forEach(item => {
                    console.log(`        - ${item.description} (${item.serviceCode})`);
                });
            }
            console.log(`      Created: ${invoice.createdAt.toLocaleDateString()}`);
        });

        // 4. Check Encounters
        const encounters = await Encounter.find()
            .populate('patientId', 'firstName lastName')
            .populate('appointmentId')
            .sort({ createdAt: -1 });

        console.log('\n🏥 ENCOUNTERS SUMMARY:');
        console.log(`   Total Encounters: ${encounters.length}`);

        const encountersByStatus = {};
        encounters.forEach(encounter => {
            encountersByStatus[encounter.status] = (encountersByStatus[encounter.status] || 0) + 1;
        });

        Object.entries(encountersByStatus).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });

        // 5. Check Data Flow Consistency
        console.log('\n🔄 DATA FLOW ANALYSIS:');

        // Check which lab orders have results
        const ordersWithResults = new Set();
        labResults.forEach(result => {
            if (result.labOrderId) {
                ordersWithResults.add(result.labOrderId._id.toString());
            }
        });

        console.log('\n📊 LAB ORDER → RESULT MAPPING:');
        labOrders.forEach(order => {
            const hasResult = ordersWithResults.has(order._id.toString());
            console.log(`   ${order.orderNumber}: ${hasResult ? '✅ Has Result' : '❌ No Result'}`);
        });

        // Check which encounters have invoices
        const encountersWithInvoices = new Set();
        invoices.forEach(invoice => {
            if (invoice.encounterId) {
                encountersWithInvoices.add(invoice.encounterId._id.toString());
            }
        });

        console.log('\n📊 ENCOUNTER → INVOICE MAPPING:');
        encounters.forEach(encounter => {
            const hasInvoice = encountersWithInvoices.has(encounter._id.toString());
            console.log(`   Encounter ${encounter._id.toString().slice(-6)}: ${hasInvoice ? '✅ Has Invoice' : '❌ No Invoice'}`);
        });

        // 6. Identify Inconsistencies
        console.log('\n⚠️  POTENTIAL INCONSISTENCIES:');

        const completedLabOrders = labOrders.filter(order => order.status === 'Completed').length;
        const completedLabResults = labResults.filter(result => result.status === 'Completed').length;

        if (completedLabOrders !== completedLabResults) {
            console.log(`   ❌ Completed Lab Orders (${completedLabOrders}) ≠ Completed Lab Results (${completedLabResults})`);
        } else {
            console.log(`   ✅ Completed Lab Orders match Lab Results (${completedLabOrders})`);
        }

        const labInvoiceItems = invoices.reduce((total, invoice) => {
            return total + invoice.items.filter(item => item.type === 'lab').length;
        }, 0);

        console.log(`   Lab-related invoice items: ${labInvoiceItems}`);
        console.log(`   Total invoices: ${invoices.length}`);

        if (labResults.length === 0 && invoices.length > 0) {
            console.log(`   ⚠️  Warning: ${invoices.length} invoices but 0 lab results - possible data inconsistency`);
        }

        console.log('\n✅ Data consistency check completed');

    } catch (error) {
        console.error('❌ Error checking data consistency:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkDataConsistency();
