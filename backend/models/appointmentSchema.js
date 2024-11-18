import mongoose from 'mongoose';
import validator from 'validator';


const appointmentSchema  = new mongoose.Schema({
    firstName:{
        type:String,
        required: true,
        minLength: [3, "First name must contain at least 3 characters"]
    },
    lastName:{
        type:String,
        required: true,
        minLength: [3, "Last name must contain at least 3 characters"]
    },
    email:{
        type: String,
        required: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    phone:{
        type:String,
        required: true,
        minLength: [10, "phone number must contain 10"],
        maxLength: [10, "phone number must contain 10"]
    },
    nic:{
        type:String,
        required: true,
        minLength: [12, "nic must contain 12"],
        maxLength: [12, "nic must contain 12"]  
    },
    dob:{
        type: Date,
        required: [true,"DOB is required!"],
    },
    gender:{
        type: String,
        required: true,
        enum: ["Male","Female"],
    },
    password:{
        type: String,
        minLength: [8, "password must contain at least 8 characters!"],
        required: true,
        select: false,
    },
    role:{
        type: String,
        required: true,
        enum: ["Admin","Patient","Doctor"],
    },
    doctorDepartment:{
        type: String,

    },
    docAvatar:{
        public_id: String,
        url: String,
    }


});