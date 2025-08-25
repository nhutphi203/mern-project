// backend/controllers/chatController.js - Hospital AI Assistant Controller

import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import { ErrorHandler } from '../middlewares/errorMiddleware.js';
import { User } from '../models/userScheme.js';

// Hospital knowledge base for public mode
const HOSPITAL_FAQ = {
    // Hospital Information
    "hospital_info": {
        name: "MediFlow Health Center",
        address: "123 Healthcare Avenue, Medical District",
        phone: "+1-555-HEALTH",
        email: "info@mediflow.com",
        website: "www.mediflow.com",
        established: "2020",
        specialties: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Emergency Medicine", "Radiology", "Laboratory Services"],
        emergency_contact: "+1-555-EMERGENCY"
    },

    // Common FAQs
    "faqs": [
        {
            "category": "Appointments",
            "questions": [
                {
                    "q": "How do I book an appointment?",
                    "a": "You can book an appointment by logging into your patient portal and selecting 'Book Appointment'. If you don't have an account, please register first."
                },
                {
                    "q": "Can I cancel or reschedule my appointment?",
                    "a": "Yes, you can cancel or reschedule your appointment up to 24 hours before your scheduled time through your patient portal."
                },
                {
                    "q": "What should I bring to my appointment?",
                    "a": "Please bring a valid ID, your insurance card, list of current medications, and any relevant medical records."
                }
            ]
        },
        {
            "category": "Visiting Hours",
            "questions": [
                {
                    "q": "What are the visiting hours?",
                    "a": "General visiting hours are 8:00 AM - 8:00 PM daily. ICU visiting hours are 2:00 PM - 4:00 PM and 6:00 PM - 8:00 PM."
                },
                {
                    "q": "How many visitors are allowed?",
                    "a": "Up to 2 visitors per patient at a time. For ICU patients, only 1 visitor is allowed."
                }
            ]
        },
        {
            "category": "Insurance",
            "questions": [
                {
                    "q": "What insurance plans do you accept?",
                    "a": "We accept most major insurance plans including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, Cigna, and UnitedHealth. Please contact our billing department to verify your specific plan."
                },
                {
                    "q": "Do I need a referral?",
                    "a": "This depends on your insurance plan. Contact your insurance provider or our staff to determine if you need a referral."
                }
            ]
        },
        {
            "category": "Services",
            "questions": [
                {
                    "q": "What medical services do you offer?",
                    "a": "We offer comprehensive medical services including emergency care, outpatient services, laboratory tests, radiology, surgery, and specialized care in cardiology, neurology, and orthopedics."
                },
                {
                    "q": "Do you have an emergency department?",
                    "a": "Yes, our emergency department is open 24/7. For life-threatening emergencies, call 911 or come directly to our emergency department."
                }
            ]
        }
    ],

    // Operating hours
    "hours": {
        "emergency": "24/7",
        "outpatient": "Monday-Friday: 7:00 AM - 6:00 PM, Saturday: 8:00 AM - 4:00 PM",
        "lab": "Monday-Friday: 6:00 AM - 10:00 PM, Saturday-Sunday: 8:00 AM - 6:00 PM",
        "pharmacy": "Monday-Friday: 8:00 AM - 8:00 PM, Saturday: 9:00 AM - 5:00 PM"
    }
};

