import express from 'express';
import { login, register, addNewAdmin, getAllDoctors, getUserDetails, logout, addNewDoctor } from '../controller/userController.js';
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js"

const router = express.Router();

router.post("/register", register); // Thêm dòng này
router.post("/login", login);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.get("/doctors", getAllDoctors);
router.get("/me", isPatientAuthenticated, getUserDetails);
router.get("/logout", isPatientAuthenticated, logout);

router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

export default router;