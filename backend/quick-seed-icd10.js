#!/usr/bin/env node

/**
 * Quick ICD-10 Seeder
 * Tạo một số ICD-10 codes cơ bản để test
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Import ICD-10 model
import { ICD10 } from './models/icd10.model.js';

const basicICD10Codes = [
    {
        code: 'Z00.0',
        shortDescription: 'General adult medical examination',
        fullDescription: 'General adult medical examination',
        category: 'Z00-Z99',
        chapterTitle: 'Factors influencing health status and contact with health services',
        searchTerms: ['examination', 'checkup', 'routine'],
        clinicalInfo: {
            symptoms: ['routine check'],
            commonTreatments: ['examination'],
            severity: 'Unknown'
        }
    },
    {
        code: 'I10',
        shortDescription: 'Essential hypertension',
        fullDescription: 'Essential (primary) hypertension',
        category: 'I00-I99',
        chapterTitle: 'Diseases of the circulatory system',
        searchTerms: ['hypertension', 'high blood pressure'],
        clinicalInfo: {
            symptoms: ['high blood pressure'],
            commonTreatments: ['ACE inhibitors', 'lifestyle changes'],
            severity: 'Moderate'
        }
    },
    {
        code: 'E11.9',
        shortDescription: 'Type 2 diabetes mellitus without complications',
        fullDescription: 'Type 2 diabetes mellitus without complications',
        category: 'E00-E89',
        chapterTitle: 'Endocrine, nutritional and metabolic diseases',
        searchTerms: ['diabetes', 'type 2', 'mellitus'],
        clinicalInfo: {
            symptoms: ['hyperglycemia', 'polyuria', 'polydipsia'],
            commonTreatments: ['metformin', 'insulin', 'diet control'],
            severity: 'Moderate'
        }
    },
    {
        code: 'J06.9',
        shortDescription: 'Acute upper respiratory infection, unspecified',
        fullDescription: 'Acute upper respiratory infection, unspecified',
        category: 'J00-J99',
        chapterTitle: 'Diseases of the respiratory system',
        searchTerms: ['cold', 'uri', 'respiratory infection'],
        clinicalInfo: {
            symptoms: ['cough', 'runny nose', 'sore throat'],
            commonTreatments: ['rest', 'fluids', 'symptomatic treatment'],
            severity: 'Mild'
        }
    },
    {
        code: 'K59.0',
        shortDescription: 'Constipation',
        fullDescription: 'Constipation',
        category: 'K00-K95',
        chapterTitle: 'Diseases of the digestive system',
        searchTerms: ['constipation', 'bowel', 'digestive'],
        clinicalInfo: {
            symptoms: ['difficulty defecating', 'hard stools'],
            commonTreatments: ['fiber', 'laxatives', 'hydration'],
            severity: 'Mild'
        }
    },
    {
        code: 'R50.9',
        shortDescription: 'Fever, unspecified',
        fullDescription: 'Fever, unspecified',
        category: 'R00-R99',
        chapterTitle: 'Symptoms, signs and abnormal clinical and laboratory findings',
        searchTerms: ['fever', 'pyrexia', 'temperature'],
        clinicalInfo: {
            symptoms: ['elevated temperature', 'chills'],
            commonTreatments: ['antipyretics', 'rest', 'fluids'],
            severity: 'Mild'
        }
    },
    {
        code: 'F32.9',
        shortDescription: 'Major depressive disorder, single episode, unspecified',
        fullDescription: 'Major depressive disorder, single episode, unspecified',
        category: 'F01-F99',
        chapterTitle: 'Mental, Behavioral and Neurodevelopmental disorders',
        searchTerms: ['depression', 'mood disorder', 'depressive'],
        clinicalInfo: {
            symptoms: ['sadness', 'hopelessness', 'loss of interest'],
            commonTreatments: ['antidepressants', 'therapy', 'counseling'],
            severity: 'Moderate'
        }
    },
    {
        code: 'M79.3',
        shortDescription: 'Panniculitis, unspecified',
        fullDescription: 'Panniculitis, unspecified',
        category: 'M00-M99',
        chapterTitle: 'Diseases of the musculoskeletal system and connective tissue',
        searchTerms: ['panniculitis', 'inflammation', 'subcutaneous'],
        clinicalInfo: {
            symptoms: ['subcutaneous nodules', 'inflammation'],
            commonTreatments: ['anti-inflammatory drugs', 'steroids'],
            severity: 'Moderate'
        }
    },
    {
        code: 'N39.0',
        shortDescription: 'Urinary tract infection, site not specified',
        fullDescription: 'Urinary tract infection, site not specified',
        category: 'N00-N99',
        chapterTitle: 'Diseases of the genitourinary system',
        searchTerms: ['uti', 'urinary infection', 'bladder'],
        clinicalInfo: {
            symptoms: ['dysuria', 'frequency', 'urgency'],
            commonTreatments: ['antibiotics', 'fluids', 'cranberry'],
            severity: 'Mild'
        }
    },
    {
        code: 'S72.001A',
        shortDescription: 'Fracture of unspecified part of neck of right femur, initial encounter',
        fullDescription: 'Fracture of unspecified part of neck of right femur, initial encounter for closed fracture',
        category: 'S00-T88',
        chapterTitle: 'Injury, poisoning and certain other consequences of external causes',
        searchTerms: ['fracture', 'femur', 'hip', 'bone break'],
        clinicalInfo: {
            symptoms: ['pain', 'inability to walk', 'deformity'],
            commonTreatments: ['surgery', 'immobilization', 'physical therapy'],
            severity: 'Severe'
        }
    }
];

async function quickSeedICD10() {
    try {
        console.log('🏥 Quick ICD-10 Seeding...');

        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if codes already exist
        const existingCount = await ICD10.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Found ${existingCount} existing ICD-10 codes, skipping seed`);
            return;
        }

        // Insert basic codes
        await ICD10.insertMany(basicICD10Codes);
        console.log(`✅ Seeded ${basicICD10Codes.length} ICD-10 codes`);

        // Verify
        const finalCount = await ICD10.countDocuments();
        console.log(`📊 Total ICD-10 codes in database: ${finalCount}`);

        console.log('\n🎉 Quick ICD-10 seeding completed!');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run seeder
quickSeedICD10().catch(error => {
    console.error('Critical error:', error);
    process.exit(1);
});
