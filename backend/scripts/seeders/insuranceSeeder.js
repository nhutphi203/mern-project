import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { InsuranceProvider } from '../../models/billing/insuranceProvider.model.js';

export const seedInsuranceProviders = async () => {
    const providers = [
        { providerCode: 'INS001', providerName: 'Provider A', isActive: true },
        { providerCode: 'INS002', providerName: 'Provider B', isActive: true },
        { providerCode: 'INS003', providerName: 'Provider C', isActive: true },
    ];

    try {
        await InsuranceProvider.deleteMany(); // xóa cũ
        await InsuranceProvider.insertMany(providers); // insert mới
        console.log('✅ Seeded insurance providers');
    } catch (err) {
        console.error('❌ Error seeding insurance providers:', err);
    }
};
// Chạy seed
seedInsuranceProviders();
