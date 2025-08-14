import mongoose from 'mongoose';
import { InsuranceProvider } from '../models/billing/insuranceProvider.model.js';

const sampleInsuranceProviders = [
    {
        providerName: "Blue Cross Blue Shield",
        providerCode: "BCBS001",
        contactInfo: {
            phone: "1-800-555-0123",
            email: "providers@bcbs.com",
            website: "https://www.bcbs.com",
            address: {
                street: "123 Insurance Blvd",
                city: "Chicago",
                state: "IL",
                zipCode: "60601"
            }
        },
        contractDetails: {
            contractNumber: "BCBS-2024-001",
            effectiveDate: new Date('2024-01-01'),
            expirationDate: new Date('2024-12-31'),
            reimbursementRate: 85
        },
        isActive: true
    },
    {
        providerName: "Aetna Healthcare",
        providerCode: "AETNA001",
        contactInfo: {
            phone: "1-800-555-0456",
            email: "providers@aetna.com",
            website: "https://www.aetna.com",
            address: {
                street: "456 Health Ave",
                city: "Hartford",
                state: "CT",
                zipCode: "06103"
            }
        },
        contractDetails: {
            contractNumber: "AETNA-2024-001",
            effectiveDate: new Date('2024-01-01'),
            expirationDate: new Date('2024-12-31'),
            reimbursementRate: 80
        },
        isActive: true
    },
    {
        providerName: "UnitedHealthcare",
        providerCode: "UHC001",
        contactInfo: {
            phone: "1-800-555-0789",
            email: "providers@uhc.com",
            website: "https://www.uhc.com"
        },
        contractDetails: {
            contractNumber: "UHC-2024-001",
            effectiveDate: new Date('2024-01-01'),
            expirationDate: new Date('2024-12-31'),
            reimbursementRate: 82
        },
        isActive: true
    },
    {
        providerName: "Medicare",
        providerCode: "MED001",
        contactInfo: {
            phone: "1-800-MEDICARE",
            email: "providers@medicare.gov",
            website: "https://www.medicare.gov"
        },
        contractDetails: {
            contractNumber: "MED-2024-001",
            effectiveDate: new Date('2024-01-01'),
            expirationDate: new Date('2024-12-31'),
            reimbursementRate: 75
        },
        isActive: true
    }
];

export const seedInsuranceProviders = async () => {
    try {
        await InsuranceProvider.deleteMany({});
        await InsuranceProvider.insertMany(sampleInsuranceProviders);
        console.log('✅ Insurance providers seeded successfully');
        return true;
    } catch (error) {
        console.error('❌ Error seeding insurance providers:', error);
        return false;
    }
};