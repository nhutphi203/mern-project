// Test Currency Migration - DRY RUN
// Kiểm tra conversion logic trước khi migration thật

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Invoice } from '../../models/billing/invoice.model.js';
import { ServiceCatalog } from '../../models/serviceCatalog.model.js';
import { LabTest } from '../../models/labTest.model.js';
import { User } from '../../models/userScheme.js';

config({ path: './config/config.env' });

const USD_VND_RATE = 24000;

const convertToUSD = (vndAmount) => {
    return Math.round((vndAmount / USD_VND_RATE) * 100) / 100;
};

async function testCurrencyConversion() {
    try {
        console.log('🧪 TESTING Currency Conversion Logic');
        console.log('═'.repeat(50));

        await mongoose.connect(process.env.MONGO_URI);

        // Test 1: Sample conversion calculations
        console.log('\n📊 Conversion Tests:');
        const testAmounts = [100000, 200000, 300000, 25000, 15000, 50000];
        testAmounts.forEach(amount => {
            const converted = convertToUSD(amount);
            console.log(`   ${amount.toLocaleString()} VNĐ → $${converted}`);
        });

        // Test 2: Actual database sample
        console.log('\n📋 Database Sample Analysis:');

        const sampleInvoice = await Invoice.findOne({}).populate('patientId', 'firstName lastName');
        if (sampleInvoice) {
            console.log(`\n🧾 Sample Invoice: ${sampleInvoice.invoiceNumber}`);
            console.log(`   Current total: ${sampleInvoice.totalAmount.toLocaleString()} VNĐ`);
            console.log(`   Would become: $${convertToUSD(sampleInvoice.totalAmount)}`);
            console.log(`   Current balance: ${sampleInvoice.balance.toLocaleString()} VNĐ`);
            console.log(`   Would become: $${convertToUSD(sampleInvoice.balance)}`);

            console.log(`\n   Items conversion:`);
            sampleInvoice.items.forEach((item, index) => {
                console.log(`     ${index + 1}. ${item.description}`);
                console.log(`        ${item.netAmount.toLocaleString()} VNĐ → $${convertToUSD(item.netAmount)}`);
            });
        }

        const sampleService = await ServiceCatalog.findOne({});
        if (sampleService) {
            console.log(`\n🏥 Sample Service: ${sampleService.serviceName}`);
            console.log(`   Current price: ${sampleService.price.toLocaleString()} VNĐ`);
            console.log(`   Would become: $${convertToUSD(sampleService.price)}`);
        }

        const sampleLabTest = await LabTest.findOne({});
        if (sampleLabTest) {
            console.log(`\n🧪 Sample Lab Test: ${sampleLabTest.testName}`);
            console.log(`   Current price: ${sampleLabTest.price.toLocaleString()} VNĐ`);
            console.log(`   Would become: $${convertToUSD(sampleLabTest.price)}`);
        }

        // Test 3: Data integrity check
        console.log('\n📊 Data Overview:');
        const invoiceCount = await Invoice.countDocuments({});
        const serviceCount = await ServiceCatalog.countDocuments({});
        const labTestCount = await LabTest.countDocuments({});

        console.log(`   Invoices to migrate: ${invoiceCount}`);
        console.log(`   Services to migrate: ${serviceCount}`);
        console.log(`   Lab tests to migrate: ${labTestCount}`);

        // Test 4: Spot check calculations
        console.log('\n🔍 Spot Check - Current vs Future:');
        const invoices = await Invoice.find({}).limit(3);

        let totalCurrentVND = 0;
        let totalFutureUSD = 0;

        invoices.forEach(invoice => {
            totalCurrentVND += invoice.totalAmount;
            totalFutureUSD += convertToUSD(invoice.totalAmount);
        });

        console.log(`   Current total (sample): ${totalCurrentVND.toLocaleString()} VNĐ`);
        console.log(`   Future total (sample): $${totalFutureUSD.toFixed(2)}`);
        console.log(`   Expected ratio: ${(totalCurrentVND / (totalFutureUSD * USD_VND_RATE)).toFixed(4)} (should be ~1.0)`);

        console.log('\n✅ Test completed successfully!');
        console.log('Ready to run actual migration.');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testCurrencyConversion();
