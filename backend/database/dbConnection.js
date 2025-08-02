import mongoose from "mongoose";
//db connection

export const dbConnection = () => {
    console.log("👉 MONGO_URI:", process.env.MONGO_URI);    // 👈 thêm dòng này

    mongoose.connect(process.env.MONGO_URI, {
        dbName: "Hospital-Management-System",
    }).then(() => {
        console.log("Connected to database")
    }).catch((err) => {
        console.log(`some error occured while connecting to database: ${err}`)
    })
}