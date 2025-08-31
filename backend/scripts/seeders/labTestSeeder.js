import mongoose from 'mongoose';
import { LabTest } from '../../models/labTest.model.js';
const sampleLabTests = [
    // Hematology Tests
    {
        testCode: "CBC001",
        testName: "Complete Blood Count (CBC)",
        category: "Hematology",
        department: "Laboratory",
        normalRange: {
            textRange: "WBC: 4.5-11.0 x10³/µL, RBC: 4.0-5.2 x10⁶/µL, Hemoglobin: 12-16 g/dL",
            gender: "All"
        },
        price: 25.00,
        turnaroundTime: 2,
        specimen: "Blood",
        instructions: "Fasting not required. EDTA tube preferred.",
        isActive: true
    },
    {
        testCode: "ESR001",
        testName: "Erythrocyte Sedimentation Rate (ESR)",
        category: "Hematology",
        normalRange: {
            textRange: "Male: 0-15 mm/hr, Female: 0-20 mm/hr",
            gender: "All"
        },
        price: 15.00,
        turnaroundTime: 1,
        specimen: "Blood",
        isActive: true
    },

    // Chemistry Tests
    {
        testCode: "GLU001",
        testName: "Fasting Blood Glucose",
        category: "Chemistry",
        normalRange: {
            min: 70,
            max: 100,
            unit: "mg/dL",
            gender: "All"
        },
        price: 12.00,
        turnaroundTime: 1,
        specimen: "Blood",
        instructions: "Patient must fast for 8-12 hours before test.",
        isActive: true
    },
    {
        testCode: "HBA1C001",
        testName: "Hemoglobin A1c (HbA1c)",
        category: "Chemistry",
        normalRange: {
            textRange: "Normal: <5.7%, Prediabetes: 5.7-6.4%, Diabetes: ≥6.5%",
            gender: "All"
        },
        price: 35.00,
        turnaroundTime: 4,
        specimen: "Blood",
        instructions: "No fasting required.",
        isActive: true
    },
    {
        testCode: "LIPID001",
        testName: "Lipid Panel",
        category: "Chemistry",
        normalRange: {
            textRange: "Total Cholesterol: <200 mg/dL, LDL: <100 mg/dL, HDL: >40 mg/dL (M), >50 mg/dL (F)",
            gender: "All"
        },
        price: 28.00,
        turnaroundTime: 2,
        specimen: "Blood",
        instructions: "Patient must fast for 9-12 hours.",
        isActive: true
    },
    {
        testCode: "LIVER001",
        testName: "Liver Function Panel",
        category: "Chemistry",
        normalRange: {
            textRange: "ALT: 7-40 U/L, AST: 10-40 U/L, Bilirubin: 0.2-1.2 mg/dL",
            gender: "All"
        },
        price: 32.00,
        turnaroundTime: 3,
        specimen: "Blood",
        isActive: true
    },

    // Microbiology Tests
    {
        testCode: "URINE001",
        testName: "Urine Culture & Sensitivity",
        category: "Microbiology",
        normalRange: {
            textRange: "No growth or <10,000 CFU/mL",
            gender: "All"
        },
        price: 22.00,
        turnaroundTime: 48,
        specimen: "Urine",
        instructions: "Mid-stream clean catch urine sample required.",
        isActive: true
    },
    {
        testCode: "BLOOD001",
        testName: "Blood Culture",
        category: "Microbiology",
        normalRange: {
            textRange: "No growth",
            gender: "All"
        },
        price: 45.00,
        turnaroundTime: 72,
        specimen: "Blood",
        instructions: "Collect before antibiotic administration if possible.",
        isActive: true
    },

    // Immunology Tests
    {
        testCode: "TSH001",
        testName: "Thyroid Stimulating Hormone (TSH)",
        category: "Immunology",
        normalRange: {
            min: 0.4,
            max: 4.0,
            unit: "mIU/L",
            gender: "All"
        },
        price: 18.00,
        turnaroundTime: 6,
        specimen: "Blood",
        instructions: "No special preparation required.",
        isActive: true
    },
    {
        testCode: "PSA001",
        testName: "Prostate Specific Antigen (PSA)",
        category: "Immunology",
        normalRange: {
            textRange: "<4.0 ng/mL",
            gender: "Male"
        },
        price: 25.00,
        turnaroundTime: 4,
        specimen: "Blood",
        instructions: "Avoid ejaculation 48 hours before test.",
        isActive: true
    },

    // Pathology Tests
    {
        testCode: "PAP001",
        testName: "Pap Smear",
        category: "Pathology",
        normalRange: {
            textRange: "Normal cytology",
            gender: "Female"
        },
        price: 65.00,
        turnaroundTime: 72,
        specimen: "Other",
        instructions: "Avoid douching, tampons, or intercourse 24 hours before test.",
        isActive: true
    },
    {
        testCode: "BIOPSY001",
        testName: "Tissue Biopsy",
        category: "Pathology",
        normalRange: {
            textRange: "No malignant cells identified",
            gender: "All"
        },
        price: 150.00,
        turnaroundTime: 120,
        specimen: "Other",
        instructions: "Tissue sample submitted in formalin.",
        isActive: true
    },

    // Radiology Tests
    {
        testCode: "XRAY001",
        testName: "Chest X-Ray",
        category: "Radiology",
        normalRange: {
            textRange: "Normal chest radiograph",
            gender: "All"
        },
        price: 45.00,
        turnaroundTime: 2,
        specimen: "Other",
        instructions: "Remove jewelry and metal objects from chest area.",
        isActive: true
    },
    {
        testCode: "CT001",
        testName: "CT Scan - Abdomen",
        category: "Radiology",
        normalRange: {
            textRange: "No acute abnormalities",
            gender: "All"
        },
        price: 350.00,
        turnaroundTime: 4,
        specimen: "Other",
        instructions: "NPO 4 hours before exam. Contrast may be required.",
        isActive: true
    }
];

export const seedLabTests = async () => {
    try {
        await LabTest.deleteMany({}); // Clear existing data
        await LabTest.insertMany(sampleLabTests);
        console.log('✅ Lab tests seeded successfully');
        return true;
    } catch (error) {
        console.error('❌ Error seeding lab tests:', error);
        return false;
    }
};