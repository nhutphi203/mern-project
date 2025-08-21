// Enhanced Medical Record Seeder
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { EnhancedMedicalRecord } from '../../models/enhancedMedicalRecord.model.js';
import { CPOE } from '../../models/cpoe.model.js';
import { User } from '../../models/userScheme.js';
import { Encounter } from '../../models/encounter.model.js';
import { ICD10 } from '../../models/icd10.model.js';

config({ path: './config/config.env' });

export const seedEnhancedMedicalRecords = async () => {
    try {
        console.log('📋 Seeding Enhanced Medical Records...');

        // Get sample data
        const patients = await User.find({ role: 'Patient' }).limit(3);
        const doctors = await User.find({ role: 'Doctor' }).limit(2);
        const encounters = await Encounter.find({}).populate('patientId doctorId').limit(3);
        const icd10Codes = await ICD10.find({}).limit(10);

        if (patients.length === 0 || doctors.length === 0) {
            console.log('❌ Need patients and doctors to create medical records');
            return;
        }

        // Clear existing records
        await EnhancedMedicalRecord.deleteMany({});
        console.log('   ✅ Cleared existing enhanced medical records');

        const medicalRecords = [];

        // Record 1: Diabetes Management
        const diabetesRecord = {
            patientId: patients[0]._id,
            doctorId: doctors[0]._id,
            encounterId: encounters[0]?._id,

            // Clinical Assessment
            clinicalAssessment: {
                chiefComplaint: 'Follow-up for diabetes management and routine check-up',
                historyOfPresentIllness: 'Patient reports good adherence to medication. Occasional episodes of mild hypoglycemia in the morning. No polyuria, polydipsia, or polyphagia. Energy levels stable.',
                reviewOfSystems: {
                    constitutional: 'No fever, weight loss, or night sweats',
                    cardiovascular: 'No chest pain, palpitations, or shortness of breath',
                    endocrine: 'Diabetes well controlled, no symptoms of hyperglycemia',
                    neurological: 'No numbness or tingling in extremities'
                },
                physicalExam: {
                    vitalSigns: {
                        bloodPressure: '128/82',
                        heartRate: 76,
                        temperature: 36.8,
                        respiratoryRate: 16,
                        oxygenSaturation: 98,
                        weight: 78.5,
                        height: 170,
                        bmi: 27.2
                    },
                    generalAppearance: 'Well-appearing, no acute distress',
                    cardiovascular: 'Regular rate and rhythm, no murmurs',
                    abdomen: 'Soft, non-tender, no organomegaly',
                    extremities: 'No edema, pulses intact, good circulation'
                },
                clinicalImpression: 'Type 2 diabetes mellitus with good control',
                assessedBy: doctors[0]._id
            },

            // Diagnoses
            diagnoses: [
                {
                    icd10Code: 'E11.9',
                    icd10Description: 'Type 2 diabetes mellitus without complications',
                    diagnosisType: 'Primary',
                    clinicalNotes: 'Well-controlled with current medication regimen. HbA1c 7.1%',
                    severity: 'Moderate',
                    status: 'Active',
                    confidence: 'Confirmed',
                    addedBy: doctors[0]._id
                },
                {
                    icd10Code: 'I10',
                    icd10Description: 'Essential (primary) hypertension',
                    diagnosisType: 'Secondary',
                    clinicalNotes: 'Mild hypertension, well-controlled with ACE inhibitor',
                    severity: 'Mild',
                    status: 'Active',
                    confidence: 'Confirmed',
                    addedBy: doctors[0]._id
                }
            ],

            // Treatment Plans
            treatmentPlans: [
                {
                    planName: 'Diabetes Management Protocol',
                    planType: 'Medication',
                    description: 'Continue current antidiabetic medications with lifestyle modifications',
                    objectives: [
                        'Maintain HbA1c below 7.5%',
                        'Monitor blood glucose daily',
                        'Prevent diabetic complications'
                    ],
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
                    frequency: 'Daily',
                    status: 'Active',
                    adherence: 'Good',
                    prescribedBy: doctors[0]._id
                },
                {
                    planName: 'Lifestyle Modification',
                    planType: 'Lifestyle',
                    description: 'Dietary counseling and exercise program',
                    objectives: [
                        'Weight reduction of 5-7%',
                        'Regular aerobic exercise 150 min/week',
                        'Carbohydrate counting education'
                    ],
                    startDate: new Date(),
                    frequency: 'Ongoing',
                    status: 'Active',
                    prescribedBy: doctors[0]._id
                }
            ],

            // Progress Notes
            progressNotes: [
                {
                    noteType: 'Follow-up',
                    content: 'Patient doing well on current regimen. Blood glucose logs show good control. Continue current medications. Follow up in 3 months with lab work.',
                    author: doctors[0]._id,
                    authorRole: 'Doctor'
                }
            ],

            recordStatus: 'Finalized'
        };

        // Record 2: Hypertension and Cardiac Follow-up
        const cardiacRecord = {
            patientId: patients[1]._id,
            doctorId: doctors[1]._id,
            encounterId: encounters[1]?._id,

            clinicalAssessment: {
                chiefComplaint: 'Routine follow-up for hypertension and chest pain evaluation',
                historyOfPresentIllness: 'Patient reports intermittent chest discomfort with exertion, relieved by rest. No associated shortness of breath or diaphoresis. Blood pressure readings at home averaging 140-150/85-90.',
                reviewOfSystems: {
                    cardiovascular: 'Chest pain with exertion, no palpitations',
                    respiratory: 'No shortness of breath at rest',
                    constitutional: 'No fatigue or syncope'
                },
                physicalExam: {
                    vitalSigns: {
                        bloodPressure: '152/88',
                        heartRate: 82,
                        temperature: 37.0,
                        respiratoryRate: 18,
                        oxygenSaturation: 97,
                        weight: 85.2,
                        height: 175,
                        bmi: 27.8
                    },
                    cardiovascular: 'Regular rate, possible S4 gallop, no murmurs',
                    chest: 'Clear to auscultation bilaterally'
                },
                assessedBy: doctors[1]._id
            },

            diagnoses: [
                {
                    icd10Code: 'I10',
                    icd10Description: 'Essential (primary) hypertension',
                    diagnosisType: 'Primary',
                    clinicalNotes: 'Uncontrolled hypertension, requiring medication adjustment',
                    severity: 'Moderate',
                    status: 'Active',
                    addedBy: doctors[1]._id
                },
                {
                    icd10Code: 'I25.9',
                    icd10Description: 'Chronic ischemic heart disease, unspecified',
                    diagnosisType: 'Differential',
                    clinicalNotes: 'Rule out coronary artery disease given exertional chest pain',
                    severity: 'Moderate',
                    status: 'Active',
                    addedBy: doctors[1]._id
                }
            ],

            treatmentPlans: [
                {
                    planName: 'Hypertension Management',
                    planType: 'Medication',
                    description: 'Optimize antihypertensive therapy',
                    objectives: ['Target BP < 130/80', 'Prevent cardiovascular complications'],
                    startDate: new Date(),
                    status: 'Active',
                    prescribedBy: doctors[1]._id
                }
            ],

            recordStatus: 'In Progress'
        };

        // Record 3: Respiratory Infection
        const respiratoryRecord = {
            patientId: patients[2]._id,
            doctorId: doctors[0]._id,
            encounterId: encounters[2]?._id,

            clinicalAssessment: {
                chiefComplaint: 'Cough, fever, and shortness of breath for 3 days',
                historyOfPresentIllness: 'Patient developed acute onset of dry cough with fever up to 101°F. Progressive shortness of breath with minimal exertion. No chest pain. No recent travel or sick contacts.',
                physicalExam: {
                    vitalSigns: {
                        bloodPressure: '118/75',
                        heartRate: 95,
                        temperature: 38.4,
                        respiratoryRate: 22,
                        oxygenSaturation: 94,
                        weight: 68.0,
                        height: 165
                    },
                    chest: 'Decreased breath sounds right lower lobe, dullness to percussion',
                    cardiovascular: 'Tachycardic but regular, no murmurs'
                },
                assessedBy: doctors[0]._id
            },

            diagnoses: [
                {
                    icd10Code: 'J06.9',
                    icd10Description: 'Acute upper respiratory infection, unspecified',
                    diagnosisType: 'Primary',
                    clinicalNotes: 'Community-acquired pneumonia suspected, pending chest X-ray',
                    severity: 'Moderate',
                    status: 'Active',
                    addedBy: doctors[0]._id
                },
                {
                    icd10Code: 'R50.9',
                    icd10Description: 'Fever, unspecified',
                    diagnosisType: 'Secondary',
                    clinicalNotes: 'Fever associated with respiratory infection',
                    severity: 'Mild',
                    status: 'Active',
                    addedBy: doctors[0]._id
                }
            ],

            treatmentPlans: [
                {
                    planName: 'Pneumonia Treatment',
                    planType: 'Medication',
                    description: 'Antibiotic therapy and supportive care',
                    objectives: ['Resolution of infection', 'Symptom relief'],
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    frequency: 'BID x 7 days',
                    status: 'Active',
                    prescribedBy: doctors[0]._id
                }
            ],

            recordStatus: 'In Progress'
        };

        // Insert records
        medicalRecords.push(diabetesRecord, cardiacRecord, respiratoryRecord);
        const insertedRecords = await EnhancedMedicalRecord.insertMany(medicalRecords);

        console.log(`   ✅ Created ${insertedRecords.length} enhanced medical records`);

        // Display summary
        console.log('\n📋 Created Medical Records:');
        insertedRecords.forEach((record, index) => {
            console.log(`   ${index + 1}. Patient: ${patients[index]?.firstName} - Primary Diagnosis: ${record.diagnoses[0]?.icd10Description}`);
        });

        return insertedRecords;

    } catch (error) {
        console.error('❌ Error seeding enhanced medical records:', error);
        throw error;
    }
};
