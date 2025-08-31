// ICD-10 Diagnosis Codes Seeder
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { ICD10 } from '../../models/icd10.model.js';

config({ path: './config/config.env' });

const icd10Codes = [
    // Infectious and parasitic diseases (A00-B99)
    {
        code: 'A09',
        shortDescription: 'Infectious gastroenteritis',
        fullDescription: 'Infectious gastroenteritis and colitis, unspecified',
        category: 'A00-B99',
        subcategory: 'Intestinal infectious diseases',
        keywords: ['gastroenteritis', 'diarrhea', 'food poisoning', 'stomach flu'],
        clinicalUse: 'Common',
        severity: 'Mild'
    },
    {
        code: 'B34.9',
        shortDescription: 'Viral infection',
        fullDescription: 'Viral infection, unspecified',
        category: 'A00-B99',
        subcategory: 'Viral infections',
        keywords: ['viral', 'infection', 'fever', 'flu-like'],
        clinicalUse: 'Common',
        severity: 'Mild'
    },

    // Neoplasms (C00-D49)
    {
        code: 'C78.7',
        shortDescription: 'Secondary malignant neoplasm of liver',
        fullDescription: 'Secondary malignant neoplasm of liver and intrahepatic bile duct',
        category: 'C00-D49',
        subcategory: 'Malignant neoplasms',
        keywords: ['cancer', 'liver', 'metastasis', 'secondary'],
        clinicalUse: 'Specialized',
        severity: 'Severe'
    },

    // Blood and immune disorders (D50-D89)
    {
        code: 'D50.9',
        shortDescription: 'Iron deficiency anemia',
        fullDescription: 'Iron deficiency anemia, unspecified',
        category: 'D50-D89',
        subcategory: 'Anemias',
        keywords: ['anemia', 'iron deficiency', 'low hemoglobin', 'fatigue'],
        clinicalUse: 'Common',
        severity: 'Moderate'
    },

    // Endocrine, nutritional and metabolic diseases (E00-E89)
    {
        code: 'E11.9',
        shortDescription: 'Type 2 diabetes mellitus',
        fullDescription: 'Type 2 diabetes mellitus without complications',
        category: 'E00-E89',
        subcategory: 'Diabetes mellitus',
        keywords: ['diabetes', 'type 2', 'blood sugar', 'glucose'],
        clinicalUse: 'Very Common',
        severity: 'Moderate'
    },
    {
        code: 'E66.9',
        shortDescription: 'Obesity',
        fullDescription: 'Obesity, unspecified',
        category: 'E00-E89',
        subcategory: 'Overweight and obesity',
        keywords: ['obesity', 'overweight', 'BMI', 'weight'],
        clinicalUse: 'Common',
        severity: 'Moderate'
    },
    {
        code: 'E78.5',
        shortDescription: 'Hyperlipidemia',
        fullDescription: 'Hyperlipidemia, unspecified',
        category: 'E00-E89',
        subcategory: 'Lipid metabolism disorders',
        keywords: ['cholesterol', 'hyperlipidemia', 'triglycerides', 'lipids'],
        clinicalUse: 'Very Common',
        severity: 'Moderate'
    },

    // Mental and behavioral disorders (F01-F99)
    {
        code: 'F32.9',
        shortDescription: 'Major depressive disorder',
        fullDescription: 'Major depressive disorder, single episode, unspecified',
        category: 'F01-F99',
        subcategory: 'Mood disorders',
        keywords: ['depression', 'depressive', 'mood', 'sadness'],
        clinicalUse: 'Common',
        severity: 'Moderate'
    },
    {
        code: 'F41.9',
        shortDescription: 'Anxiety disorder',
        fullDescription: 'Anxiety disorder, unspecified',
        category: 'F01-F99',
        subcategory: 'Anxiety disorders',
        keywords: ['anxiety', 'panic', 'worry', 'stress'],
        clinicalUse: 'Common',
        severity: 'Moderate'
    },

    // Nervous system diseases (G00-G99)
    {
        code: 'G43.9',
        shortDescription: 'Migraine',
        fullDescription: 'Migraine, unspecified',
        category: 'G00-G99',
        subcategory: 'Episodic headache disorders',
        keywords: ['migraine', 'headache', 'cephalgia'],
        clinicalUse: 'Common',
        severity: 'Moderate'
    },

    // Circulatory system diseases (I00-I99)
    {
        code: 'I10',
        shortDescription: 'Essential hypertension',
        fullDescription: 'Essential (primary) hypertension',
        category: 'I00-I99',
        subcategory: 'Hypertensive diseases',
        keywords: ['hypertension', 'high blood pressure', 'HTN'],
        clinicalUse: 'Very Common',
        severity: 'Moderate'
    },
    {
        code: 'I25.9',
        shortDescription: 'Chronic ischemic heart disease',
        fullDescription: 'Chronic ischemic heart disease, unspecified',
        category: 'I00-I99',
        subcategory: 'Ischemic heart diseases',
        keywords: ['heart disease', 'ischemic', 'coronary', 'CAD'],
        clinicalUse: 'Common',
        severity: 'Severe'
    },

    // Respiratory system diseases (J00-J99)
    {
        code: 'J06.9',
        shortDescription: 'Acute upper respiratory infection',
        fullDescription: 'Acute upper respiratory infection, unspecified',
        category: 'J00-J99',
        subcategory: 'Acute upper respiratory infections',
        keywords: ['common cold', 'URI', 'respiratory infection', 'cold'],
        clinicalUse: 'Very Common',
        severity: 'Mild'
    },
    {
        code: 'J44.1',
        shortDescription: 'COPD with exacerbation',
        fullDescription: 'Chronic obstructive pulmonary disease with acute exacerbation',
        category: 'J00-J99',
        subcategory: 'Chronic lower respiratory diseases',
        keywords: ['COPD', 'emphysema', 'chronic bronchitis', 'smoking'],
        clinicalUse: 'Common',
        severity: 'Severe'
    },

    // Digestive system diseases (K00-K95)
    {
        code: 'K21.9',
        shortDescription: 'GERD',
        fullDescription: 'Gastro-esophageal reflux disease without esophagitis',
        category: 'K00-K95',
        subcategory: 'Diseases of esophagus, stomach and duodenum',
        keywords: ['GERD', 'reflux', 'heartburn', 'acid reflux'],
        clinicalUse: 'Very Common',
        severity: 'Mild'
    },

    // Musculoskeletal system diseases (M00-M99)
    {
        code: 'M25.9',
        shortDescription: 'Joint disorder',
        fullDescription: 'Joint disorder, unspecified',
        category: 'M00-M99',
        subcategory: 'Arthropathies',
        keywords: ['joint pain', 'arthritis', 'joint disorder'],
        clinicalUse: 'Common',
        severity: 'Moderate'
    },
    {
        code: 'M54.5',
        shortDescription: 'Low back pain',
        fullDescription: 'Low back pain',
        category: 'M00-M99',
        subcategory: 'Dorsopathies',
        keywords: ['back pain', 'lower back', 'lumbar pain'],
        clinicalUse: 'Very Common',
        severity: 'Moderate'
    },

    // Symptoms and abnormal findings (R00-R99)
    {
        code: 'R50.9',
        shortDescription: 'Fever',
        fullDescription: 'Fever, unspecified',
        category: 'R00-R99',
        subcategory: 'General symptoms and signs',
        keywords: ['fever', 'pyrexia', 'high temperature'],
        clinicalUse: 'Very Common',
        severity: 'Mild'
    },
    {
        code: 'R06.02',
        shortDescription: 'Shortness of breath',
        fullDescription: 'Shortness of breath',
        category: 'R00-R99',
        subcategory: 'Symptoms involving respiratory system',
        keywords: ['dyspnea', 'shortness of breath', 'difficulty breathing'],
        clinicalUse: 'Very Common',
        severity: 'Moderate'
    },
    {
        code: 'R51',
        shortDescription: 'Headache',
        fullDescription: 'Headache',
        category: 'R00-R99',
        subcategory: 'Symptoms involving nervous system',
        keywords: ['headache', 'cephalgia', 'head pain'],
        clinicalUse: 'Very Common',
        severity: 'Mild'
    }
];

export const seedICD10Codes = async () => {
    try {
        console.log('🏥 Seeding ICD-10 Diagnosis Codes...');

        // Clear existing ICD-10 codes
        await ICD10.deleteMany({});
        console.log('   ✅ Cleared existing ICD-10 codes');

        // Insert new ICD-10 codes
        const insertedCodes = await ICD10.insertMany(icd10Codes);
        console.log(`   ✅ Inserted ${insertedCodes.length} ICD-10 codes`);

        // Display sample codes
        console.log('\n📋 Sample ICD-10 Codes:');
        insertedCodes.slice(0, 5).forEach(code => {
            console.log(`   ${code.code}: ${code.shortDescription}`);
        });

        return insertedCodes;

    } catch (error) {
        console.error('❌ Error seeding ICD-10 codes:', error);
        throw error;
    }
};

export { icd10Codes };
