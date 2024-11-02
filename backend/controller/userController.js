import { catchAsyncErrors} from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import {User} from "../models/userScheme.js"; 
import {generateToken} from "../utils/jwtToken.js"

export const patientRegister= catchAsyncErrors(async(req,res,next) => {
    const{firstName,lastName,email,phone,password,gender,dob,nic,role} = req.body;
    if (!firstName||!lastName||!email||!phone||!password||!gender||!dob||!nic||!role) {
        return next(new ErrorHandler("please fill full form!", 400));   
    }
    let user= await User.findOne({email});
    if(user){
        return next(new ErrorHandler("user already registered",400))
    }
    //creating model with help userSchema
    user = await User.create({
        firstName,lastName,email,phone,password,gender,dob,nic,role
    });
    //if success
    generateToken(user,"user registered",200,res);
    
  
});

export const login = catchAsyncErrors(async(req,res,next)=>{
     const { email,password ,confirmPassword,role} = req.body;
    if (!email||  !password || !confirmPassword || !role) {
        return next(new ErrorHandler("please provide all detailes",400))
    }
    if(password !== confirmPassword){
        return next(new ErrorHandler("password and confirm password don't match", 400))
    }
    const user = await User.findOne({email}).select('+password +role');
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
    generateToken(user,"user login successfully   ",200,res);

})

export const addNewAdmin = catchAsyncErrors(async(req,res,next ) => {
    const{firstName,lastName,email,phone,password,gender,dob,nic} = req.body;
    if (!firstName||!lastName||!email||!phone||!password||!gender||!dob||!nic) {
        return next(new ErrorHandler("please fill full form!", 400));   
    }
    const isRegistered = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} with this email already exists!`));
    }
    const admin = await User.create({firstName,lastName,email,phone,password,gender,dob,nic, role: "Admin"})

    res.status(200).json({ 
        success: true,
        message: "New Admin Registered!",
    })
})

export const getAllDoctors = catchAsyncErrors(async(req,res,next) => {
    const doctors = await User.find({role: "Doctor"});
    res.status(200).json({
        success: true,
        doctors,
    });
});

export const getUserDetails = catchAsyncErrors(async(req,res,next) => {
    const user =req.user;
    res.status(200).json({
        success: true,
        user,
    })
});

export const logoutAdmin = catchAsyncErrors(async(req,res,next) => {
    res.status(200).cookie("adminToken","",{
        httpOnly: true,
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "admin logged out successfully",
    })
});

export const logoutPatient = catchAsyncErrors(async(req,res,next) => {
    res.status(200).cookie("patientToken","",{
        httpOnly: true,
        expires: new Date(Date.now()),
    }).json({
        success: true,
        message: "patient logged out successfully",
    })
});

export const addNewDoctor = catchAsyncErrors((req,res,next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Doctor Avatar required!",400))
    }
    const {docAvatar} = req.files;
})

