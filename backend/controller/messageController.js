import mongoose  from "mongoose";

export const sendMessage = async(req,res,next) => {
    const {firstName,lastName,email,phone,message} = req.body;
    if(!firstName || !lastName || !email || !phone || !message){
        return res.status(400).json({
            success: false,
            message: "please fill full form"
        });
    }

}