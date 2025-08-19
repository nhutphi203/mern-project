import mongoose from 'mongoose';
import { LabTest } from '../../models/labTest.model.js';
import { LabOrder } from '../../models/labOrder.model.js';
import { LabResult } from '../../models/labResult.model.js';

// Sample lab test data
const labTests = [
    {
        testCode: 'CBC',
        testName: 'Complete Blood Count',
        category: 'Hematology',
        department: 'Laboratory',
        normalRange: {
            min: null,
            max: null,
            textRange: 'See reference ranges for individual components',
            gender: 'All'
        },
        price: 20,
        turnaroundTime: 1,
        specimen: 'Blood',
        instructions: 'Fasting not required',
        isActive: true
    },
    {
        testCode: 'GLU',
        testName: 'Blood Glucose',
        category: 'Chemistry',
        department: 'Laboratory',
        normalRange: {
            min: 70,
            max: 100,
            unit: 'mg/dL',
            gender: 'All'
        },
        price: 15,
        turnaroundTime: 1,
        specimen: 'Blood',
        instructions: '8 hours fasting recommended',
        isActive: true
    },
    {
        testCode: 'LFT',
        testName: 'Liver Function Tests',
        category: 'Chemistry',
        department: 'Laboratory',
        normalRange: {
            textRange: 'See reference ranges for individual components'
        },
        price: 35,
        turnaroundTime: 1,
        specimen: 'Blood',
        isActive: true
    },
    {
        testCode: 'CHOL',
        testName: 'Cholesterol Panel',
        category: 'Chemistry',
        department: 'Laboratory',
        normalRange: {
            textRange: 'Total Cholesterol < 200 mg/dL, HDL > 40 mg/dL, LDL < 100 mg/dL'
        },
        price: 30,
        turnaroundTime: 1,
        specimen: 'Blood',
        instructions: '12 hours fasting required',
        isActive: true
    },
    {
        testCode: 'URIC',
        testName: 'Uric Acid',
        category: 'Chemistry',
        department: 'Laboratory',
        normalRange: {
            min: 3.4,
            max: 7.0,
            unit: 'mg/dL',
            gender: 'Male'
        },
        price: 15,
        turnaroundTime: 1,
        specimen: 'Blood',
        isActive: true
    }
];

// Function to seed lab tests
export async function seedLabTests() {
    try {
        // Clear existing data
        await LabTest.deleteMany({});
        
        // Insert new data
        const createdTests = await LabTest.insertMany(labTests);
        
        console.log(`✅ Successfully seeded ${createdTests.length} lab tests`);
        return createdTests;
    } catch (error) {
        console.error('❌ Error seeding lab tests:', error);
        throw error;
    }
}

