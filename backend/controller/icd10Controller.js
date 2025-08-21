// ICD-10 Controller
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import { ICD10 } from '../models/icd10.model.js';

export const icd10Controller = {
    // Search ICD-10 codes
    searchCodes: catchAsyncErrors(async (req, res, next) => {
        const { q: searchTerm, limit = 20 } = req.query;

        if (!searchTerm || searchTerm.trim().length < 2) {
            return next(new ErrorHandler('Search term must be at least 2 characters', 400));
        }

        const codes = await ICD10.searchDiagnosis(searchTerm.trim(), parseInt(limit));

        res.status(200).json({
            success: true,
            count: codes.length,
            data: codes
        });
    }),

    // Get popular/frequently used codes
    getPopularCodes: catchAsyncErrors(async (req, res, next) => {
        const { limit = 50 } = req.query;

        const popularCodes = await ICD10.getPopularCodes(parseInt(limit));

        res.status(200).json({
            success: true,
            count: popularCodes.length,
            data: popularCodes
        });
    }),

    // Get codes by category
    getByCategory: catchAsyncErrors(async (req, res, next) => {
        const { category } = req.params;

        const codes = await ICD10.getByCategory(category);

        res.status(200).json({
            success: true,
            category,
            count: codes.length,
            data: codes
        });
    }),

    // Get all categories
    getCategories: catchAsyncErrors(async (req, res, next) => {
        const categories = [
            { code: 'A00-B99', title: 'Infectious and Parasitic Diseases' },
            { code: 'C00-D49', title: 'Neoplasms' },
            { code: 'D50-D89', title: 'Blood and Immune Disorders' },
            { code: 'E00-E89', title: 'Endocrine, Nutritional and Metabolic Diseases' },
            { code: 'F01-F99', title: 'Mental and Behavioral Disorders' },
            { code: 'G00-G99', title: 'Nervous System Diseases' },
            { code: 'H00-H59', title: 'Eye and Adnexa Diseases' },
            { code: 'H60-H95', title: 'Ear and Mastoid Process Diseases' },
            { code: 'I00-I99', title: 'Circulatory System Diseases' },
            { code: 'J00-J99', title: 'Respiratory System Diseases' },
            { code: 'K00-K95', title: 'Digestive System Diseases' },
            { code: 'L00-L99', title: 'Skin and Subcutaneous Tissue Diseases' },
            { code: 'M00-M99', title: 'Musculoskeletal System Diseases' },
            { code: 'N00-N99', title: 'Genitourinary System Diseases' },
            { code: 'O00-O9A', title: 'Pregnancy, Childbirth and Puerperium' },
            { code: 'P00-P96', title: 'Perinatal Conditions' },
            { code: 'Q00-Q99', title: 'Congenital Malformations' },
            { code: 'R00-R99', title: 'Symptoms, Signs and Abnormal Findings' },
            { code: 'S00-T88', title: 'Injury, Poisoning and External Causes' },
            { code: 'V00-Y99', title: 'External Causes of Morbidity' },
            { code: 'Z00-Z99', title: 'Health Status and Health Services Contact' }
        ];

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    }),

    // Get specific code details
    getCodeDetails: catchAsyncErrors(async (req, res, next) => {
        const { code } = req.params;

        const icd10Code = await ICD10.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!icd10Code) {
            return next(new ErrorHandler('ICD-10 code not found', 404));
        }

        // Increment usage count
        await icd10Code.incrementUsage();

        // Get related codes
        const relatedCodes = await icd10Code.getRelatedCodes();

        res.status(200).json({
            success: true,
            data: {
                ...icd10Code.toObject(),
                relatedCodes
            }
        });
    }),

    // Add new ICD-10 code (Admin only)
    createCode: catchAsyncErrors(async (req, res, next) => {
        const {
            code,
            shortDescription,
            fullDescription,
            category,
            chapterTitle,
            searchTerms,
            clinicalInfo
        } = req.body;

        // Check if code already exists
        const existingCode = await ICD10.findOne({ code: code.toUpperCase() });
        if (existingCode) {
            return next(new ErrorHandler('ICD-10 code already exists', 400));
        }

        const newCode = await ICD10.create({
            code: code.toUpperCase(),
            shortDescription,
            fullDescription,
            category,
            chapterTitle,
            searchTerms: searchTerms || [],
            clinicalInfo: clinicalInfo || {}
        });

        res.status(201).json({
            success: true,
            message: 'ICD-10 code created successfully',
            data: newCode
        });
    }),

    // Update ICD-10 code (Admin only)
    updateCode: catchAsyncErrors(async (req, res, next) => {
        const { code } = req.params;
        const updates = req.body;

        const icd10Code = await ICD10.findOneAndUpdate(
            { code: code.toUpperCase() },
            updates,
            { new: true, runValidators: true }
        );

        if (!icd10Code) {
            return next(new ErrorHandler('ICD-10 code not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'ICD-10 code updated successfully',
            data: icd10Code
        });
    }),

    // Get diagnosis statistics
    getStatistics: catchAsyncErrors(async (req, res, next) => {
        const stats = await ICD10.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalUsage: { $sum: '$commonUsage' },
                    avgUsage: { $avg: '$commonUsage' }
                }
            },
            { $sort: { totalUsage: -1 } }
        ]);

        const totalCodes = await ICD10.countDocuments({ isActive: true });
        const totalUsage = await ICD10.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: '$commonUsage' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCodes,
                totalUsage: totalUsage[0]?.total || 0,
                categoryBreakdown: stats
            }
        });
    })
};
