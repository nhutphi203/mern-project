import express from "express";
import { getAllMessages, sendMessage } from "../controller/messageController.js";
import { isAuthenticated, requireRole } from "../middlewares/auth.js";

const router = express.Router();

//sending message
router.post("/send", sendMessage);
router.get("/getall", isAuthenticated, requireRole(['Admin']), getAllMessages);

export default router;