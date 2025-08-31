// File: controllers/serviceCatalogController.js

import { ServiceCatalog } from '../models/serviceCatalog.model.js';
import Joi from 'joi';

// Schema validation cho dữ liệu đầu vào
const serviceValidationSchema = Joi.object({
    serviceId: Joi.string().uppercase().trim().required(),
    name: Joi.string().trim().required(),
    description: Joi.string().trim().optional().allow(''), // Cho phép mô tả trống
    imageUrl: Joi.string().uri().optional().allow(''), // Cho phép URL trống
    department: Joi.string().valid('Laboratory', 'Radiology', 'Consultation', 'Pharmacy', 'Other').required(),
    price: Joi.number().min(0).required(),
    isActive: Joi.boolean().optional()
});

export const serviceCatalogController = {
    /**
     * @desc Tạo mới một dịch vụ
     * @route POST /api/v1/services
     * @access Admin
     */
    create: async (req, res, next) => {
        try {
            const { error, value } = serviceValidationSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ success: false, message: 'Validation Error', errors: error.details });
            }

            const newService = await ServiceCatalog.create(value);
            // logger.info(`Service created: ${newService._id} by ${req.user.email}`);
            res.status(201).json({ success: true, data: newService, message: "Service created successfully" });
        } catch (error) {
            if (error.code === 11000) { // Lỗi trùng lặp `serviceId`
                return res.status(409).json({ success: false, message: "Conflict: Service ID already exists." });
            }
            next(error);
        }
    },

    /**
     * @desc Lấy danh sách dịch vụ để hiển thị cho người dùng
     * @route GET /api/v1/services
     * @access Public/All Users
     */
    list: async (req, res, next) => {
        try {
            const { department, isActive = true } = req.query;
            const filter = { isActive };
            if (department) {
                filter.department = department;
            }

            const servicesFromDb = await ServiceCatalog.find(filter);

            // --- SỬA LOGIC TRANSFORM Ở ĐÂY ---
            const servicesForFrontend = servicesFromDb.map(service => ({
                id: service._id, // Giữ nguyên
                // Thay vì `title`, trả về `name`
                name: service.name,
                // Thay vì `text`, trả về `description`
                description: service.description || 'Chưa có mô tả chi tiết.',
                // Thay vì `img`, trả về `imageUrl`
                imageUrl: service.imageUrl || 'https://via.placeholder.com/400x300.png?text=Service',
            }));
            // --- KẾT THÚC THAY ĐỔI ---

            res.status(200).json({ success: true, data: servicesForFrontend });
        } catch (error) {
            next(error);
        }
    },

    /**
     * @desc Lấy chi tiết một dịch vụ bằng ID
     * @route GET /api/v1/services/:id
     * @access Authenticated Users
     */
    getById: async (req, res, next) => {
        try {
            const service = await ServiceCatalog.findById(req.params.id);
            if (!service) {
                return res.status(404).json({ success: false, message: "Service not found" });
            }
            res.status(200).json({ success: true, data: service });
        } catch (error) {
            next(error);
        }
    },

    /**
     * @desc Cập nhật một dịch vụ
     * @route PUT /api/v1/services/:id
     * @access Admin
     */
    update: async (req, res, next) => {
        try {
            // Cho phép cập nhật một phần, không yêu cầu tất cả các trường
            const { error, value } = serviceValidationSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ success: false, message: 'Validation Error', errors: error.details });
            }

            const updatedService = await ServiceCatalog.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
            if (!updatedService) {
                return res.status(404).json({ success: false, message: "Service not found" });
            }

            // logger.info(`Service updated: ${updatedService._id} by ${req.user.email}`);
            res.status(200).json({ success: true, data: updatedService, message: "Service updated successfully" });
        } catch (error) {
            next(error);
        }
    },
};