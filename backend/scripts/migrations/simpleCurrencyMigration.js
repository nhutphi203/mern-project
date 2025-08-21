// Simple Currency Migration - Direct execution
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Invoice } from '../../models/billing/invoice.model.js';
import { ServiceCatalog } from '../../models/serviceCatalog.model.js';
import { LabTest } from '../../models/labTest.model.js';

config({ path: './config/config.env' });

const USD_VND_RATE = 24000;

const convertToUSD = (vndAmount) => {
    return Math.round((vndAmount / USD_VND_RATE) * 100) / 100;
};

async function runSimpleMigration() {
    try {
        console.log('🔄 Starting Simple Currency Migration');
        console.log('═'.repeat(50));

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Database connected');

        // Step 1: Migrate ServiceCatalog
        console.log('\n🏥 Migrating ServiceCatalog...');
        const services = await ServiceCatalog.find({});
        for (const service of services) {
            const oldPrice = service.price;
            const newPrice = convertToUSD(oldPrice);

            await ServiceCatalog.findByIdAndUpdate(service._id, { price: newPrice });
            console.log(`   ${service.serviceName}: ${oldPrice} VNĐ → $${newPrice}`);
        }

        // Step 2: Migrate LabTest
        console.log('\n🧪 Migrating LabTests...');
        const labTests = await LabTest.find({});
        for (const test of labTests) {
            if (test.price) {
                const oldPrice = test.price;
                const newPrice = convertToUSD(oldPrice);

                await LabTest.findByIdAndUpdate(test._id, { price: newPrice });
                console.log(`   ${test.testName}: ${oldPrice} VNĐ → $${newPrice}`);
            }
        }

        // Step 3: Migrate Invoices
        console.log('\n🧾 Migrating Invoices...');
        const invoices = await Invoice.find({});
        for (const invoice of invoices) {
            // Convert main amounts
            const updates = {
                subtotal: convertToUSD(invoice.subtotal),
                totalDiscount: convertToUSD(invoice.totalDiscount || 0),
                totalTax: convertToUSD(invoice.totalTax || 0),
                totalAmount: convertToUSD(invoice.totalAmount),
                totalPaid: convertToUSD(invoice.totalPaid || 0),
                balance: convertToUSD(invoice.balance)
            };

            // Convert items
            const convertedItems = invoice.items.map(item => ({
                ...item.toObject(),
                unitPrice: convertToUSD(item.unitPrice),
                totalPrice: convertToUSD(item.totalPrice),
                discountAmount: convertToUSD(item.discountAmount || 0),
                taxAmount: convertToUSD(item.taxAmount || 0),
                netAmount: convertToUSD(item.netAmount)
            }));

            updates.items = convertedItems;

            // Convert insurance if exists
            if (invoice.insurance && invoice.insurance.coverageAmount) {
                updates.insurance = {
                    ...invoice.insurance,
                    coverageAmount: convertToUSD(invoice.insurance.coverageAmount || 0),
                    patientResponsibility: convertToUSD(invoice.insurance.patientResponsibility || 0),
                    deductible: convertToUSD(invoice.insurance.deductible || 0)
                };
            }

            // Convert payments if exist
            if (invoice.payments && invoice.payments.length > 0) {
                updates.payments = invoice.payments.map(payment => ({
                    ...payment.toObject(),
                    amount: convertToUSD(payment.amount)
                }));
            }

            await Invoice.findByIdAndUpdate(invoice._id, updates);
            console.log(`   ${invoice.invoiceNumber}: ${invoice.totalAmount} VNĐ → $${updates.totalAmount}`);
        }

        console.log('\n✅ Migration completed successfully!');
        console.log(`   Services migrated: ${services.length}`);
        console.log(`   Lab tests migrated: ${labTests.length}`);
        console.log(`   Invoices migrated: ${invoices.length}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('📪 Database closed');
    }
}

// Run the migration
runSimpleMigration()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Error:', error);
        process.exit(1);
    });
