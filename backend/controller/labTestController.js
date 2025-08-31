import LabTest from '../models/labTest.model.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js'; // FIX: Add proper error handling

export const labTestController = {
    // FIX: Standardize response format to match labController
    getAllLabTests: catchAsyncErrors(async (req, res, next) => {
        try {
            const { category, search } = req.query; // FIX: Add query parameter support

            let filter = { isActive: true }; // FIX: Only return active tests

            if (category) {
                filter.category = category;
            }

            if (search) {
                filter.$text = { $search: search };
            }

            const labTests = await LabTest.find(filter).sort({ category: 1, testName: 1 });

            // FIX: Use consistent response format with labController
            return res.status(200).json({
                success: true,
                tests: labTests, // FIX: Changed from 'data' to 'tests' for consistency
                count: labTests.length
            });
        } catch (error) {
            console.error('Error fetching lab tests:', error); // FIX: Better error logging
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch lab tests',
                code: 'FETCH_ERROR' // FIX: Add error code for better frontend handling
            });
        }
    }),
};