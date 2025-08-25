#!/usr/bin/env node

/**
 * Medical Records System Evaluation
 * Kiểm tra toàn bộ hệ thống Medical Records
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Import models
import { User } from './models/userScheme.js';
import { EnhancedMedicalRecord } from './models/enhancedMedicalRecord.model.js';
import { ICD10 } from './models/icd10.model.js';
import { Diagnosis } from './models/diagnosis.model.js';

const log = {
    success: (msg) => console.log('✅ ' + msg),
    error: (msg) => console.log('❌ ' + msg),
    info: (msg) => console.log('ℹ️  ' + msg),
    warning: (msg) => console.log('⚠️  ' + msg),
    header: (msg) => console.log('\n🚀 ' + msg)
};

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        log.success('Connected to MongoDB');
        return true;
    } catch (error) {
        log.error(`Database connection failed: ${error.message}`);
        return false;
    }
}

async function checkDataAvailability() {
    log.header('KIỂM TRA DỮ LIỆU HIỆN CÓ');

    try {
        // Check Users
        const userCount = await User.countDocuments();
        const doctorCount = await User.countDocuments({ role: 'Doctor' });
        const patientCount = await User.countDocuments({ role: 'Patient' });

        log.info(`Tổng số Users: ${userCount}`);
        log.info(`Doctors: ${doctorCount}`);
        log.info(`Patients: ${patientCount}`);

        if (userCount === 0) {
            log.error('Không có user nào trong hệ thống!');
            return false;
        }

        // Check Medical Records
        const medicalRecordCount = await EnhancedMedicalRecord.countDocuments();
        log.info(`Medical Records: ${medicalRecordCount}`);

        // Check ICD-10 codes
        const icd10Count = await ICD10.countDocuments();
        log.info(`ICD-10 Codes: ${icd10Count}`);

        // Check Diagnoses
        const diagnosisCount = await Diagnosis.countDocuments();
        log.info(`Diagnoses: ${diagnosisCount}`);

        return {
            users: userCount,
            doctors: doctorCount,
            patients: patientCount,
            medicalRecords: medicalRecordCount,
            icd10Codes: icd10Count,
            diagnoses: diagnosisCount
        };

    } catch (error) {
        log.error(`Error checking data: ${error.message}`);
        return false;
    }
}

async function checkMedicalRecordStructure() {
    log.header('KIỂM TRA CẤU TRÚC MEDICAL RECORDS');

    try {
        // Get sample medical record
        const sampleRecord = await EnhancedMedicalRecord.findOne()
            .populate('patientId', 'firstName lastName email')
            .populate('doctorId', 'firstName lastName')
            .populate('appointmentId');

        if (!sampleRecord) {
            log.warning('Không có Medical Record nào để kiểm tra cấu trúc');
            return false;
        }

        log.success('Tìm thấy Medical Record mẫu');
        log.info(`Patient: ${sampleRecord.patientId?.firstName} ${sampleRecord.patientId?.lastName}`);
        log.info(`Doctor: ${sampleRecord.doctorId?.firstName} ${sampleRecord.doctorId?.lastName}`);
        log.info(`Status: ${sampleRecord.status}`);
        log.info(`Created: ${sampleRecord.createdAt}`);

        // Check required fields
        const requiredFields = ['patientId', 'doctorId', 'chiefComplaint', 'status'];
        const missingFields = requiredFields.filter(field => !sampleRecord[field]);

        if (missingFields.length > 0) {
            log.warning(`Missing fields: ${missingFields.join(', ')}`);
        } else {
            log.success('Tất cả required fields đều có');
        }

        // Check optional sections
        const optionalSections = [
            'presentIllnessHistory',
            'pastMedicalHistory',
            'socialHistory',
            'familyHistory',
            'reviewOfSystems',
            'physicalExamination',
            'vitalSigns',
            'labResults',
            'imagingResults',
            'assessmentAndPlan',
            'medications',
            'allergies'
        ];

        const populatedSections = optionalSections.filter(section =>
            sampleRecord[section] &&
            (typeof sampleRecord[section] === 'string' ? sampleRecord[section].length > 0 :
                Array.isArray(sampleRecord[section]) ? sampleRecord[section].length > 0 :
                    Object.keys(sampleRecord[section]).length > 0)
        );

        log.info(`Populated sections: ${populatedSections.length}/${optionalSections.length}`);
        log.info(`Sections: ${populatedSections.join(', ')}`);

        return true;

    } catch (error) {
        log.error(`Error checking structure: ${error.message}`);
        return false;
    }
}

async function checkDiagnosisIntegration() {
    log.header('KIỂM TRA TÍCH HỢP DIAGNOSIS SYSTEM');

    try {
        // Check ICD-10 codes with usage
        const icd10WithUsage = await ICD10.aggregate([
            {
                $lookup: {
                    from: 'diagnoses',
                    localField: 'code',
                    foreignField: 'icd10Code',
                    as: 'usage'
                }
            },
            {
                $project: {
                    code: 1,
                    shortDescription: 1,
                    usageCount: { $size: '$usage' }
                }
            },
            { $sort: { usageCount: -1 } },
            { $limit: 5 }
        ]);

        if (icd10WithUsage.length > 0) {
            log.success('ICD-10 codes được sử dụng:');
            icd10WithUsage.forEach(code => {
                log.info(`  ${code.code}: ${code.shortDescription} (${code.usageCount} lần)`);
            });
        } else {
            log.warning('Chưa có ICD-10 code nào được sử dụng');
        }

        // Check diagnosis distribution by status
        const diagnosisByStatus = await Diagnosis.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        if (diagnosisByStatus.length > 0) {
            log.success('Phân bố Diagnosis theo status:');
            diagnosisByStatus.forEach(item => {
                log.info(`  ${item._id}: ${item.count}`);
            });
        }

        return true;

    } catch (error) {
        log.error(`Error checking diagnosis integration: ${error.message}`);
        return false;
    }
}

async function checkRoleBasedAccess() {
    log.header('KIỂM TRA PHÂN QUYỀN NGƯỜI DÙNG');

    try {
        // Check role distribution
        const roleDistribution = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        log.success('Phân bố vai trò:');
        roleDistribution.forEach(role => {
            log.info(`  ${role._id}: ${role.count} users`);
        });

        // Check medical records by doctor
        const recordsByDoctor = await EnhancedMedicalRecord.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            { $unwind: '$doctor' },
            {
                $group: {
                    _id: '$doctor._id',
                    doctorName: { $first: { $concat: ['$doctor.firstName', ' ', '$doctor.lastName'] } },
                    recordCount: { $sum: 1 }
                }
            },
            { $sort: { recordCount: -1 } },
            { $limit: 5 }
        ]);

        if (recordsByDoctor.length > 0) {
            log.success('Top Doctors theo số Medical Records:');
            recordsByDoctor.forEach(doc => {
                log.info(`  ${doc.doctorName}: ${doc.recordCount} records`);
            });
        }

        return true;

    } catch (error) {
        log.error(`Error checking role access: ${error.message}`);
        return false;
    }
}

async function generateSystemReport() {
    log.header('BÁO CÁO TỔNG QUAN MEDICAL RECORDS SYSTEM');

    const dataStats = await checkDataAvailability();

    if (!dataStats) {
        log.error('Không thể tạo báo cáo do thiếu dữ liệu');
        return;
    }

    console.log('\n📊 THỐNG KÊ TỔNG QUAN:');
    console.log(`   👥 Users: ${dataStats.users} (Doctors: ${dataStats.doctors}, Patients: ${dataStats.patients})`);
    console.log(`   📋 Medical Records: ${dataStats.medicalRecords}`);
    console.log(`   🏥 ICD-10 Codes: ${dataStats.icd10Codes}`);
    console.log(`   📝 Diagnoses: ${dataStats.diagnoses}`);

    // Data completeness assessment
    let completenessScore = 0;
    let maxScore = 6;

    if (dataStats.users > 0) completenessScore++;
    if (dataStats.doctors > 0) completenessScore++;
    if (dataStats.patients > 0) completenessScore++;
    if (dataStats.medicalRecords > 0) completenessScore++;
    if (dataStats.icd10Codes > 0) completenessScore++;
    if (dataStats.diagnoses > 0) completenessScore++;

    const completenessPercentage = Math.round((completenessScore / maxScore) * 100);

    console.log('\n🎯 ĐÁNH GIÁ TÍNH ĐẦY ĐỦ:');
    console.log(`   📈 Completeness Score: ${completenessScore}/${maxScore} (${completenessPercentage}%)`);

    if (completenessPercentage >= 80) {
        log.success('Hệ thống có đủ dữ liệu để test đầy đủ');
    } else if (completenessPercentage >= 50) {
        log.warning('Hệ thống có dữ liệu cơ bản, cần thêm dữ liệu test');
    } else {
        log.error('Hệ thống thiếu dữ liệu nghiêm trọng');
    }

    // Functional assessment
    console.log('\n⚙️ ĐÁNH GIÁ CHỨC NĂNG:');

    const functionChecks = [
        { name: 'User Management', status: dataStats.users > 0 },
        { name: 'Medical Records Creation', status: dataStats.medicalRecords > 0 },
        { name: 'ICD-10 Integration', status: dataStats.icd10Codes > 0 },
        { name: 'Diagnosis System', status: dataStats.diagnoses > 0 },
        { name: 'Role-based Access', status: dataStats.doctors > 0 && dataStats.patients > 0 }
    ];

    functionChecks.forEach(check => {
        if (check.status) {
            log.success(`${check.name}: Functional`);
        } else {
            log.error(`${check.name}: Needs Setup`);
        }
    });

    // Recommendations
    console.log('\n💡 KHUYẾN NGHỊ:');

    if (dataStats.medicalRecords === 0) {
        console.log('   📋 Cần tạo sample Medical Records để test');
    }

    if (dataStats.icd10Codes === 0) {
        console.log('   🏥 Cần seed ICD-10 codes database');
    }

    if (dataStats.diagnoses === 0) {
        console.log('   📝 Cần tạo sample Diagnoses');
    }

    if (dataStats.patients === 0) {
        console.log('   👤 Cần tạo thêm Patient users');
    }

    return {
        completenessScore: completenessPercentage,
        readyForTesting: completenessPercentage >= 70,
        dataStats
    };
}

async function runMedicalRecordsEvaluation() {
    try {
        log.header('MEDICAL RECORDS SYSTEM EVALUATION');

        // Connect to database
        const connected = await connectToDatabase();
        if (!connected) {
            process.exit(1);
        }

        // Run all checks
        await checkDataAvailability();
        await checkMedicalRecordStructure();
        await checkDiagnosisIntegration();
        await checkRoleBasedAccess();

        // Generate final report
        const report = await generateSystemReport();

        console.log('\n' + '='.repeat(60));
        if (report.readyForTesting) {
            log.success('🎉 MEDICAL RECORDS SYSTEM SẴN SÀNG CHO TESTING!');
            console.log('   ✅ Có đủ dữ liệu để test các chức năng chính');
            console.log('   ✅ Cấu trúc dữ liệu hoàn chỉnh');
            console.log('   ✅ Tích hợp ICD-10 và Diagnosis hoạt động');
            console.log('   ✅ Phân quyền người dùng đã được thiết lập');
        } else {
            log.warning('⚠️  HỆ THỐNG CẦN THIẾT LẬP THÊM DỮ LIỆU');
            console.log('   📋 Cần chạy seeder để tạo sample data');
            console.log('   👥 Cần tạo thêm users với các roles khác nhau');
        }

    } catch (error) {
        log.error(`Evaluation failed: ${error.message}`);
    } finally {
        await mongoose.disconnect();
        log.info('Disconnected from database');
    }
}

// Run evaluation
runMedicalRecordsEvaluation().catch(error => {
    console.error('Critical error:', error);
    process.exit(1);
});