// Role-based response templates
const ROLE_RESPONSES = {
    "Patient": {
        "greeting": "Hello! I'm your personal health assistant. I can help you with your appointments, test results, medical records, and bills.",
        "capabilities": [
            "View your upcoming appointments",
            "Check your test results",
            "Access your medical records",
            "Review your bills and invoices",
            "Book new appointments",
            "Contact your healthcare team"
        ]
    },
    "Doctor": {
        "greeting": "Welcome Doctor! I can assist you with patient management, medical records, schedules, and clinical decision support.",
        "capabilities": [
            "Access patient records and history",
            "Review your daily schedule",
            "View pending lab results",
            "Manage prescriptions and orders",
            "Clinical guidelines and protocols",
            "Patient communication tools"
        ]
    },
    "Admin": {
        "greeting": "Hello Administrator! I'm here to help with system oversight, reporting, and hospital management tasks.",
        "capabilities": [
            "Generate system reports",
            "Monitor user activities",
            "Manage hospital resources",
            "Financial analytics and billing",
            "Staff scheduling and management",
            "System configuration support"
        ]
    },
    "Nurse": {
        "greeting": "Hi Nurse! I can help you with patient care coordination, vital signs tracking, and care documentation.",
        "capabilities": [
            "Track patient vital signs",
            "Manage care plans",
            "Medication administration records",
            "Patient handoff communication",
            "Alert management",
            "Documentation assistance"
        ]
    }
};

/**
 * Public chat handler - No authentication required
 * Handles general hospital information, FAQs, and basic guidance
 */
export const handlePublicChat = catchAsyncErrors(async (req, res, next) => {
    const { message, intent } = req.body;
    const mode = req.query.mode || 'public';

    if (!message) {
        return next(new ErrorHandler('Message is required', 400));
    }

    // Block private queries in public mode
    if (mode !== 'public') {
        return next(new ErrorHandler('Private mode not allowed for public endpoint', 403));
    }

    // Log interaction for analytics
    console.log(`🤖 [Public Chat] Message: "${message}", Intent: ${intent || 'auto-detect'}`);

    try {
        // Only answer public FAQs, hospital info, appointment guidance
        const response = generatePublicResponse(message.toLowerCase(), intent);

        // Log the interaction
        await logChatInteraction({
            userType: 'public',
            message,
            intent: response.intent,
            response: response.message,
            timestamp: new Date()
        });

        res.status(200).json({
            success: true,
            data: {
                message: response.message,
                intent: response.intent,
                suggestions: response.suggestions || [],
                buttons: response.buttons || []
            }
        });

    } catch (error) {
        console.error('❌ [Public Chat] Error:', error);
        return next(new ErrorHandler('Failed to process chat request', 500));
    }
});

/**
 * Authenticated chat handler - Requires login and RBAC
 * Provides role-specific assistance and system integration
 */
export const handleAuthenticatedChat = catchAsyncErrors(async (req, res, next) => {
    const { message, intent } = req.body;
    const user = req.user;
    const mode = req.query.mode || 'private';
    const role = req.query.role || user?.role;

    if (!message) {
        return next(new ErrorHandler('Message is required', 400));
    }

    // Only allow private mode if authenticated
    if (mode !== 'private' || !user) {
        return next(new ErrorHandler('Authentication required for private chat', 401));
    }

    // Always check context before answering
    // If user asks for private info but mode is not private, block
    // (Handled above)

    // Log interaction for analytics
    console.log(`🤖 [Auth Chat] User: ${user.role} - ${user.email}, Message: "${message}"`);

    try {
        const response = await generateAuthenticatedResponse(message.toLowerCase(), intent, user);

        // Log the interaction
        await logChatInteraction({
            userId: user._id,
            userRole: user.role,
            userEmail: user.email,
            message,
            intent: response.intent,
            response: response.message,
            timestamp: new Date()
        });

        res.status(200).json({
            success: true,
            data: {
                message: response.message,
                intent: response.intent,
                suggestions: response.suggestions || [],
                buttons: response.buttons || [],
                contextualData: response.contextualData || null
            }
        });

    } catch (error) {
        console.error('❌ [Auth Chat] Error:', error);
        return next(new ErrorHandler('Failed to process chat request', 500));
    }
});

/**
 * Generate response for public (non-authenticated) users
 */
