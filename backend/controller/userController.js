import { catchAsyncErrors} from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"

export const patientRegister= catchAsyncErrors(async(req,res,next) => {
    const{firstName,lastName,email,phone,password,gender,dob,nic,role} = req.body;
    if (!firstName||!lastName||!email||!phone||!password||!gender||!dob||!nic||!role) {
        return next(new ErrorHandler("please fill full form!", 400));
        
        
    }
})