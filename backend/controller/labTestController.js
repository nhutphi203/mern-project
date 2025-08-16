import LabTest from '../models/labTest.model.js';

export const labTestController = {
    // Hàm để lấy tất cả các xét nghiệm khả dụng
    getAllLabTests: async (req, res) => {
        try {
            const labTests = await LabTest.find();
            return res.status(200).json({ success: true, data: labTests });
        } catch (error) {
            console.log('Lỗi khi lấy tất cả xét nghiệm', error);
            return res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },
};