import mongoose from "mongoose";
import  Mongoose  from "mongoose";

export const dbConnection = () => {
    mongoose.connect(process.env.MONGO_URI,{
        dbName: ""
    }).then(() => {
        console.log("Connected to database")
    }).catch((err) => {
        console.log(`some error occured while connecting to database: ${err}`)
    })
}