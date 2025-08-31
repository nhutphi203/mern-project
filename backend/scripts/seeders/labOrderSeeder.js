import mongoose from 'mongoose';
import { LabOrder } from '../../models/labOrder.model.js';
import { LabTest } from '../../models/labTest.model.js';

export const seedLabOrders = async (encounters, users, labTests) => {
    try {
        if (!encounters || !users || !labTests) {
            throw new Error('Encounters, users, and lab tests data are required for seeding lab orders');
        }

        // Clear existing lab orders
        await LabOrder.deleteMany({});

        const labOrders = [];
        const { doctors } = users;

        // Create lab orders for some encounters (60% chance)
        for (const encounter of encounters) {
            if (Math.random() < 0.6) {
                const doctor = doctors[Math.floor(Math.random() * doctors.length)];

                // Randomly select 1-4 tests
                const numTests = Math.floor(Math.random() * 4) + 1;
                const selectedTests = [];

                for (let i = 0; i < numTests; i++) {
                    const test = labTests[Math.floor(Math.random() * labTests.length)];
                    const priorities = ['Routine', 'Urgent', 'STAT'];
                    const priority = priorities[Math.floor(Math.random() * priorities.length)];

                    // Avoid duplicate tests in the same order
                    if (!selectedTests.find(st => st.testId.toString() === test._id.toString())) {
                        const testStatuses = ['Ordered', 'Collected', 'InProgress', 'Completed'];
                        const testStatus = testStatuses[Math.floor(Math.random() * testStatuses.length)];

                        let collectedAt = null;
                        let completedAt = null;

                        if (testStatus === 'Collected' || testStatus === 'InProgress' || testStatus === 'Completed') {
                            collectedAt = new Date(encounter.checkInTime.getTime() + Math.random() * 2 * 60 * 60 * 1000); // Within 2 hours of check-in
                        }

                        if (testStatus === 'Completed') {
                            completedAt = new Date(collectedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000); // Within 24 hours of collection
                        }

                        selectedTests.push({
                            testId: test._id,
                            priority: priority,
                            instructions: priority === 'STAT' ? 'Rush processing required' : '',
                            status: testStatus,
                            collectedAt: collectedAt,
                            completedAt: completedAt
                        });
                    }
                }

                if (selectedTests.length > 0) {
                    const totalAmount = selectedTests.reduce((sum, selectedTest) => {
                        const test = labTests.find(t => t._id.toString() === selectedTest.testId.toString());
                        return sum + (test?.price || 0);
                    }, 0);

                    const orderStatuses = ['Pending', 'InProgress', 'Completed'];
                    let orderStatus = 'Pending';

                    // Determine order status based on test statuses
                    const allCompleted = selectedTests.every(t => t.status === 'Completed');
                    const anyInProgress = selectedTests.some(t => t.status === 'InProgress' || t.status === 'Collected');

                    if (allCompleted) {
                        orderStatus = 'Completed';
                    } else if (anyInProgress) {
                        orderStatus = 'InProgress';
                    }

                    const clinicalInfos = [
                        'Routine checkup - baseline laboratory values',
                        'Patient complaints of fatigue and weakness',
                        'Follow-up laboratory studies',
                        'Pre-operative laboratory workup',
                        'Monitoring medication levels',
                        'Abnormal findings on physical examination',
                        'Annual health screening',
                        'Patient history of diabetes mellitus'
                    ];

                    const labOrder = {
                        encounterId: encounter._id,
                        patientId: encounter.patientId,
                        doctorId: doctor._id,
                        tests: selectedTests,
                        clinicalInfo: clinicalInfos[Math.floor(Math.random() * clinicalInfos.length)],
                        totalAmount: totalAmount,
                        status: orderStatus,
                        orderedAt: encounter.checkInTime,
                        completedAt: orderStatus === 'Completed' ? new Date(encounter.checkInTime.getTime() + Math.random() * 48 * 60 * 60 * 1000) : null,
                        notes: orderStatus === 'Completed' ? 'All tests completed successfully' : ''
                    };

                    labOrders.push(labOrder);
                }
            }
        }

        const createdLabOrders = await LabOrder.insertMany(labOrders);
        console.log(`✅ Successfully seeded ${createdLabOrders.length} lab orders`);

        return createdLabOrders;
    } catch (error) {
        console.error('❌ Error seeding lab orders:', error);
        throw error;
    }
};
