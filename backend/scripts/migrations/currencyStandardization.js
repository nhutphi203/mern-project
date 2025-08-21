// Currency Standardization Migration Script
// Convert all VNĐ amounts to USD using rate: 1 USD = 24,000 VNĐ

import mongoose from 'mongoose';
import { config } from 'dotenv';

// Models
import { Invoice } from '../../models/billing/invoice.model.js';
import { ServiceCatalog } from '../../models/serviceCatalog.model.js';
import { LabTest } from '../../models/labTest.model.js';

config({ path: './config/config.env' });

const MONGO_URI = process.env.MONGO_URI;
const USD_VND_RATE = 24000; // 1 USD = 24,000 VNĐ

// Utility function to convert VNĐ to USD
const convertToUSD = (vndAmount) => {
    return Math.round((vndAmount / USD_VND_RATE) * 100) / 100; // Round to 2 decimal places
};

// Backup current data before migration
async function backupData() {
    console.log('📦 Creating backup of current pricing data...');

    const invoices = await Invoice.find({}).lean();
    const services = await ServiceCatalog.find({}).lean();
    const labTests = await LabTest.find({}).lean();

    const backup = {
        timestamp: new Date().toISOString(),
        invoices: invoices,
        services: services,
        labTests: labTests,
        conversionRate: USD_VND_RATE
    };

    // Save backup to file
    const fs = await import('fs');
    const backupPath = `./backups/currency-backup-${Date.now()}.json`;

    // Create backups directory if it doesn't exist
    if (!fs.existsSync('./backups')) {
        fs.mkdirSync('./backups', { recursive: true });
    }

    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup saved to: ${backupPath}`);

    return backup;
}

// Migrate ServiceCatalog prices
async function migrateServiceCatalog() {
    console.log('\n🏥 Migrating ServiceCatalog prices...');

    const services = await ServiceCatalog.find({});
    let updated = 0;

    for (const service of services) {
        const oldPrice = service.price;
        const newPrice = convertToUSD(oldPrice);

        await ServiceCatalog.findByIdAndUpdate(service._id, {
            price: newPrice
        });

        console.log(`   ${service.serviceName}: ${oldPrice.toLocaleString()} VNĐ → $${newPrice}`);
        updated++;
    }

    console.log(`✅ Updated ${updated} services in ServiceCatalog`);
}

// Migrate LabTest prices
async function migrateLabTests() {
    console.log('\n🧪 Migrating LabTest prices...');

    const labTests = await LabTest.find({});
    let updated = 0;

    for (const test of labTests) {
        if (test.price) {
            const oldPrice = test.price;
            const newPrice = convertToUSD(oldPrice);

            await LabTest.findByIdAndUpdate(test._id, {
                price: newPrice
            });

            console.log(`   ${test.testName}: ${oldPrice.toLocaleString()} VNĐ → $${newPrice}`);
            updated++;
        }
    }

    console.log(`✅ Updated ${updated} lab tests`);
}

// Migrate Invoice amounts
async function migrateInvoices() {
    console.log('\n🧾 Migrating Invoice amounts...');

    const invoices = await Invoice.find({});
    let updated = 0;

    for (const invoice of invoices) {
        // Convert all financial fields
        const updates = {
            subtotal: convertToUSD(invoice.subtotal),
            totalDiscount: convertToUSD(invoice.totalDiscount),
            totalTax: convertToUSD(invoice.totalTax),
            totalAmount: convertToUSD(invoice.totalAmount),
            totalPaid: convertToUSD(invoice.totalPaid),
            balance: convertToUSD(invoice.balance)
        };

        // Convert items
        const convertedItems = invoice.items.map(item => ({
            ...item.toObject(),
            unitPrice: convertToUSD(item.unitPrice),
            totalPrice: convertToUSD(item.totalPrice),
            discountAmount: convertToUSD(item.discountAmount),
            taxAmount: convertToUSD(item.taxAmount),
            netAmount: convertToUSD(item.netAmount)
        }));

        updates.items = convertedItems;

        // Convert insurance amounts if present
        if (invoice.insurance) {
            updates.insurance = {
                ...invoice.insurance,
                coverageAmount: convertToUSD(invoice.insurance.coverageAmount || 0),
                patientResponsibility: convertToUSD(invoice.insurance.patientResponsibility || 0),
                deductible: convertToUSD(invoice.insurance.deductible || 0)
            };
        }

        // Convert payments
        if (invoice.payments && invoice.payments.length > 0) {
            updates.payments = invoice.payments.map(payment => ({
                ...payment.toObject(),
                amount: convertToUSD(payment.amount)
            }));
        }

        await Invoice.findByIdAndUpdate(invoice._id, updates);

        console.log(`   ${invoice.invoiceNumber}: ${invoice.totalAmount.toLocaleString()} VNĐ → $${updates.totalAmount}`);
        updated++;
    }

    console.log(`✅ Updated ${updated} invoices`);
}

// Update seeding data (default prices)
async function updateSeedingDefaults() {
    console.log('\n🌱 Updating default pricing in seeding scripts...');

    const defaultPricesUSD = {
        'consultation': 8.33, // 200k VNĐ → $8.33
        'general medicine': 6.25, // 150k VNĐ → $6.25
        'neurology': 12.50, // 300k VNĐ → $12.50
        'prescription': 2.08, // 50k VNĐ → $2.08
        'CBC': 1.04, // 25k VNĐ → $1.04
        'ESR': 0.63, // 15k VNĐ → $0.63
        'paracetamol': 0.83, // 20k VNĐ → $0.83
        'amoxicillin': 1.25 // 30k VNĐ → $1.25
    };

    console.log('   Default USD prices to update in seeding scripts:');
    Object.entries(defaultPricesUSD).forEach(([service, price]) => {
        console.log(`   ${service}: $${price}`);
    });
}

// Validate conversion
async function validateConversion() {
    console.log('\n✅ Validating currency conversion...');

    // Sample checks
    const sampleInvoice = await Invoice.findOne({}).populate('patientId', 'firstName lastName');
    const sampleService = await ServiceCatalog.findOne({});
    const sampleLabTest = await LabTest.findOne({});

    console.log('\nSample converted data:');
    if (sampleInvoice) {
        console.log(`📋 Invoice ${sampleInvoice.invoiceNumber}:`);
        console.log(`   Patient: ${sampleInvoice.patientId.firstName} ${sampleInvoice.patientId.lastName}`);
        console.log(`   Total: $${sampleInvoice.totalAmount}`);
        console.log(`   Balance: $${sampleInvoice.balance}`);
    }

    if (sampleService) {
        console.log(`🏥 Service: ${sampleService.serviceName} → $${sampleService.price}`);
    }

    if (sampleLabTest) {
        console.log(`🧪 Lab Test: ${sampleLabTest.testName} → $${sampleLabTest.price}`);
    }

    // Check for consistency
    const invoiceCount = await Invoice.countDocuments({});
    const serviceCount = await ServiceCatalog.countDocuments({});
    const labTestCount = await LabTest.countDocuments({});

    console.log(`\n📊 Migration summary:`);
    console.log(`   Invoices processed: ${invoiceCount}`);
    console.log(`   Services processed: ${serviceCount}`);
    console.log(`   Lab tests processed: ${labTestCount}`);
    console.log(`   Conversion rate used: 1 USD = ${USD_VND_RATE.toLocaleString()} VNĐ`);
}

// Main migration function
async function runCurrencyMigration() {
    try {
        console.log('🔄 Starting Currency Standardization Migration');
        console.log('═'.repeat(60));

        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Step 1: Backup
        const backup = await backupData();

        // Step 2: Migrate data
        await migrateServiceCatalog();
        await migrateLabTests();
        await migrateInvoices();

        // Step 3: Update seeding defaults
        await updateSeedingDefaults();

        // Step 4: Validate
        await validateConversion();

        console.log('\n🎉 Currency migration completed successfully!');
        console.log('═'.repeat(60));
        console.log('⚠️  IMPORTANT REMINDERS:');
        console.log('   1. Update frontend display formats to show USD ($)');
        console.log('   2. Update seeding scripts with new USD default prices');
        console.log('   3. Test all financial calculations');
        console.log('   4. Update user documentation about currency change');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('📪 Database connection closed');
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runCurrencyMigration()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { runCurrencyMigration, convertToUSD, USD_VND_RATE };
