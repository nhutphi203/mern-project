import mongoose from 'mongoose';

const VitalSignsSchema = new mongoose.Schema({
    // Patient and Encounter References
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    encounterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encounter',
        index: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        index: true
    },

    // Core Vital Signs
    bloodPressure: {
        systolic: {
            type: Number,
            min: 50,
            max: 300,
            validate: {
                validator: function (v) {
                    return v == null || (v >= 50 && v <= 300);
                },
                message: 'Systolic pressure must be between 50-300 mmHg'
            }
        },
        diastolic: {
            type: Number,
            min: 30,
            max: 200,
            validate: {
                validator: function (v) {
                    return v == null || (v >= 30 && v <= 200);
                },
                message: 'Diastolic pressure must be between 30-200 mmHg'
            }
        },
        unit: {
            type: String,
            default: 'mmHg'
        }
    },

    heartRate: {
        value: {
            type: Number,
            min: 20,
            max: 250,
            validate: {
                validator: function (v) {
                    return v == null || (v >= 20 && v <= 250);
                },
                message: 'Heart rate must be between 20-250 bpm'
            }
        },
        unit: {
            type: String,
            default: 'bpm'
        }
    },

    temperature: {
        value: {
            type: Number,
            min: 30,
            max: 45,
            validate: {
                validator: function (v) {
                    return v == null || (v >= 30 && v <= 45);
                },
                message: 'Temperature must be between 30-45°C'
            }
        },
        unit: {
            type: String,
            enum: ['Celsius', 'Fahrenheit'],
            default: 'Celsius'
        }
    },

    respiratoryRate: {
        value: {
            type: Number,
            min: 5,
            max: 60,
            validate: {
                validator: function (v) {
                    return v == null || (v >= 5 && v <= 60);
                },
                message: 'Respiratory rate must be between 5-60 breaths/min'
            }
        },
        unit: {
            type: String,
            default: 'breaths/min'
        }
    },

    oxygenSaturation: {
        value: {
            type: Number,
            min: 50,
            max: 100,
            validate: {
                validator: function (v) {
                    return v == null || (v >= 50 && v <= 100);
                },
                message: 'Oxygen saturation must be between 50-100%'
            }
        },
        unit: {
            type: String,
            default: '%'
        }
    },

    painScale: {
        value: {
            type: Number,
            min: 0,
            max: 10,
            validate: {
                validator: function (v) {
                    return v == null || (Number.isInteger(v) && v >= 0 && v <= 10);
                },
                message: 'Pain scale must be integer between 0-10'
            }
        },
        description: {
            type: String,
            enum: ['No Pain', 'Mild', 'Moderate', 'Severe', 'Very Severe', 'Worst Possible']
        }
    },

    // Physical Measurements
    height: {
        value: {
            type: Number,
            min: 30,
            max: 300,
            validate: {
                validator: function (v) {
                    return v == null || (v >= 30 && v <= 300);
                },
                message: 'Height must be between 30-300 cm'
            }
        },
        unit: {
            type: String,
            enum: ['cm', 'ft'],
            default: 'cm'
        }
    },

    weight: {
        value: {
            type: Number,
            min: 1,
            max: 500,
            validate: {
                validator: function (v) {
                    return v == null || (v >= 1 && v <= 500);
                },
                message: 'Weight must be between 1-500 kg'
            }
        },
        unit: {
            type: String,
            enum: ['kg', 'lbs'],
            default: 'kg'
        }
    },

    // Auto-calculated BMI
    bmi: {
        value: {
            type: Number,
            min: 10,
            max: 100
        },
        category: {
            type: String,
            enum: ['Underweight', 'Normal', 'Overweight', 'Obese Class I', 'Obese Class II', 'Obese Class III']
        }
    },

    // Blood Glucose
    glucose: {
        value: {
            type: Number,
            min: 20,
            max: 600,
            validate: {
                validator: function (v) {
                    return v == null || (v >= 20 && v <= 600);
                },
                message: 'Glucose must be between 20-600 mg/dL'
            }
        },
        unit: {
            type: String,
            enum: ['mg/dL', 'mmol/L'],
            default: 'mg/dL'
        },
        testType: {
            type: String,
            enum: ['Random', 'Fasting', 'Post-meal', 'HbA1c'],
            default: 'Random'
        }
    },

    // Clinical Context
    measuredAt: {
        type: Date,
        default: Date.now,
        required: true,
        index: true
    },

    measuredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    location: {
        type: String,
        enum: ['Ward', 'ICU', 'Emergency', 'Outpatient', 'Operating Room', 'Recovery'],
        default: 'Outpatient'
    },

    method: {
        type: String,
        enum: ['Manual', 'Automatic', 'Electronic Monitor'],
        default: 'Manual'
    },

    notes: {
        type: String,
        maxlength: 500
    },

    // Alerting System
    alerts: [{
        type: {
            type: String,
            enum: ['Critical', 'High', 'Low', 'Abnormal'],
            required: true
        },
        parameter: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        threshold: {
            type: String,
            required: true
        },
        severity: {
            type: String,
            enum: ['Critical', 'High', 'Medium', 'Low'],
            default: 'Medium'
        },
        acknowledged: {
            type: Boolean,
            default: false
        },
        acknowledgedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        acknowledgedAt: {
            type: Date
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Data Quality
    verified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'vitalsigns'
});

// Indexes for performance
VitalSignsSchema.index({ patientId: 1, measuredAt: -1 });
VitalSignsSchema.index({ encounterId: 1, measuredAt: -1 });
VitalSignsSchema.index({ measuredAt: -1 });
VitalSignsSchema.index({ 'alerts.acknowledged': 1, 'alerts.severity': 1 });

// Virtual for display
VitalSignsSchema.virtual('bloodPressureDisplay').get(function () {
    if (this.bloodPressure && this.bloodPressure.systolic && this.bloodPressure.diastolic) {
        return `${this.bloodPressure.systolic}/${this.bloodPressure.diastolic} ${this.bloodPressure.unit}`;
    }
    return null;
});

// Auto-calculate BMI
VitalSignsSchema.pre('save', function (next) {
    if (this.height?.value && this.weight?.value) {
        // Convert to metric if needed
        let heightM = this.height.value;
        let weightKg = this.weight.value;

        if (this.height.unit === 'ft') {
            heightM = this.height.value * 30.48; // ft to cm
        }
        heightM = heightM / 100; // cm to meters

        if (this.weight.unit === 'lbs') {
            weightKg = this.weight.value * 0.453592; // lbs to kg
        }

        // Calculate BMI
        const bmiValue = weightKg / (heightM * heightM);
        this.bmi = this.bmi || {};
        this.bmi.value = Math.round(bmiValue * 10) / 10;

        // Categorize BMI
        if (bmiValue < 18.5) {
            this.bmi.category = 'Underweight';
        } else if (bmiValue < 25) {
            this.bmi.category = 'Normal';
        } else if (bmiValue < 30) {
            this.bmi.category = 'Overweight';
        } else if (bmiValue < 35) {
            this.bmi.category = 'Obese Class I';
        } else if (bmiValue < 40) {
            this.bmi.category = 'Obese Class II';
        } else {
            this.bmi.category = 'Obese Class III';
        }
    }
    next();
});

// Alert generation for abnormal values
VitalSignsSchema.pre('save', function (next) {
    this.alerts = this.alerts || [];

    // Blood Pressure Alerts
    if (this.bloodPressure?.systolic && this.bloodPressure?.diastolic) {
        const sys = this.bloodPressure.systolic;
        const dia = this.bloodPressure.diastolic;

        if (sys >= 180 || dia >= 120) {
            this.alerts.push({
                type: 'Critical',
                parameter: 'Blood Pressure',
                value: sys,
                threshold: 'Hypertensive Crisis (≥180/120)',
                severity: 'Critical'
            });
        } else if (sys >= 140 || dia >= 90) {
            this.alerts.push({
                type: 'High',
                parameter: 'Blood Pressure',
                value: sys,
                threshold: 'Hypertension (≥140/90)',
                severity: 'High'
            });
        } else if (sys < 90 || dia < 60) {
            this.alerts.push({
                type: 'Low',
                parameter: 'Blood Pressure',
                value: sys,
                threshold: 'Hypotension (<90/60)',
                severity: 'Medium'
            });
        }
    }

    // Heart Rate Alerts
    if (this.heartRate?.value) {
        const hr = this.heartRate.value;
        if (hr > 100) {
            this.alerts.push({
                type: 'High',
                parameter: 'Heart Rate',
                value: hr,
                threshold: 'Tachycardia (>100 bpm)',
                severity: hr > 120 ? 'High' : 'Medium'
            });
        } else if (hr < 60) {
            this.alerts.push({
                type: 'Low',
                parameter: 'Heart Rate',
                value: hr,
                threshold: 'Bradycardia (<60 bpm)',
                severity: hr < 50 ? 'High' : 'Medium'
            });
        }
    }

    // Temperature Alerts
    if (this.temperature?.value) {
        const temp = this.temperature.value;
        const tempC = this.temperature.unit === 'Fahrenheit' ? (temp - 32) * 5 / 9 : temp;

        if (tempC >= 39) {
            this.alerts.push({
                type: 'High',
                parameter: 'Temperature',
                value: temp,
                threshold: 'High Fever (≥39°C)',
                severity: 'High'
            });
        } else if (tempC >= 38) {
            this.alerts.push({
                type: 'High',
                parameter: 'Temperature',
                value: temp,
                threshold: 'Fever (≥38°C)',
                severity: 'Medium'
            });
        } else if (tempC < 36) {
            this.alerts.push({
                type: 'Low',
                parameter: 'Temperature',
                value: temp,
                threshold: 'Hypothermia (<36°C)',
                severity: 'High'
            });
        }
    }

    // Oxygen Saturation Alerts
    if (this.oxygenSaturation?.value) {
        const o2 = this.oxygenSaturation.value;
        if (o2 < 90) {
            this.alerts.push({
                type: 'Critical',
                parameter: 'Oxygen Saturation',
                value: o2,
                threshold: 'Critical Hypoxemia (<90%)',
                severity: 'Critical'
            });
        } else if (o2 < 95) {
            this.alerts.push({
                type: 'Low',
                parameter: 'Oxygen Saturation',
                value: o2,
                threshold: 'Mild Hypoxemia (<95%)',
                severity: 'Medium'
            });
        }
    }

    next();
});

// Instance method to acknowledge alerts
VitalSignsSchema.methods.acknowledgeAlert = function (alertId, userId) {
    const alert = this.alerts.id(alertId);
    if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date();
        return this.save();
    }
    throw new Error('Alert not found');
};

// Static method to get trends
VitalSignsSchema.statics.getTrends = function (patientId, parameter, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
        {
            $match: {
                patientId: new mongoose.Types.ObjectId(patientId),
                measuredAt: { $gte: startDate }
            }
        },
        {
            $sort: { measuredAt: 1 }
        },
        {
            $project: {
                measuredAt: 1,
                [parameter]: 1
            }
        }
    ];

    return this.aggregate(pipeline);
};

export const VitalSigns = mongoose.model('VitalSigns', VitalSignsSchema);
