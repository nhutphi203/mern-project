import express from 'express';
import { postAppointment } from '../controller/appointmentController.js';
import {isAdminAuthenticated,isPatientAuthenticated} from '../middlewares/auth.js'

const router = express.Router();

router.post("/post",postAppointment)

export default router;