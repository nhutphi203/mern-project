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
        return next(new ErrorHandler("Please fill full form!",400));
    }

    const isConflict = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department
    })
    if (condition) {
        
    }
})