function generatePublicResponse(message, intent) {
    // Intent detection
    const detectedIntent = intent || detectIntent(message);

    switch (detectedIntent) {
        case 'hospital_info':
            return {
                intent: 'hospital_info',
                message: `Welcome to ${HOSPITAL_FAQ.hospital_info.name}! We're a comprehensive healthcare facility established in ${HOSPITAL_FAQ.hospital_info.established}. Our specialties include ${HOSPITAL_FAQ.hospital_info.specialties.slice(0, 3).join(', ')} and more. How can I help you today?`,
                suggestions: ['Visiting hours', 'Book appointment', 'Insurance questions', 'Emergency services'],
                buttons: [
                    { text: 'Login', action: 'navigate', path: '/login' },
                    { text: 'Register', action: 'navigate', path: '/register' }
                ]
            };

        case 'appointment_booking':
            return {
                intent: 'appointment_booking',
                message: "To book an appointment, you'll need to log in to your patient portal. If you don't have an account, please register first. Once logged in, you can view available time slots and book with your preferred doctor.",
                suggestions: ['How to register', 'Login help', 'Visiting hours'],
                buttons: [
                    { text: 'Login to Book', action: 'navigate', path: '/login' },
                    { text: 'Create Account', action: 'navigate', path: '/register' }
                ]
            };

        case 'visiting_hours':
            return {
                intent: 'visiting_hours',
                message: `Our visiting hours are:\n• General wards: ${HOSPITAL_FAQ.hours.outpatient}\n• Emergency: ${HOSPITAL_FAQ.hours.emergency}\n• Lab services: ${HOSPITAL_FAQ.hours.lab}\n\nUp to 2 visitors per patient at a time.`,
                suggestions: ['Hospital location', 'Parking information', 'Emergency services']
            };

        case 'insurance':
            const insuranceFaq = HOSPITAL_FAQ.faqs.find(f => f.category === 'Insurance');
            return {
                intent: 'insurance',
                message: "We accept most major insurance plans including Medicare, Medicaid, Blue Cross Blue Shield, Aetna, Cigna, and UnitedHealth. For specific coverage verification, please contact our billing department.",
                suggestions: ['Contact billing', 'Appointment booking', 'Services offered']
            };

        case 'emergency':
            return {
                intent: 'emergency',
                message: `🚨 For LIFE-THREATENING emergencies, call 911 immediately!\n\nOur Emergency Department is open 24/7 at ${HOSPITAL_FAQ.hospital_info.address}.\nEmergency contact: ${HOSPITAL_FAQ.hospital_info.emergency_contact}`,
                suggestions: ['Hospital location', 'Visiting hours']
            };

        case 'services':
            return {
                intent: 'services',
                message: `We offer comprehensive medical services including:\n• ${HOSPITAL_FAQ.hospital_info.specialties.slice(0, 5).join('\n• ')}\n\nAnd many more specialized services. For detailed information about a specific service, please ask!`,
                suggestions: ['Emergency services', 'Book appointment', 'Contact information']
            };

        case 'greeting':
            return {
                intent: 'greeting',
                message: `Hello! I'm the AI assistant for ${HOSPITAL_FAQ.hospital_info.name}. I can help you with hospital information, appointment booking, visiting hours, and answer common questions. How can I assist you today?`,
                suggestions: ['Hospital services', 'Book appointment', 'Visiting hours', 'Emergency info']
            };

        default:
            return {
                intent: 'general_help',
                message: "I'm here to help with hospital information, appointment booking, visiting hours, and general questions. For medical advice, please consult with our healthcare professionals. What would you like to know?",
                suggestions: ['Hospital services', 'Book appointment', 'Visiting hours', 'Contact info'],
                buttons: [
                    { text: 'Login', action: 'navigate', path: '/login' },
                    { text: 'Emergency Info', action: 'show_emergency_info' }
                ]
            };
    }
}

/**
 * Generate response for authenticated users based on their role
 */
