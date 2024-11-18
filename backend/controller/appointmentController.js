import {catchAsyncErrors} from '../middlewares/catchAsyncErrors.js'
import ErrorHandler from  '../middlewares/errorMiddleware.js'
import {Appointment} from '../models/appointmentSchema.js';
import {User} from '../models/userScheme.js'

export const postAppointment = catchAsyncErrors(async(req,res,next) => {
    const{
        firstName,
        lastName,
        email,
        phone,
        nic,
        dob,
        gender,
        appointment_data,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address,
    }= req.body;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !nic ||
        !dob ||
        !gender ||
        !appointment_data ||
        !department ||
        !doctor_firstName ||
        !doctor_lastName ||
        !hasVisited ||
        !address
    ) {
        
    }
})
