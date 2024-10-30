 import express from 'express';
import router from './messageRouter';
import { patientRegister } from '../controller/userController.js';

 const router = express.Router();

 router.post("patient/register" ,patientRegister);

 export default router;