async function generateAuthenticatedResponse(message, intent, user) {
    const userRole = user.role;
    const detectedIntent = intent || detectIntent(message);

    // Get role-specific greeting and capabilities
    const roleInfo = ROLE_RESPONSES[userRole] || ROLE_RESPONSES["Patient"];

    switch (detectedIntent) {
        case 'greeting':
            return {
                intent: 'greeting',
                message: `${roleInfo.greeting}\n\nI can help you with:\n• ${roleInfo.capabilities.slice(0, 3).join('\n• ')}`,
                suggestions: getRoleSuggestions(userRole),
                buttons: getRoleButtons(userRole)
            };

        case 'my_appointments':
            if (['Patient', 'Doctor'].includes(userRole)) {
                return {
                    intent: 'my_appointments',
                    message: `I can help you view your ${userRole === 'Patient' ? 'upcoming appointments' : 'patient schedule'}. Would you like me to show your appointments for today or this week?`,
                    suggestions: ['Today\'s appointments', 'This week', 'Book new appointment'],
                    buttons: [
                        { text: 'View Appointments', action: 'navigate', path: '/appointments' }
                    ]
                };
            }
            break;

        case 'medical_records':
            if (['Patient', 'Doctor', 'Admin'].includes(userRole)) {
                const message = userRole === 'Patient'
                    ? "I can help you access your medical records, test results, and health history."
                    : "I can help you access patient medical records and clinical data.";

                return {
                    intent: 'medical_records',
                    message,
                    suggestions: ['Recent test results', 'Medical history', 'Prescriptions'],
                    buttons: [
                        { text: 'View Records', action: 'navigate', path: userRole === 'Patient' ? '/medical-records/my-records' : '/medical-records' }
                    ]
                };
            }
            break;

        case 'billing':
            if (['Patient', 'Admin', 'Insurance Staff'].includes(userRole)) {
                const message = userRole === 'Patient'
                    ? "I can help you view your bills, payment history, and insurance information."
                    : "I can help you manage billing, generate reports, and handle insurance claims.";

                return {
                    intent: 'billing',
                    message,
                    suggestions: ['View invoices', 'Payment options', 'Insurance claims'],
                    buttons: [
                        { text: 'View Billing', action: 'navigate', path: userRole === 'Patient' ? '/billing/my-invoices' : '/billing/invoices' }
                    ]
                };
            }
            break;

        case 'lab_results':
            if (['Patient', 'Doctor', 'Lab Technician'].includes(userRole)) {
                const message = userRole === 'Patient'
                    ? "I can help you view your lab test results and reports."
                    : "I can help you manage lab orders, results, and patient reports.";

                return {
                    intent: 'lab_results',
                    message,
                    suggestions: ['Recent results', 'Pending tests', 'Lab reports'],
                    buttons: [
                        { text: 'View Lab Results', action: 'navigate', path: userRole === 'Patient' ? '/lab/results/my' : '/lab/results' }
                    ]
                };
            }
            break;

        case 'help':
            return {
                intent: 'help',
                message: `As a ${userRole}, I can help you with:\n• ${roleInfo.capabilities.join('\n• ')}\n\nWhat specific task would you like assistance with?`,
                suggestions: getRoleSuggestions(userRole),
                buttons: getRoleButtons(userRole)
            };

        default:
            return {
                intent: 'general_help',
                message: `I'm here to help you with your ${userRole.toLowerCase()} tasks. You can ask me about appointments, medical records, billing, or system navigation. What would you like to do?`,
                suggestions: getRoleSuggestions(userRole),
                buttons: getRoleButtons(userRole)
            };
    }

    // Fallback for unsupported combinations
    return {
        intent: 'unsupported',
        message: `I understand you're asking about "${detectedIntent}", but this feature isn't available for your role (${userRole}). Is there something else I can help you with?`,
        suggestions: getRoleSuggestions(userRole)
    };
}

/**
 * Simple intent detection based on keywords
 */
