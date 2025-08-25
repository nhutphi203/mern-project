const mongoose = require('mongoose');

// Pre-loaded ICD-10 codes for quick search
const ICD10CodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String
    },
    keywords: [{
        type: String,
        index: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    usage_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'icd10codes'
});

// Full-text search index
ICD10CodeSchema.index({
    code: 'text',
    description: 'text',
    keywords: 'text'
});

// Static method for search with autocomplete
ICD10CodeSchema.statics.searchCodes = function (query, limit = 20) {
    const searchRegex = new RegExp(query, 'i');

    return this.find({
        $and: [
            { isActive: true },
            {
                $or: [
                    { code: searchRegex },
                    { description: searchRegex },
                    { keywords: { $in: [searchRegex] } }
                ]
            }
        ]
    })
        .sort({ usage_count: -1, code: 1 })
        .limit(limit)
        .select('code description category usage_count');
};

// Method to increment usage count
ICD10CodeSchema.methods.incrementUsage = function () {
    this.usage_count += 1;
    return this.save();
};

module.exports = mongoose.model('ICD10Code', ICD10CodeSchema);
