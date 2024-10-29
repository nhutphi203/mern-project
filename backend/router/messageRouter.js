import express from "express";
import { sendMessage } from "../controller/messageController.js";

const router = express.Router();

//sending message
router.post("/send",sendMessage);

export default router;