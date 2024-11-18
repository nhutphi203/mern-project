import express from "express";
import { getAllMessages, sendMessage } from "../controller/messageController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

//sending message
router.post("/send",sendMessage);
router.get("/getall",isAdminAuthenticated,getAllMessages)

export default router;