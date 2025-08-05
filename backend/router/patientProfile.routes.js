// File: backend/router/patientProfile.routes.js
import express from 'express';
import {
    getPatientProfile,
    createOrUpdatePatientProfile
} from '../controller/patientProfile.controller.js';

// Import middleware xác thực của bạn. 
// Giả sử tên file là auth.js và có hàm isAdminAuthenticated
import { isAdminAuthenticated } from '../middlewares/auth.js';

const router = express.Router();


// --- SỬA LẠI ĐÚNG DÒNG NÀY ---
// Thay vì yêu cầu phải là Admin, chúng ta chỉ cần yêu cầu người dùng đã đăng nhập.
// Middleware isAdminAuthenticated sẽ kiểm tra cả token và vai trò 'Admin'.
// Chúng ta sẽ dùng một middleware chung hơn (ví dụ: isUserAuthenticated hoặc một tên khác bạn đã tạo)
// chỉ để kiểm tra token. Giả sử middleware đó tên là isPatientAuthenticated vì bạn đã có nó.
import { isPatientAuthenticated } from '../middlewares/auth.js';

// Route GET: Chỉ cần người dùng đăng nhập là được (bất kể vai trò).
// Controller sẽ xử lý phần còn lại.
router.get("/:patientId", isPatientAuthenticated, getPatientProfile);


// Route POST: Vẫn giữ nguyên, chỉ Admin/Bác sĩ mới được tạo/sửa hồ sơ.
router.post("/", isAdminAuthenticated, createOrUpdatePatientProfile);


export default router;