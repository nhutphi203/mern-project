// File: backend/controller/patientProfile.controller.js

// --- SỬA LẠI 2 DÒNG IMPORT NÀY ---
// Model cho hồ sơ, giả sử bạn đã tạo file này
import PatientProfile from '../models/patientProfile.model.js';
// Model cho người dùng, gọi đúng tên file "userScheme.js"
import { User } from '../models/userScheme.js'; // SỬA TẠI ĐÂY

// Import các hàm tiện ích
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";


export const getPatientProfile = catchAsyncErrors(async (req, res, next) => {
    const patientIdToFind = req.params.patientId;
    console.log(`[Controller] 🕵️‍♂️ Searching for profile with patient ID: ${patientIdToFind}`);

    const profile = await PatientProfile.findOne({ patient: patientIdToFind });
    console.log("[Controller] 📄 Query Result:", profile);

    if (!profile) {
        console.log("[Controller] ❌ Profile not found in database.");
        return next(new ErrorHandler("Patient profile not found", 404));
    }

    // Populate dữ liệu
    await profile.populate('patient', 'firstName lastName email');

    console.log("[Controller] ✅ Profile found and populated. Sending to frontend.");
    res.status(200).json({ success: true, profile });
});


export const createOrUpdatePatientProfile = catchAsyncErrors(async (req, res, next) => {
    const { patientId, bloodType, allergies } = req.body;

    const patientExists = await User.findById(patientId);
    if (!patientExists || patientExists.role !== 'Patient') {
        return next(new ErrorHandler("Patient not found", 404));
    }

    let profile = await PatientProfile.findOne({ patient: patientId });

    if (profile) {
        profile.bloodType = bloodType ?? profile.bloodType;
        profile.allergies = allergies ?? profile.allergies;
        const updatedProfile = await profile.save();
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: updatedProfile
        });
    } else {
        const newProfile = await PatientProfile.create({
            patient: patientId,
            bloodType,
            allergies,
        });
        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            profile: newProfile
        });
    }
});