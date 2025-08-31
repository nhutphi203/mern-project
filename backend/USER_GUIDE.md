# 🏥 Medical Record System - User Guide

## 👥 **Hướng Dẫn Thao Tác Cho Từng Loại Người Dùng**

### 🩺 **DOCTOR (Bác Sĩ) - Quyền Cao Nhất**

#### **1. Tạo Medical Record Mới**
```javascript
// POST /api/v1/medical-records/enhanced
{
  "patientId": "patient_id_here",
  "clinicalAssessment": {
    "chiefComplaint": "Đau ngực khi gắng sức",
    "historyOfPresentIllness": "Bệnh nhân than phiền đau ngực từ 2 tuần nay...",
    "physicalExam": {
      "vitalSigns": {
        "bloodPressure": "140/90",
        "heartRate": 85,
        "temperature": 37.0
      }
    }
  },
  "diagnoses": [{
    "icd10Code": "I25.9",
    "icd10Description": "Chronic ischemic heart disease",
    "diagnosisType": "Primary",
    "severity": "Moderate"
  }],
  "treatmentPlans": [{
    "planName": "Cardiac Management",
    "planType": "Medication",
    "description": "ACE inhibitor và beta blocker"
  }]
}
```

#### **2. Tìm Kiếm ICD-10 Codes**
```javascript
// GET /api/v1/icd10/search?query=diabetes
// Trả về danh sách mã ICD-10 liên quan đến diabetes
```

#### **3. Tạo CPOE Orders**
```javascript
// POST /api/v1/cpoe/orders
{
  "patientId": "patient_id_here",
  "orderType": "Medication",
  "medicationOrder": {
    "medicationName": "Metformin",
    "dosage": "500mg",
    "frequency": "BID",
    "route": "Oral",
    "duration": "3 months"
  },
  "priority": "Routine"
}
```

---

### 👩‍⚕️ **NURSE (Y Tá) - Thực Thi Chăm Sóc**

#### **1. Xem Medical Records Để Chăm Sóc**
```javascript
// GET /api/v1/medical-records/enhanced
// Có thể xem records để coordinate care
```

#### **2. Thực Thi CPOE Orders**
```javascript
// PUT /api/v1/cpoe/orders/{orderId}/execute
{
  "executionNotes": "Đã cho thuốc lúc 8:00 AM",
  "executedBy": "nurse_id_here"
}
```

#### **3. Cập Nhật Nursing Assessment**
```javascript
// POST /api/v1/medical-records/{recordId}/nursing-notes
{
  "noteType": "Nursing Assessment",
  "content": "Vital signs stable, patient comfortable",
  "vitalSigns": {
    "bloodPressure": "120/80",
    "heartRate": 72,
    "temperature": 36.8
  }
}
```

---

### 👨‍💼 **ADMIN (Quản Trị Viên) - Quản Lý Hệ Thống**

#### **1. Xem Thống Kê ICD-10**
```javascript
// GET /api/v1/icd10/statistics
// Trả về thống kê usage của diagnosis codes
```

#### **2. Quản Lý CPOE Orders**
```javascript
// GET /api/v1/cpoe/statistics
// Xem thống kê orders theo loại, status, doctor
```

#### **3. Quản Lý Medical Records**
```javascript
// GET /api/v1/medical-records/statistics
// Thống kê records theo department, diagnosis
```

---

### 👤 **PATIENT (Bệnh Nhân) - Xem Thông Tin Cá Nhân**

#### **1. Xem Medical Records Của Mình**
```javascript
// GET /api/v1/medical-records/patient/mine
// Chỉ xem được records của chính mình
```

#### **2. Xem CPOE Orders Của Mình**
```javascript
// GET /api/v1/cpoe/orders/mine
// Xem đơn thuốc và orders đã được kê
```

#### **❌ Không Được Phép:**
- Tìm kiếm ICD-10 codes
- Tạo medical records
- Xem records của bệnh nhân khác

---

## 🔐 **Authentication & Authorization**

### **1. Login Process**
```javascript
// POST /api/v1/login
{
  "email": "doctor@hospital.com",
  "password": "password123"
}
// Trả về JWT token
```

### **2. Sử Dụng Token**
```javascript
// Headers cho mọi request
{
  "Authorization": "Bearer <your_jwt_token>",
  "Content-Type": "application/json"
}
```

### **3. Test Users Có Sẵn**
```javascript
const testUsers = {
  doctor: "doctor@hospital.com / password123",
  nurse: "nurse@hospital.com / password123", 
  admin: "admin@hospital.com / password123",
  patient: "patient@hospital.com / password123"
};
```

---

## 📊 **Dữ Liệu Test Có Sẵn**

