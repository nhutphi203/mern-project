// Fix LabTest minimum prices and update display formats
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { LabTest } from '../../models/labTest.model.js';

config({ path: './config/config.env' });

async function fixLabTestPrices() {
    try {
        console.log('🔧 Fixing LabTest minimum prices...');

        await mongoose.connect(process.env.MONGO_URI);

        // Update lab tests with minimum USD prices
        const minimumPrices = {
            'Fasting Blood Glucose': 15.00,
            'Hemoglobin A1c (HbA1c)': 25.00,
            'Lipid Panel': 20.00,
            'Liver Function Panel': 30.00,
            'Urine Culture & Sensitivity': 18.00,
            'Blood Culture': 35.00,
            'Thyroid Stimulating Hormone (TSH)': 22.00,
            'Prostate Specific Antigen (PSA)': 28.00,
            'Pap Smear': 45.00,
            'Tissue Biopsy': 85.00,
            'Chest X-Ray': 40.00,
            'CT Scan - Abdomen': 120.00,
            'Complete Blood Count (CBC)': 12.00,
            'Erythrocyte Sedimentation Rate (ESR)': 8.00
        };

        let updated = 0;

        for (const [testName, price] of Object.entries(minimumPrices)) {
            const result = await LabTest.updateMany(
                { testName: { $regex: testName, $options: 'i' } },
                { price: price }
            );

            if (result.modifiedCount > 0) {
                console.log(`   ✅ ${testName}: $${price}`);
                updated += result.modifiedCount;
            }
        }

        console.log(`\n✅ Updated ${updated} lab test prices`);

        // Show current prices
        const labTests = await LabTest.find({}).limit(10);
        console.log('\n📋 Current lab test prices:');
        labTests.forEach(test => {
            console.log(`   ${test.testName}: $${test.price}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixLabTestPrices();
