import { dbConnection } from '../database/dbConnection.js';
import mongoose from 'mongoose';

// Import models
import { User } from '../models/userScheme.js';
import { Appointment } from '../models/appointmentSchema.js';
import { Encounter } from '../models/encounter.model.js';
import { LabOrder } from '../models/labOrder.model.js';
import { LabResult } from '../models/labResult.model.js';
import { ServiceCatalog } from '../models/serviceCatalog.model.js';
// Import invoice models conditionally to avoid conflicts
// import { Invoice } from '../models/billing/invoice.model.js';
// import InvoiceOld from '../models/invoice.model.js';

async function checkCurrentData() {
    try {
        // Connect to database
        await dbConnection();
        console.log('✅ Connected to database');

        // Check existing data
        const userCount = await User.countDocuments();
        const appointmentCount = await Appointment.countDocuments();
        const encounterCount = await Encounter.countDocuments();
        const labOrderCount = await LabOrder.countDocuments();
        const labResultCount = await LabResult.countDocuments();
        const serviceCount = await ServiceCatalog.countDocuments();

        // Check invoice models manually to avoid conflicts
        let invoiceCount = 0;
        let invoiceOldCount = 0;

        try {
            // Check new billing invoice
            const InvoiceNew = mongoose.model('Invoice');
            invoiceCount = await InvoiceNew.countDocuments();
        } catch (err) {
            console.log('New Invoice model not available');
        }

        try {
            // Check old invoice if exists
            const collections = await mongoose.connection.db.listCollections().toArray();
            const hasOldInvoice = collections.some(col => col.name === 'invoices');
            if (hasOldInvoice) {
                invoiceOldCount = await mongoose.connection.db.collection('invoices').countDocuments();
            }
        } catch (err) {
            console.log('Old invoice collection check failed');
        }

        console.log('\n=== CURRENT DATA STATUS ===');
        console.log(`Users: ${userCount}`);
        console.log(`Appointments: ${appointmentCount}`);
        console.log(`Encounters: ${encounterCount}`);
        console.log(`Lab Orders: ${labOrderCount}`);
        console.log(`Lab Results: ${labResultCount}`);
        console.log(`Service Catalog: ${serviceCount}`);
        console.log(`New Invoices (billing/): ${invoiceCount}`);
        console.log(`Old Invoices (root): ${invoiceOldCount}`);

        // Sample users by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    samples: { $push: { firstName: '$firstName', lastName: '$lastName' } }
                }
            }
        ]);

        console.log('\n=== USERS BY ROLE ===');
        usersByRole.forEach(role => {
            console.log(`${role._id}: ${role.count} users`);
            if (role.samples.length > 0) {
                console.log(`  Sample: ${role.samples[0].firstName} ${role.samples[0].lastName}`);
            }
        });

        // Check if we have comprehensive data for billing
        if (userCount > 0 && appointmentCount > 0 && encounterCount > 0) {
            console.log('\n✅ Sufficient base data available for billing implementation');
        } else {
            console.log('\n⚠️ Missing base data. Need to run seeders first.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkCurrentData();
