// Simple script to check lab vs invoice data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config', 'config.env') });

async function simpleDataCheck() {
    try {
        console.log('🔍 SIMPLE DATA CHECK: Lab Results vs Invoices\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get raw counts using aggregation to avoid populate issues
        const labOrdersCount = await mongoose.connection.db.collection('laborders').countDocuments();
        const labResultsCount = await mongoose.connection.db.collection('labresults').countDocuments();
        const invoicesCount = await mongoose.connection.db.collection('invoices').countDocuments();
        const encountersCount = await mongoose.connection.db.collection('encounters').countDocuments();

        console.log('📊 BASIC COUNTS:');
        console.log(`   Lab Orders: ${labOrdersCount}`);
        console.log(`   Lab Results: ${labResultsCount}`);
        console.log(`   Invoices: ${invoicesCount}`);
        console.log(`   Encounters: ${encountersCount}`);

        // Get lab orders by status
        const labOrdersByStatus = await mongoose.connection.db.collection('laborders').aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();

        console.log('\n📋 LAB ORDERS BY STATUS:');
        labOrdersByStatus.forEach(group => {
            console.log(`   ${group._id}: ${group.count}`);
        });

        // Get lab results by status
        const labResultsByStatus = await mongoose.connection.db.collection('labresults').aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();

        console.log('\n🧪 LAB RESULTS BY STATUS:');
        labResultsByStatus.forEach(group => {
            console.log(`   ${group._id}: ${group.count}`);
        });

        // Get invoices by status
        const invoicesByStatus = await mongoose.connection.db.collection('invoices').aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();

        console.log('\n💰 INVOICES BY STATUS:');
        invoicesByStatus.forEach(group => {
            console.log(`   ${group._id}: ${group.count}`);
        });

        // Get sample lab orders
        const sampleLabOrders = await mongoose.connection.db.collection('laborders').find({}).limit(5).toArray();
        console.log('\n📋 SAMPLE LAB ORDERS:');
        sampleLabOrders.forEach(order => {
            console.log(`   ${order.orderNumber || order._id} - Status: ${order.status} - Created: ${order.createdAt?.toLocaleDateString()}`);
        });

        // Get sample lab results
        const sampleLabResults = await mongoose.connection.db.collection('labresults').find({}).limit(5).toArray();
        console.log('\n🧪 SAMPLE LAB RESULTS:');
        sampleLabResults.forEach(result => {
            console.log(`   ${result.reportNumber || result._id} - Status: ${result.status} - Created: ${result.createdAt?.toLocaleDateString()}`);
        });

        // Get sample invoices
        const sampleInvoices = await mongoose.connection.db.collection('invoices').find({}).limit(5).toArray();
        console.log('\n💰 SAMPLE INVOICES:');
        sampleInvoices.forEach(invoice => {
            console.log(`   ${invoice.invoiceNumber} - Status: ${invoice.status} - Total: ${invoice.totalAmount} VND`);
            const labItems = invoice.items?.filter(item => item.type === 'Laboratory' || item.type === 'lab') || [];
            if (labItems.length > 0) {
                console.log(`      Lab Items: ${labItems.length}`);
                labItems.forEach(item => {
                    console.log(`        - ${item.description}`);
                });
            }
        });

        // Check for inconsistencies
        console.log('\n⚠️  ANALYSIS:');

        if (labOrdersCount > labResultsCount) {
            console.log(`   ⚠️  ${labOrdersCount - labResultsCount} lab orders without results`);
        } else if (labResultsCount > labOrdersCount) {
            console.log(`   ⚠️  ${labResultsCount - labOrdersCount} lab results without orders`);
        } else {
            console.log(`   ✅ Lab orders and results count match`);
        }

        if (labResultsCount === 0 && invoicesCount > 0) {
            console.log(`   ⚠️  Warning: ${invoicesCount} invoices but 0 lab results - possible seeding issue`);
        }

        const labItemsTotal = sampleInvoices.reduce((total, invoice) => {
            const labItems = invoice.items?.filter(item => item.type === 'Laboratory' || item.type === 'lab') || [];
            return total + labItems.length;
        }, 0);

        console.log(`   Lab-related invoice items: ${labItemsTotal}`);

        console.log('\n🎯 CONCLUSION:');
        if (labResultsCount === 0) {
            console.log('   ❌ No lab results found - this explains why sidebar shows 2 for lab queue but 3 for invoices');
            console.log('   📝 Recommendation: Re-seed lab data or check seeding script');
        } else {
            console.log('   ✅ Lab results exist - need to check why sidebar count is incorrect');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

simpleDataCheck();
