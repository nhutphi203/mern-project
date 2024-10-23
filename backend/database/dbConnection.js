import mongoose from "mongoose";
import  Mongoose  from "mongoose";

export const dbConnection = () => {
    mongoose.connect(process.env.MONGO_URI,{
        dbName: ""
    })
}