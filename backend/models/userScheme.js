import mongoose from "mongoose"
import validator from "validator"
import bcrypt from "bcrypt"

const userSchema  = new mongoose.Schema({
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
        minLength: [11, "password must contain at least 8 characters!"],
        required: true,
        select: false
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

userSchema.pre("save", async function(next){
/*.pre("save", ...): This defines a pre-save hook in Mongoose.
 It allows you to execute some code before the save operation
  occurs on the document (in this case, the user document).
   The "save" string specifies that the hook should run 
   before a document is saved to the database.*/
if(!this.isModified("password")) {
    next()    
}    
this.password = await bcrypt.hash(this.password,10)
});

export const User = mongoose.model("Message", userSchema);