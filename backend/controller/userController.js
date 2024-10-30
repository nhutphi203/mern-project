import { catchAsyncErrors} from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import {User} from "../models/userScheme.js"; 

export const patientRegister= catchAsyncErrors(async(req,res,next) => {
    const{firstName,lastName,email,phone,password,gender,dob,nic,role} = req.body;
    if (!firstName||!lastName||!email||!phone||!password||!gender||!dob||!nic||!role) {
        return next(new ErrorHandler("please fill full form!", 400));   
    }
    const user= await User.findOne({email});
    if(user){
        return next(new ErrorHandler("user already registered",400))
    }
    //creating model with help userSchema
    user = await User.create({
        firstName,lastName,email,phone,password,gender,dob,nic,role
    });
    //if success
    res.status(200).json({
        success: true,
        message: "user registered",

    })
});

export const login = catchAsyncErrors(async(req,res,next)=>{
     const { email,password ,confirmPassword,role} = req.body;
    if (!email||  !password || !confirmPassword || !role) {
        return next(new ErrorHandler("please provide all detailes",400))
    }
    if(password !== confirmPassword){
        return next(new ErrorHandler("password and confirm password don't match", 400))
    }
    const user = await User.findOne({email}).select(+password);
    if(!user){
        return next(new ErrorHandler("Invalid password or email"),400)

    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Password or Email", 400))
    }
    if (role !== user.role) {
        return next(new ErrorHandler("user with this role not found",400));
    }

})