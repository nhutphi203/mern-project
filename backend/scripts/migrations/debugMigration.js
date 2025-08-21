// Debug migration script
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Invoice } from '../../models/billing/invoice.model.js';

config({ path: './config/config.env' });

async function debugMigration() {
    try {
        console.log('🔍 Debug Migration Script Starting...');

        console.log('📋 Environment check:');
        console.log(`   MONGO_URI exists: ${!!process.env.MONGO_URI}`);
        console.log(`   MONGO_URI starts with: ${process.env.MONGO_URI?.substring(0, 20)}...`);

        console.log('\n🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected successfully');

        console.log('\n📊 Current data check:');
        const invoice = await Invoice.findOne({});
        if (invoice) {
            console.log(`   Sample invoice total: ${invoice.totalAmount}`);
            console.log(`   Sample invoice balance: ${invoice.balance}`);
            console.log(`   First item price: ${invoice.items[0]?.netAmount}`);
        } else {
            console.log('   No invoices found');
        }

        console.log('\n✅ Debug completed');

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('📪 Connection closed');
        }
    }
}

debugMigration();