### **ICD-10 Diagnosis Codes (20+ codes)**
- **E11.9**: Type 2 diabetes mellitus without complications
- **I10**: Essential (primary) hypertension  
- **J06.9**: Acute upper respiratory infection
- **I25.9**: Chronic ischemic heart disease
- **K21.9**: Gastro-esophageal reflux disease
- **F32.9**: Major depressive disorder, single episode

### **Medical Records (3 patients)**
1. **Diabetes Patient**: E11.9 + I10, on Metformin + Lisinopril
2. **Cardiac Patient**: I10 + I25.9, chest pain evaluation  
3. **Respiratory Patient**: J06.9 + R50.9, pneumonia treatment

### **CPOE Orders (9+ orders)**
- **Medications**: Metformin, Lisinopril, Antibiotics
- **Labs**: CMP, HbA1c, CBC
- **Imaging**: Chest X-ray, ECG
- **Procedures**: Blood glucose monitoring, Vital signs

---

## 🧪 **Testing Workflow**

### **1. Frontend Testing (Postman/Browser)**
```bash
# Base URL
http://localhost:4000/api/v1

# Test sequence:
1. POST /login (get token)
2. GET /icd10/search?query=diabetes (Doctor only)
3. GET /medical-records/enhanced (Doctor/Nurse)
4. POST /cpoe/orders (Doctor only)
5. GET /cpoe/orders (Doctor/Nurse)
```

### **2. Role-Based Access Testing**
```javascript
// Doctor access (should work)
GET /icd10/search?query=diabetes
GET /cpoe/statistics

// Patient access (should fail)  
GET /icd10/search?query=diabetes  // 403 Forbidden
GET /cpoe/statistics              // 403 Forbidden

// Patient access (should work)
GET /medical-records/patient/mine // Own records only
```

---

## 🚨 **Clinical Safety Features**

### **1. Drug Interaction Checking**
```javascript
// POST /api/v1/cpoe/check-interactions
{
  "medications": ["Warfarin", "Aspirin"],
  "patientId": "patient_id_here"
}
// Trả về warnings về drug interactions
```

### **2. Allergy Alerts**
```javascript
// POST /api/v1/cpoe/check-allergies
{
  "medication": "Penicillin",
  "patientId": "patient_id_here"  
}
// Check patient allergies trước khi prescribe
```

### **3. Dosage Validation**
```javascript
// Automatic trong CPOE system
// Check appropriate dosage for age, weight, condition
```

---

## 📱 **Frontend Integration Examples**

### **React Component - Doctor Dashboard**
```jsx
const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Load patient medical records
  const loadMedicalRecords = async (patientId) => {
    const response = await fetch(`/api/v1/medical-records/patient/${patientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setSelectedPatient(data.medicalRecords);
  };
  
  // Create new diagnosis
  const addDiagnosis = async (diagnosis) => {
    await fetch('/api/v1/medical-records/enhanced', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(diagnosis)
    });
  };
};
```

### **React Component - ICD-10 Search**
```jsx
const ICD10Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const searchICD10 = async () => {
    const response = await fetch(`/api/v1/icd10/search?query=${searchQuery}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setResults(data.data);
  };
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search diagnosis codes..."
      />
      <button onClick={searchICD10}>Search</button>
      {results.map(code => (
        <div key={code._id}>
          <strong>{code.code}</strong>: {code.description}
        </div>
      ))}
    </div>
  );
};
```

---

## 🔧 **Troubleshooting**

### **Common Issues**
```bash
# 401 Unauthorized
Problem: Missing or invalid token
Solution: Re-login and get new JWT token

# 403 Forbidden  
Problem: Insufficient role permissions
Solution: Check user role matches endpoint requirements

# 404 Not Found
Problem: Invalid endpoint or resource ID
Solution: Verify API routes and resource existence

# 500 Server Error
Problem: Database connection or validation error  
Solution: Check server logs and data format
```

### **Data Validation**
```javascript
// ICD-10 codes must be uppercase
"icd10Code": "E11.9" ✅
"icd10Code": "e11.9" ❌

// Required fields for medical records
{
  "patientId": "required",
  "clinicalAssessment": "required", 
  "diagnoses": "required array"
}
```

---

## 📈 **Performance Tips**

### **1. Pagination**
```javascript
// GET /api/v1/medical-records/enhanced?page=1&limit=10
// Use pagination for large datasets
```

### **2. Filtering**
```javascript
// GET /api/v1/cpoe/orders?status=Active&orderType=Medication
// Filter results to reduce payload
```

### **3. Caching**
```javascript
// ICD-10 codes rarely change - cache on frontend
// Medical records update frequently - always fetch fresh
```

---

**🎯 Summary: System hỗ trợ đầy đủ clinical workflow với role-based access, safety checks, và comprehensive medical record management!** 
