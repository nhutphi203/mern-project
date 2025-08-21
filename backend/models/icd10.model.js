// ICD-10 Diagnosis Code Model
import mongoose from 'mongoose';

const icd10Schema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
    fullDescription: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'A00-B99', // Infectious and parasitic diseases
            'C00-D49', // Neoplasms
            'D50-D89', // Blood and immune disorders
            'E00-E89', // Endocrine, nutritional and metabolic diseases
            'F01-F99', // Mental and behavioral disorders
            'G00-G99', // Nervous system diseases
            'H00-H59', // Eye and adnexa diseases
            'H60-H95', // Ear and mastoid process diseases
            'I00-I99', // Circulatory system diseases
            'J00-J99', // Respiratory system diseases
            'K00-K95', // Digestive system diseases
            'L00-L99', // Skin and subcutaneous tissue diseases
            'M00-M99', // Musculoskeletal system diseases
            'N00-N99', // Genitourinary system diseases
            'O00-O9A', // Pregnancy, childbirth and puerperium
            'P00-P96', // Perinatal conditions
            'Q00-Q99', // Congenital malformations
            'R00-R99', // Symptoms, signs and abnormal findings
            'S00-T88', // Injury, poisoning and external causes
            'V00-Y99', // External causes of morbidity
            'Z00-Z99'  // Health status and health services contact
        ]
    },
    chapterTitle: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Search-friendly fields
    searchTerms: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    commonUsage: {
        type: Number,
        default: 0 // Track how often this code is used
    },
    // Clinical context
    clinicalInfo: {
        symptoms: [String],
        commonTreatments: [String],
        relatedCodes: [String],
        severity: {
            type: String,
            enum: ['Mild', 'Moderate', 'Severe', 'Critical', 'Unknown'],
            default: 'Unknown'
        }
    }
}, {
    timestamps: true,
    collection: 'icd10codes'
});

// Text search index
icd10Schema.index({
    code: 'text',
    shortDescription: 'text',
    fullDescription: 'text',
    searchTerms: 'text'
});

// Compound indexes for efficient searching
icd10Schema.index({ category: 1, isActive: 1 });
icd10Schema.index({ commonUsage: -1 });

// Instance methods
icd10Schema.methods.incrementUsage = function () {
    this.commonUsage += 1;
    return this.save();
};

icd10Schema.methods.getRelatedCodes = async function () {
    return await this.constructor.find({
        code: { $in: this.clinicalInfo.relatedCodes },
        isActive: true
    }).select('code shortDescription');
};

// Static methods
icd10Schema.statics.searchDiagnosis = async function (searchTerm, limit = 20) {
    const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    return await this.find({
        $and: [
            { isActive: true },
            {
                $or: [
                    { code: searchRegex },
                    { shortDescription: searchRegex },
                    { fullDescription: searchRegex },
                    { searchTerms: { $in: [searchRegex] } }
                ]
            }
        ]
    })
        .sort({ commonUsage: -1, code: 1 })
        .limit(limit)
        .select('code shortDescription fullDescription category commonUsage');
};

icd10Schema.statics.getPopularCodes = async function (limit = 50) {
    return await this.find({ isActive: true })
        .sort({ commonUsage: -1 })
        .limit(limit)
        .select('code shortDescription commonUsage');
};

icd10Schema.statics.getByCategory = async function (category) {
    return await this.find({ category, isActive: true })
        .sort({ code: 1 })
        .select('code shortDescription fullDescription');
};

export const ICD10 = mongoose.model('ICD10', icd10Schema);
