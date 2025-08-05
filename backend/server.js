// file: server.js
import mongoose from "mongoose";
import app from "./app.js";
import { config } from "dotenv";

config({ path: "./config/config.env" });

// This is the clean, correct connection logic
mongoose.connect(process.env.MONGO_URI, {
    dbName: "hospitalDB" // Make sure this matches your local DB name
})
    .then(() => {
        console.log("✅ MongoDB connected successfully to local database");
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server listening on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log(`❌ MongoDB connection error: ${err}`);
        process.exit(1);
    });