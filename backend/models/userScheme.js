// backend/models/userScheme.js
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
        validate: [validator.isEmail, "Please provide a valid email!"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required!"],
        minLength: [10, "Phone number must contain exactly 10 digits!"],
        maxLength: [10, "Phone number must contain exactly 10 digits!"]
    },
    nic: { // National ID Card
        type: String,
        required: [true, "NIC is required!"],
        minLength: [12, "NIC must contain exactly 12 digits!"],
        maxLength: [12, "NIC must contain exactly 12 digits!"]
    },
    dob: { // Date of Birth
        type: Date,
        required: [true, "Date of Birth is required!"],
    },
    gender: {
        type: String,
        required: [true, "Gender is required!"],
        enum: ["Male", "Female", "Other"],
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
        minLength: [8, "Password must contain at least 8 characters!"],
        select: false, // Don't send password in response
    },
    role: {
        type: String,
        required: [true, "User role is required!"],
        enum: ["Patient", "Doctor", "Admin"],
    },

    // --- Doctor specific fields ---
    doctorDepartment: {
        type: String,
    },
    docAvatar: {
        public_id: String,
        url: String,
    },
    // --- Custom fields from your request ---
    specialization: {
        type: String,
    },
    licenseNumber: {
        type: String,
    }
});

// Hashing password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Comparing password for login
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generating JWT
userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

export const User = mongoose.model("User", userSchema);
