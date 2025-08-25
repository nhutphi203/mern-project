import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required!"],
        minLength: [3, "First name must contain at least 3 characters!"]
    },
    lastName: {
        type: String,
        required: [true, "Last name is required!"],
        minLength: [3, "Last name must contain at least 3 characters!"]
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        validate: [validator.isEmail, "Please provide a valid email!"],
        unique: true
    },
    phone: {
        type: String,
        required: function () { return this.role === 'Patient' && this.authType === 'traditional'; },
        minLength: [10, "Phone number must contain exactly 10 digits!"],
        maxLength: [10, "Phone number must contain exactly 10 digits!"]
    },
    nic: {
        type: String,
        required: function () { return this.role === 'Patient' && this.authType === 'traditional'; },
        minLength: [12, "NIC must contain exactly 12 digits!"],
        maxLength: [12, "NIC must contain exactly 12 digits!"]
    },
    dob: {
        type: Date,
        required: function () { return this.authType === 'traditional'; },
    },
    gender: {
        type: String,
        required: function () { return this.authType === 'traditional'; },
        enum: ["Male", "Female", "Other"],
    },
    password: {
        type: String,
        required: function () { return this.authType === 'traditional'; },
        minLength: [8, "Password must contain at least 8 characters!"],
        select: false,
    },
    role: {
        type: String,
        enum: [
            'Patient', 'Doctor', 'Admin', // Existing roles
            'Receptionist', 'Technician', 'BillingStaff',
            'LabTechnician', 'LabSupervisor', 'Pharmacist', 'Nurse'
            // New roles for comprehensive hospital management
        ],
        required: true,
        default: 'Patient'
    }
    // --- ENHANCED FIELDS FOR VERIFICATION & SOCIAL LOGIN ---
    ,
    // Traditional authentication fields
    isVerified: {
        type: Boolean,
        default: false
    },

    // OTP fields
    otpCode: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
    },
    otpMethod: {
        type: String,
        enum: ['email', 'sms'],
        select: false
    },

    // Social login fields
    authType: {
        type: String,
        enum: ['traditional', 'google', 'facebook', 'github', 'gmail'],
        default: 'traditional'
    },
    providerId: {
        type: String,
        sparse: true // Allows multiple null values but unique non-null values
    },
    avatar: {
        type: String, // For social login avatars
    },

    // Doctor specific fields (unchanged)
    doctorDepartment: { type: String },
    docAvatar: {
        public_id: String,
        url: String,
    },
    specialization: { type: String },
    licenseNumber: { type: String }
});

// Compound index for social login uniqueness
userSchema.index({ providerId: 1, authType: 1 }, {
    unique: true,
    partialFilterExpression: {
        providerId: { $exists: true },
        authType: { $in: ['google', 'facebook', 'github', 'gmail'] }
    }
});

// Hash password before saving (only for traditional auth)
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || this.authType !== 'traditional') {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method (only for traditional auth)
userSchema.methods.comparePassword = async function (enteredPassword) {
    if (this.authType !== 'traditional') {
        throw new Error('Password comparison not available for social login users');
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign(
        {
            id: this._id,
            role: this.role,
            authType: this.authType,
            isVerified: this.isVerified
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES }
    );
};

// Generate OTP
userSchema.methods.generateOTP = function (method = 'email') {
    const otp = crypto.randomInt(100000, 999999).toString();
    this.otpCode = crypto.createHash('sha256').update(otp).digest('hex');
    this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    this.otpMethod = method;
    return otp; // Return plain OTP for sending
};

// Verify OTP
userSchema.methods.verifyOTP = function (otp) {
    if (!this.otpCode || !this.otpExpires) {
        return false;
    }

    if (this.otpExpires < new Date()) {
        return false; // OTP expired
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    return hashedOTP === this.otpCode;
};

// Clear OTP data
userSchema.methods.clearOTP = function () {
    this.otpCode = undefined;
    this.otpExpires = undefined;
    this.otpMethod = undefined;
};

export const User = mongoose.model("User", userSchema);