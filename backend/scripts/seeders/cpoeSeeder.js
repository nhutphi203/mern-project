// CPOE (Computerized Provider Order Entry) Seeder
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { CPOE } from '../../models/cpoe.model.js';
import { User } from '../../models/userScheme.js';
import { Encounter } from '../../models/encounter.model.js';

config({ path: './config/config.env' });

export const seedCPOEOrders = async () => {
    try {
        console.log('💊 Seeding CPOE Orders...');

        // Get sample data
        const patients = await User.find({ role: 'Patient' }).limit(3);
        const doctors = await User.find({ role: 'Doctor' }).limit(2);
        const nurses = await User.find({ role: 'Nurse' }).limit(2);
        const encounters = await Encounter.find({}).populate('patientId doctorId').limit(3);

        if (patients.length === 0 || doctors.length === 0) {
            console.log('❌ Need patients and doctors to create CPOE orders');
            return;
        }

        // Clear existing CPOE orders
        await CPOE.deleteMany({});
        console.log('   ✅ Cleared existing CPOE orders');

        const cpoeOrders = [];

        // Medication Orders for Diabetes Patient
        const diabetesMedications = [
            {
                patientId: patients[0]._id,
                encounterId: encounters[0]?._id,
                orderedBy: doctors[0]._id,
                orderType: 'Medication',

                medicationOrder: {
                    medicationName: 'Metformin',
                    genericName: 'Metformin hydrochloride',
                    dosage: '500mg',
                    route: 'Oral',
                    frequency: 'BID (twice daily)',
                    duration: '3 months',
                    instructions: 'Take with meals to reduce GI upset. Monitor for signs of lactic acidosis.',
                    indication: 'Type 2 diabetes mellitus',
                    contraindications: ['Renal impairment', 'Hepatic impairment'],
                    allergies: [],
                    drugInteractions: [
                        'Monitor INR if taking warfarin',
                        'May enhance hypoglycemic effect of insulin'
                    ]
                },

                clinicalContext: {
                    urgency: 'Routine',
                    clinicalJustification: 'First-line therapy for Type 2 diabetes. Patient has good renal function.',
                    expectedOutcome: 'Improved glycemic control, HbA1c reduction'
                },

                safetyChecks: {
                    allergyCheck: {
                        status: 'Passed',
                        checkedBy: doctors[0]._id,
                        notes: 'No known drug allergies'
                    },
                    drugInteractionCheck: {
                        status: 'Warning',
                        interactions: ['Monitor blood glucose when used with insulin'],
                        checkedBy: doctors[0]._id
                    },
                    dosageCheck: {
                        status: 'Passed',
                        appropriateForAge: true,
                        appropriateForWeight: true,
                        checkedBy: doctors[0]._id
                    }
                },

                orderStatus: 'Active',
                priority: 'Routine'
            },

            {
                patientId: patients[0]._id,
                encounterId: encounters[0]?._id,
                orderedBy: doctors[0]._id,
                orderType: 'Medication',

                medicationOrder: {
                    medicationName: 'Lisinopril',
                    genericName: 'Lisinopril',
                    dosage: '10mg',
                    route: 'Oral',
                    frequency: 'Daily',
                    duration: '3 months',
                    instructions: 'Take in the morning. Monitor blood pressure and potassium levels.',
                    indication: 'Essential hypertension',
                    contraindications: ['Pregnancy', 'Angioedema history'],
                    allergies: []
                },

                clinicalContext: {
                    urgency: 'Routine',
                    clinicalJustification: 'ACE inhibitor for hypertension and diabetic nephropathy prevention',
                    expectedOutcome: 'Blood pressure control, renal protection'
                },

                orderStatus: 'Active',
                priority: 'Routine'
            }
        ];

        // Laboratory Orders
        const labOrders = [
            {
                patientId: patients[0]._id,
                encounterId: encounters[0]?._id,
                orderedBy: doctors[0]._id,
                orderType: 'Laboratory',

                laboratoryOrder: {
                    testName: 'Comprehensive Metabolic Panel',
                    testCode: 'CMP',
                    specimens: ['Serum'],
                    instructions: 'Fasting specimen preferred. Draw in the morning.',
                    clinicalIndication: 'Diabetes follow-up, monitor renal function',
                    expectedResults: [
                        'Glucose', 'BUN', 'Creatinine', 'eGFR',
                        'Sodium', 'Potassium', 'Chloride', 'CO2'
                    ]
                },

                clinicalContext: {
                    urgency: 'Routine',
                    clinicalJustification: 'Monitor metabolic status and renal function in diabetic patient',
                    expectedOutcome: 'Assessment of glycemic control and kidney function'
                },

                orderStatus: 'Pending',
                priority: 'Routine'
            },

            {
                patientId: patients[0]._id,
                encounterId: encounters[0]?._id,
                orderedBy: doctors[0]._id,
                orderType: 'Laboratory',

                laboratoryOrder: {
                    testName: 'Hemoglobin A1c',
                    testCode: 'HbA1c',
                    specimens: ['Whole blood'],
                    instructions: 'No fasting required',
                    clinicalIndication: 'Diabetes management and monitoring',
                    expectedResults: ['HbA1c percentage']
                },

                clinicalContext: {
                    urgency: 'Routine',
                    clinicalJustification: 'Assess long-term glycemic control over past 2-3 months',
                    expectedOutcome: 'Evaluation of diabetes management effectiveness'
                },

                orderStatus: 'Pending',
                priority: 'Routine'
            }
        ];

        // Diagnostic Imaging Orders
        const imagingOrders = [
            {
                patientId: patients[1]._id,
                encounterId: encounters[1]?._id,
                orderedBy: doctors[1]._id,
                orderType: 'Imaging',

                imagingOrder: {
                    studyType: 'Chest X-ray',
                    modality: 'X-ray',
                    bodyPart: 'Chest',
                    views: ['PA', 'Lateral'],
                    contrast: false,
                    instructions: 'Rule out pneumonia. Remove all metal objects.',
                    clinicalIndication: 'Cough, fever, shortness of breath',
                    radiologist: 'Dr. Johnson'
                },

                clinicalContext: {
                    urgency: 'STAT',
                    clinicalJustification: 'Acute respiratory symptoms require immediate imaging',
                    expectedOutcome: 'Rule out pneumonia, pneumothorax, or other pulmonary pathology'
                },

                orderStatus: 'Pending',
                priority: 'STAT'
            },

            {
                patientId: patients[1]._id,
                encounterId: encounters[1]?._id,
                orderedBy: doctors[1]._id,
                orderType: 'Imaging',

                imagingOrder: {
                    studyType: 'ECG',
                    modality: 'Electrocardiogram',
                    bodyPart: 'Heart',
                    views: ['12-lead'],
                    contrast: false,
                    instructions: 'Standard 12-lead ECG. Patient should be supine and relaxed.',
                    clinicalIndication: 'Chest pain, rule out cardiac ischemia',
                    radiologist: 'Cardiology Department'
                },

                clinicalContext: {
                    urgency: 'STAT',
                    clinicalJustification: 'Chest pain requires immediate cardiac evaluation',
                    expectedOutcome: 'Rule out acute coronary syndrome'
                },

                orderStatus: 'Pending',
                priority: 'STAT'
            }
        ];

        // Procedure Orders
        const procedureOrders = [
            {
                patientId: patients[2]._id,
                encounterId: encounters[2]?._id,
                orderedBy: doctors[0]._id,
                orderType: 'Procedure',

                procedureOrder: {
                    procedureName: 'Blood Glucose Monitoring',
                    procedureCode: 'BGM',
                    description: 'Fingerstick blood glucose check',
                    frequency: 'QID (four times daily)',
                    duration: '7 days',
                    location: 'Bedside',
                    specialInstructions: 'Check before meals and at bedtime. Notify physician if >250 or <70 mg/dL',
                    requiredEquipment: ['Glucometer', 'Test strips', 'Lancets'],
                    performedBy: 'Nursing staff'
                },

                clinicalContext: {
                    urgency: 'Routine',
                    clinicalJustification: 'Monitor blood glucose in diabetic patient during illness',
                    expectedOutcome: 'Early detection of hyperglycemia or hypoglycemia'
                },

                orderStatus: 'Active',
                priority: 'Routine'
            }
        ];

        // Nursing Orders
        const nursingOrders = [
            {
                patientId: patients[2]._id,
                encounterId: encounters[2]?._id,
                orderedBy: doctors[0]._id,
                orderType: 'Nursing',

                nursingOrder: {
                    orderDescription: 'Vital Signs Monitoring',
                    frequency: 'Q4H (every 4 hours)',
                    duration: '24 hours',
                    parameters: [
                        'Blood pressure',
                        'Heart rate',
                        'Respiratory rate',
                        'Temperature',
                        'Oxygen saturation'
                    ],
                    alertCriteria: [
                        'SBP >160 or <90',
                        'HR >100 or <60',
                        'RR >24 or <12',
                        'Temp >101°F',
                        'O2 sat <95%'
                    ],
                    instructions: 'Notify physician immediately if any parameter outside normal range'
                },

                clinicalContext: {
                    urgency: 'Routine',
                    clinicalJustification: 'Monitor patient response to treatment and detect deterioration',
                    expectedOutcome: 'Early identification of clinical changes'
                },

                orderStatus: 'Active',
                priority: 'Routine'
            }
        ];

        // Combine all orders
        cpoeOrders.push(
            ...diabetesMedications,
            ...labOrders,
            ...imagingOrders,
            ...procedureOrders,
            ...nursingOrders
        );

        // Insert CPOE orders
        const insertedOrders = await CPOE.insertMany(cpoeOrders);

        console.log(`   ✅ Created ${insertedOrders.length} CPOE orders`);

        // Display summary by order type
        const orderSummary = {};
        insertedOrders.forEach(order => {
            orderSummary[order.orderType] = (orderSummary[order.orderType] || 0) + 1;
        });

        console.log('\n💊 CPOE Orders Summary:');
        Object.entries(orderSummary).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} orders`);
        });

        // Display active vs pending orders
        const activeOrders = insertedOrders.filter(order => order.orderStatus === 'Active').length;
        const pendingOrders = insertedOrders.filter(order => order.orderStatus === 'Pending').length;

        console.log(`\n📊 Order Status:`)
        console.log(`   Active: ${activeOrders}`);
        console.log(`   Pending: ${pendingOrders}`);

        return insertedOrders;

    } catch (error) {
        console.error('❌ Error seeding CPOE orders:', error);
        throw error;
    }
};
