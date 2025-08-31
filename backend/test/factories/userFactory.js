/**
 * User Data Factory - Creates valid test users with proper validation
 * Ensures all required fields are properly formatted for schema validation
 */
const bcrypt = require('bcryptjs');

class UserFactory {
  /**
   * Create Doctor with all required fields
   */
  static async createDoctor(overrides = {}) {
    const baseData = {
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'doctor.test@hospital.com',
      password: await bcrypt.hash('TestPassword123!', 12),
      phone: '1234567890', // Exactly 10 digits
      gender: 'Male', // Capitalized as per enum
      dob: '1980-01-01',
      nic: '198012345678', // Exactly 12 digits
      address: '123 Medical Center Drive, Healthcare City',
      role: 'Doctor',
      specialization: 'General Medicine',
      department: 'Internal Medicine',
      verified: true,
      isActive: true,
      avatar: {
        public_id: 'sample_doctor_avatar',
        url: 'https://res.cloudinary.com/sample/image/upload/sample_avatar.jpg'
      }
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Create Patient with all required fields including NIC
   */
  static async createPatient(overrides = {}) {
    const baseData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'patient.test@hospital.com',
      password: await bcrypt.hash('TestPassword123!', 12),
      phone: '1234567891', // Exactly 10 digits
      gender: 'Female', // Capitalized as per enum
      dob: '1990-05-15',
      nic: '199012345679', // Exactly 12 digits - REQUIRED for patients
      address: '456 Patient Street, Wellness City',
      role: 'Patient',
      verified: true,
      isActive: true,
      emergencyContact: {
        name: 'John Doe',
        relationship: 'Spouse',
        phone: '1234567892'
      },
      medicalHistory: {
        allergies: ['None'],
        chronicConditions: [],
        previousSurgeries: [],
        familyHistory: 'No significant family history'
      },
      avatar: {
        public_id: 'sample_patient_avatar',
        url: 'https://res.cloudinary.com/sample/image/upload/sample_patient_avatar.jpg'
      }
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Create Receptionist with proper validation
   */
  static async createReceptionist(overrides = {}) {
    const baseData = {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'receptionist.test@hospital.com',
      password: await bcrypt.hash('TestPassword123!', 12),
      phone: '1234567893', // Exactly 10 digits
      gender: 'Female', // Capitalized as per enum
      dob: '1988-03-20',
      nic: '198812345680', // Exactly 12 digits
      address: '789 Reception Avenue, Admin City',
      role: 'Receptionist',
      verified: true,
      isActive: true,
      department: 'Front Desk',
      shift: 'Morning',
      avatar: {
        public_id: 'sample_receptionist_avatar',
        url: 'https://res.cloudinary.com/sample/image/upload/sample_receptionist_avatar.jpg'
      }
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Create Admin with full privileges
   */
  static async createAdmin(overrides = {}) {
    const baseData = {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin.test@hospital.com',
      password: await bcrypt.hash('AdminPassword123!', 12),
      phone: '1234567894', // Exactly 10 digits
      gender: 'Male', // Capitalized as per enum
      dob: '1975-01-01',
      nic: '197512345681', // Exactly 12 digits
      address: '999 Admin Boulevard, Management City',
      role: 'Admin',
      verified: true,
      isActive: true,
      permissions: ['all'],
      avatar: {
        public_id: 'sample_admin_avatar',
        url: 'https://res.cloudinary.com/sample/image/upload/sample_admin_avatar.jpg'
      }
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Create Nurse with department assignment
   */
  static async createNurse(overrides = {}) {
    const baseData = {
      firstName: 'Emily',
      lastName: 'Wilson',
      email: 'nurse.test@hospital.com',
      password: await bcrypt.hash('TestPassword123!', 12),
      phone: '1234567895', // Exactly 10 digits
      gender: 'Female', // Capitalized as per enum
      dob: '1985-07-10',
      nic: '198512345682', // Exactly 12 digits
      address: '321 Nursing Lane, Care City',
      role: 'Nurse',
      verified: true,
      isActive: true,
      department: 'General Ward',
      shift: 'Day',
      license: 'RN123456',
      avatar: {
        public_id: 'sample_nurse_avatar',
        url: 'https://res.cloudinary.com/sample/image/upload/sample_nurse_avatar.jpg'
      }
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Create Lab Technician
   */
  static async createLabTechnician(overrides = {}) {
    const baseData = {
      firstName: 'Michael',
      lastName: 'Lab',
      email: 'labtech.test@hospital.com',
      password: await bcrypt.hash('TestPassword123!', 12),
      phone: '1234567896', // Exactly 10 digits
      gender: 'Male', // Capitalized as per enum
      dob: '1987-09-25',
      nic: '198712345683', // Exactly 12 digits
      address: '654 Laboratory Road, Science City',
      role: 'LabTechnician',
      verified: true,
      isActive: true,
      department: 'Laboratory',
      certifications: ['Clinical Lab Technology'],
      avatar: {
        public_id: 'sample_labtech_avatar',
        url: 'https://res.cloudinary.com/sample/image/upload/sample_labtech_avatar.jpg'
      }
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Create Billing Staff
   */
  static async createBillingStaff(overrides = {}) {
    const baseData = {
      firstName: 'Robert',
      lastName: 'Finance',
      email: 'billing.test@hospital.com',
      password: await bcrypt.hash('TestPassword123!', 12),
      phone: '1234567897', // Exactly 10 digits
      gender: 'Male', // Capitalized as per enum
      dob: '1983-11-12',
      nic: '198312345684', // Exactly 12 digits
      address: '987 Billing Street, Finance City',
      role: 'BillingStaff',
      verified: true,
      isActive: true,
      department: 'Finance',
      accessLevel: 'billing_full',
      avatar: {
        public_id: 'sample_billing_avatar',
        url: 'https://res.cloudinary.com/sample/image/upload/sample_billing_avatar.jpg'
      }
    };

    return { ...baseData, ...overrides };
  }

  /**
   * Generate multiple users for load testing
   */
  static async createBulkUsers(count = 10, role = 'Patient') {
    const users = [];
    const createMethod = this[`create${role}`];

    if (!createMethod) {
      throw new Error(`Unknown role: ${role}`);
    }

    for (let i = 0; i < count; i++) {
      const userData = await createMethod({
        email: `${role.toLowerCase()}${i}@test.hospital.com`,
        phone: `${1234567900 + i}`.slice(0, 10),
        nic: `${198000000000 + i}`.slice(0, 12)
      });
      users.push(userData);
    }

    return users;
  }

  /**
   * Get valid login credentials for testing
   */
  static getLoginCredentials(role = 'Doctor') {
    const credentials = {
      Doctor: {
        email: 'doctor.test@hospital.com',
        password: 'TestPassword123!'
      },
      Patient: {
        email: 'patient.test@hospital.com',
        password: 'TestPassword123!'
      },
      Receptionist: {
        email: 'receptionist.test@hospital.com',
        password: 'TestPassword123!'
      },
      Admin: {
        email: 'admin.test@hospital.com',
        password: 'AdminPassword123!'
      },
      Nurse: {
        email: 'nurse.test@hospital.com',
        password: 'TestPassword123!'
      },
      LabTechnician: {
        email: 'labtech.test@hospital.com',
        password: 'TestPassword123!'
      },
      BillingStaff: {
        email: 'billing.test@hospital.com',
        password: 'TestPassword123!'
      }
    };

    return credentials[role] || credentials.Doctor;
  }
}

export default UserFactory;

module.exports = UserFactory;