function detectIntent(message) {
    const lowerMessage = message.toLowerCase();

    // Greeting patterns
    if (/^(hello|hi|hey|good\s+(morning|afternoon|evening)|greetings)/.test(lowerMessage)) {
        return 'greeting';
    }

    // Appointment patterns
    if (/book|appointment|schedule|doctor|visit/.test(lowerMessage)) {
        return 'appointment_booking';
    }

    // Medical records patterns
    if (/medical\s+records?|health\s+records?|my\s+records?|patient\s+history/.test(lowerMessage)) {
        return 'medical_records';
    }

    // Lab results patterns
    if (/lab\s+results?|test\s+results?|blood\s+test|lab\s+report/.test(lowerMessage)) {
        return 'lab_results';
    }

    // Billing patterns
    if (/bill|invoice|payment|insurance|cost|charge/.test(lowerMessage)) {
        return 'billing';
    }

    // Emergency patterns
    if (/emergency|urgent|911|help\s+me|chest\s+pain/.test(lowerMessage)) {
        return 'emergency';
    }

    // Hospital info patterns
    if (/hospital|about|information|address|phone|contact/.test(lowerMessage)) {
        return 'hospital_info';
    }

    // Visiting hours patterns
    if (/visit|hours|when\s+open|operating\s+hours/.test(lowerMessage)) {
        return 'visiting_hours';
    }

    // Services patterns
    if (/services|departments|specialties|what\s+do\s+you/.test(lowerMessage)) {
        return 'services';
    }

    // Insurance patterns
    if (/insurance|coverage|medicaid|medicare/.test(lowerMessage)) {
        return 'insurance';
    }

    // My appointments patterns
    if (/my\s+appointments?|my\s+schedule|today|tomorrow/.test(lowerMessage)) {
        return 'my_appointments';
    }

    // Help patterns
    if (/help|assist|what\s+can\s+you|how\s+to/.test(lowerMessage)) {
        return 'help';
    }

    return 'general';
}

/**
 * Get role-specific suggestions
 */
function getRoleSuggestions(role) {
    const suggestions = {
        'Patient': ['My appointments', 'Test results', 'Medical records', 'View bills'],
        'Doctor': ['Patient schedule', 'Lab results', 'Medical records', 'Prescriptions'],
        'Admin': ['System reports', 'User management', 'Financial data', 'Hospital stats'],
        'Nurse': ['Patient care', 'Vital signs', 'Medication logs', 'Care plans'],
        'Lab Technician': ['Lab queue', 'Test results', 'Lab reports', 'Sample tracking'],
        'Receptionist': ['Appointments', 'Patient check-in', 'Billing', 'Insurance'],
        'Insurance Staff': ['Claims', 'Coverage', 'Billing reports', 'Patient insurance']
    };

    return suggestions[role] || suggestions['Patient'];
}

/**
 * Get role-specific action buttons
 */
function getRoleButtons(role) {
    const buttons = {
        'Patient': [
            { text: 'My Dashboard', action: 'navigate', path: '/dashboard' },
            { text: 'Book Appointment', action: 'navigate', path: '/book-appointment' }
        ],
        'Doctor': [
            { text: 'Doctor Dashboard', action: 'navigate', path: '/doctor-dashboard' },
            { text: 'Patient Records', action: 'navigate', path: '/medical-records' }
        ],
        'Admin': [
            { text: 'Admin Dashboard', action: 'navigate', path: '/admin-dashboard' },
            { text: 'System Reports', action: 'navigate', path: '/reports' }
        ],
        'Nurse': [
            { text: 'Nurse Dashboard', action: 'navigate', path: '/nurse-dashboard' },
            { text: 'Patient Care', action: 'navigate', path: '/patients' }
        ]
    };

    return buttons[role] || buttons['Patient'];
}

/**
 * Log chat interactions for analytics and improvement
 */
async function logChatInteraction(data) {
    try {
        // In a real implementation, you would save this to a dedicated chat logs collection
        console.log('📊 [Chat Analytics]', {
            timestamp: data.timestamp,
            userType: data.userType || 'authenticated',
            role: data.userRole,
            intent: data.intent,
            messageLength: data.message.length
        });

        // TODO: Implement actual logging to database
        // await ChatLog.create(data);

    } catch (error) {
        console.error('❌ Failed to log chat interaction:', error);
        // Don't throw error - logging failure shouldn't break chat functionality
    }
}

export default {
    handlePublicChat,
    handleAuthenticatedChat
};
