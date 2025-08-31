// backend/models/appointmentSchema.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required!"],
    // THE FIX IS HERE: Change 3 to 2
    minLength: [2, "First name must contain at least 2 characters!"]
  },
  lastName: {
    type: String,
    required: [true, "Last name is required!"],
    // AND ALSO HERE: Change 3 to 2
    minLength: [2, "Last name must contain at least 2 characters!"]
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required!"],
    minLength: [10, "Phone number must contain exactly 10 digits!"],
    maxLength: [10, "Phone number must contain exactly 10 digits!"]
  },
  nic: {
    type: String,
    required: [true, "NIC is required!"],
    minLength: [12, "NIC must contain exactly 12 digits!"],
    maxLength: [12, "NIC must contain exactly 12 digits!"]
  },
  dob: {
    type: Date,
    required: [true, "Date of Birth is required!"],
  },
  gender: {
    type: String,
    required: [true, "Gender is required!"],
    enum: ["Male", "Female", "Other"],
  },
  appointment_date: {
    type: String, // Hoặc Date nếu muốn xử lý Date object
    required: [true, "Appointment date is required!"],
  },
  department: {
    type: String,
    required: [true, "Department name is required!"],
  },
  doctor: {
    firstName: {
      type: String,
      required: [true, "Doctor first name is required!"],
    },
    lastName: {
      type: String,
      required: [true, "Doctor last name is required!"],
    }
  },
  hasVisited: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: [true, "Address is required!"],
  },
  doctorId: {
    type: mongoose.Schema.ObjectId,
    ref: "User", // Tham chiếu đến User collection
    required: [true, "Doctor ID is required!"],
  },
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: "User", // Tham chiếu đến User collection
    required: [true, "Patient ID is required!"],
  },
  status: {
    type: String,
    // --- Thay đổi dòng này ---
    enum: ["Pending", "Accepted", "Rejected", "Completed", "Cancelled", "Checked-in"],
    default: "Pending",
  },
}, { timestamps: true });

export const Appointment = mongoose.model("Appointment", appointmentSchema);