// Function to seed sample lab orders and results
export async function seedLabData(patientIds, doctorIds, technicianIds) {
    try {
        if (!patientIds || !patientIds.length || !doctorIds || !doctorIds.length || !technicianIds || !technicianIds.length) {
            throw new Error('Required IDs not provided');
        }

        // Get all lab tests
        const tests = await LabTest.find({});
        if (!tests.length) {
            console.log('No lab tests found. Seeding lab tests first...');
            await seedLabTests();
            tests = await LabTest.find({});
        }

        // Clear existing data
        await LabOrder.deleteMany({});
        await LabResult.deleteMany({});

        // Create sample lab orders
        const orders = [];
        
        for (let i = 0; i < 10; i++) {
            // Randomly select patient and doctor
            const patientId = patientIds[Math.floor(Math.random() * patientIds.length)];
            const doctorId = doctorIds[Math.floor(Math.random() * doctorIds.length)];
            
            // Randomly select 1-3 tests
            const selectedTests = [];
            const numTests = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < numTests; j++) {
                const testIndex = Math.floor(Math.random() * tests.length);
                const priority = ['Routine', 'Urgent', 'STAT'][Math.floor(Math.random() * 3)];
                
                selectedTests.push({
                    testId: tests[testIndex]._id,
                    priority,
                    instructions: '',
                    status: 'Collected',
                    collectedAt: new Date()
                });
            }
            
            const totalAmount = selectedTests.reduce((sum, test) => {
                const testInfo = tests.find(t => t._id.toString() === test.testId.toString());
                return sum + (testInfo?.price || 0);
            }, 0);
            
            // Create order
            const order = await LabOrder.create({
                orderId: `LAB${100000 + i}`,
                encounterId: new mongoose.Types.ObjectId(),
                patientId,
                doctorId,
                tests: selectedTests,
                clinicalInfo: 'Sample clinical information for testing',
                totalAmount,
                status: 'Pending',
                orderedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in last 30 days
            });
            
            orders.push(order);
            
            // Create results for some orders (70% chance)
            if (Math.random() < 0.7) {
                const technicianId = technicianIds[Math.floor(Math.random() * technicianIds.length)];
                
                for (const test of order.tests) {
                    const testInfo = tests.find(t => t._id.toString() === test.testId.toString());
                    
                    // Generate a random result value
                    let value, isAbnormal = false, flag = 'Normal';
                    
                    if (testInfo.normalRange && testInfo.normalRange.min !== null && testInfo.normalRange.max !== null) {
                        // 80% chance of normal result, 20% abnormal
                        if (Math.random() < 0.8) {
                            // Normal result
                            const min = testInfo.normalRange.min;
                            const max = testInfo.normalRange.max;
                            value = min + Math.random() * (max - min);
                        } else {
                            // Abnormal result
                            isAbnormal = true;
                            if (Math.random() < 0.5) {
                                // Low value
                                value = testInfo.normalRange.min * (0.5 + Math.random() * 0.4); // 50-90% of min
                                flag = 'Low';
                            } else {
                                // High value
                                value = testInfo.normalRange.max * (1.1 + Math.random() * 0.5); // 110-160% of max
                                flag = 'High';
                            }
                        }
                        
                        // Round to 1 decimal place
                        value = Math.round(value * 10) / 10;
                    } else {
                        // For tests without numeric ranges, use text results
                        const textResults = ['Normal', 'No growth', 'Negative', 'Positive', 'Detected', 'Not detected'];
                        value = textResults[Math.floor(Math.random() * textResults.length)];
                        
                        if (value === 'Positive' || value === 'Detected') {
                            isAbnormal = true;
                            flag = 'Abnormal';
                        }
                    }
                    
                    const labResult = await LabResult.create({
                        orderId: order._id,
                        testId: test.testId,
                        patientId: order.patientId,
                        technicianId,
                        result: {
                            value,
                            unit: testInfo.normalRange?.unit || '',
                            isAbnormal,
                            flag
                        },
                        referenceRange: testInfo.normalRange?.textRange || 
                            `${testInfo.normalRange?.min || ''}-${testInfo.normalRange?.max || ''} ${testInfo.normalRange?.unit || ''}`,
                        interpretation: isAbnormal ? 'Requires clinical correlation' : '',
                        comments: isAbnormal ? 'Recommend follow-up testing' : '',
                        performedAt: new Date(),
                        status: 'Completed',
                        methodology: 'Automated analyzer',
                        instrument: 'XYZ Analyzer 3000'
                    });
                    
                    // Update test status to completed
                    test.status = 'Completed';
                    test.completedAt = new Date();
                }
                
                // If all tests are completed, mark order as completed
                order.status = 'Completed';
                order.completedAt = new Date();
                await order.save();
            }
        }
        
        console.log(`✅ Successfully seeded ${orders.length} lab orders with results`);
        return { orders };
    } catch (error) {
        console.error('❌ Error seeding lab data:', error);
        throw error;
    }
}

// For standalone testing
if (process.env.NODE_ENV !== 'production' && process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital');
        
        // You would need to provide actual IDs here when running standalone
        const patientIds = ['...'];
        const doctorIds = ['...'];
        const technicianIds = ['...'];
        
        await seedLabData(patientIds, doctorIds, technicianIds);
        
        console.log('✅ Lab data seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lab data seeding failed:', error);
        process.exit(1);
    }
}
