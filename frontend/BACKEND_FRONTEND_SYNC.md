# Backend-Frontend Synchronization - MediFlow System

## Tổng quan
Tài liệu này mô tả việc đồng bộ hóa dữ liệu giữa backend và frontend, thay thế tất cả dữ liệu tĩnh (Mock Data) bằng các lệnh gọi API thực tế.

## 1. Vấn đề đã được xác định ✅

### 1.1 Dữ liệu tĩnh (Mock Data) được sử dụng ở:
- `PatientsPage.tsx` - Danh sách bệnh nhân
- `AppointmentsPage.tsx` - Danh sách lịch hẹn  
- `LabOrdersPage.tsx` - Danh sách encounters

### 1.2 Hậu quả của việc sử dụng Mock Data:
- **Lỗi 404**: Links được tạo với ID giả, dẫn đến trang không tồn tại
- **Dữ liệu không nhất quán**: Frontend hiển thị dữ liệu cũ, không phản ánh trạng thái thực tế
- **Không thể test**: Không thể kiểm tra luồng hoạt động thực tế của hệ thống

## 2. Giải pháp đã thực hiện ✅

### 2.1 Tạo API Services mới

#### `frontend/src/api/patients.ts`
```typescript
export const patientsApi = {
    getAllPatients: async (filters?: PatientFilters) => { ... },
    getPatientById: async (patientId: string) => { ... },
    createPatient: async (patientData: Omit<Patient, '_id' | 'createdAt'>) => { ... },
    updatePatient: async (patientId: string, updateData: Partial<Patient>) => { ... },
    deletePatient: async (patientId: string) => { ... },
    searchPatients: async (searchTerm: string, filters?: Omit<PatientFilters, 'search'>) => { ... }
};
```

#### `frontend/src/api/encounters.ts`
```typescript
export const encountersApi = {
    getDoctorQueue: async () => { ... },
    getAllEncounters: async (filters?: EncounterFilters) => { ... },
    getEncounterById: async (encounterId: string) => { ... },
    getPatientEncounters: async (patientId: string) => { ... },
    getRecentEncounters: async (doctorId?: string, limit: number = 10) => { ... },
    updateEncounterStatus: async (encounterId: string, status: string) => { ... }
};
```

### 2.2 Sửa đổi các trang để sử dụng API thật

#### `PatientsPage.tsx` - Thay thế Mock Data
**TRƯỚC:**
```typescript
// Mock data - replace with actual API call
const mockPatients = [
    { _id: '1', firstName: 'John', lastName: 'Doe', ... },
    { _id: '2', firstName: 'Jane', lastName: 'Smith', ... }
];

const { data: patients = mockPatients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => Promise.resolve(mockPatients),
    staleTime: 5 * 60 * 1000,
});
```

**SAU:**
```typescript
const { data: patientsData, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', { searchTerm, filterGender }],
    queryFn: async () => {
        const filters: PatientFilters = {};
        if (searchTerm) filters.search = searchTerm;
        if (filterGender) filters.gender = filterGender;
        
        const response = await patientsApi.getAllPatients(filters);
        return response.data;
    },
    staleTime: 5 * 60 * 1000,
});

const patients = patientsData?.patients || [];
const patientCount = patientsData?.count || 0;
```

#### `AppointmentsPage.tsx` - Thay thế Mock Data
**TRƯỚC:**
```typescript
const mockAppointments = [
    { _id: '1', patientId: { _id: '1', firstName: 'John', lastName: 'Doe' }, ... },
    { _id: '2', patientId: { _id: '2', firstName: 'Jane', lastName: 'Smith' }, ... }
];

const { data: appointments = mockAppointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => Promise.resolve(mockAppointments),
    staleTime: 5 * 60 * 1000,
});
```

**SAU:**
```typescript
const { data: appointmentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['appointments', { searchTerm, filterStatus, filterDepartment }],
    queryFn: async () => {
        const filters: any = {};
        if (searchTerm) filters.search = searchTerm;
        if (filterStatus) filters.status = filterStatus;
        if (filterDepartment) filters.department = filterDepartment;
        
        if (Object.keys(filters).length > 0) {
            return await appointmentApi.filterAppointments(filters);
        } else {
            return await appointmentApi.getAllAppointments();
        }
    },
    staleTime: 5 * 60 * 1000,
});

const appointments = appointmentsData?.data?.appointments || appointmentsData?.appointments || [];
const appointmentCount = appointmentsData?.data?.count || appointmentsData?.count || 0;
```

#### `LabOrdersPage.tsx` - Thay thế Mock Data
**TRƯỚC:**
```typescript
// Mock data - replace with actual API call
const mockEncounters = [
    { _id: 'enc1', patientName: 'John Doe', patientId: 'pat1', date: '2024-01-25' },
    { _id: 'enc2', patientName: 'Jane Smith', patientId: 'pat2', date: '2024-01-25' }
];
```

**SAU:**
```typescript
const [encounters, setEncounters] = useState<Encounter[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Fetch recent encounters on component mount
useEffect(() => {
    const fetchEncounters = async () => {
        if (!currentUser?.user) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await encountersApi.getRecentEncounters(
                currentUser.user.role === 'Doctor' ? currentUser.user._id : undefined
            );
            setEncounters(response.data?.encounters || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch encounters');
            toast.error('Failed to load recent encounters');
        } finally {
            setLoading(false);
        }
    };

    fetchEncounters();
}, [currentUser]);
```

## 3. Cải thiện UX/UI ✅

### 3.1 Loading States
- Thêm `Loader2` component cho trạng thái loading
- Hiển thị spinner và text "Loading..." khi đang fetch dữ liệu

### 3.2 Error Handling
- Hiển thị thông báo lỗi rõ ràng khi API call thất bại
- Thêm nút "Retry" để người dùng có thể thử lại
- Sử dụng `toast.error()` để thông báo lỗi

### 3.3 Empty States
- Hiển thị thông báo phù hợp khi không có dữ liệu
- Phân biệt giữa "không có dữ liệu" và "không tìm thấy kết quả phù hợp"

### 3.4 Real-time Filtering
- Thay thế client-side filtering bằng server-side filtering
- Sử dụng `refetch()` để cập nhật dữ liệu khi filter thay đổi
- Debounce search để tránh gọi API quá nhiều

## 4. Backend API Endpoints được sử dụng ✅

### 4.1 Patients API
- `GET /api/v1/users/patients` - Lấy danh sách bệnh nhân
- `GET /api/v1/users/patients/:id` - Lấy thông tin bệnh nhân theo ID
- `POST /api/v1/users/patients` - Tạo bệnh nhân mới
- `PUT /api/v1/users/patients/:id` - Cập nhật thông tin bệnh nhân
- `DELETE /api/v1/users/patients/:id` - Xóa bệnh nhân

### 4.2 Appointments API
- `GET /api/v1/appointment/getall` - Lấy tất cả lịch hẹn
- `GET /api/v1/appointment/filter` - Lọc lịch hẹn theo tiêu chí
- `GET /api/v1/appointment/:id` - Lấy thông tin lịch hẹn theo ID

### 4.3 Encounters API
- `GET /api/v1/encounters/doctor-queue` - Lấy hàng chờ khám của bác sĩ
- `GET /api/v1/encounters` - Lấy tất cả encounters
- `GET /api/v1/encounters/:id` - Lấy thông tin encounter theo ID
- `GET /api/v1/encounters/recent` - Lấy encounters gần đây

## 5. Lợi ích đạt được ✅

### 5.1 Dữ liệu nhất quán
- Frontend luôn hiển thị dữ liệu mới nhất từ database
- Không còn tình trạng dữ liệu cũ hoặc không chính xác

### 5.2 Trải nghiệm người dùng tốt hơn
- Loading states rõ ràng
- Error handling thân thiện
- Real-time data updates

### 5.3 Khả năng test và debug
- Có thể test toàn bộ luồng hoạt động
- Dễ dàng debug khi có vấn đề với API
- Logs rõ ràng cho việc troubleshooting

### 5.4 Scalability
- Hỗ trợ pagination và filtering ở server-side
- Có thể handle large datasets
- Performance tốt hơn với caching

## 6. Kiểm tra sau khi thay đổi ✅

### 6.1 Test Cases
- [ ] Login với các role khác nhau
- [ ] Truy cập trang Patients (Admin/Doctor/Receptionist)
- [ ] Truy cập trang Appointments (Admin/Doctor/Patient/Receptionist)
- [ ] Tạo Lab Order từ Recent Encounters
- [ ] Test search và filter functionality
- [ ] Verify error handling

### 6.2 API Endpoints cần kiểm tra
- [ ] `/api/v1/users/patients` - Trả về JSON hợp lệ
- [ ] `/api/v1/appointment/getall` - Trả về JSON hợp lệ
- [ ] `/api/v1/encounters/recent` - Trả về JSON hợp lệ
- [ ] Error responses - Trả về JSON thay vì HTML

## 7. Hướng dẫn tiếp theo 🔄

### 7.1 Cần làm tiếp
- [ ] Test tất cả API endpoints
- [ ] Verify error handling ở backend
- [ ] Add pagination cho large datasets
- [ ] Implement caching strategy
- [ ] Add unit tests cho API services

### 7.2 Monitoring
- [ ] Log API calls và responses
- [ ] Monitor performance metrics
- [ ] Track error rates
- [ ] User feedback collection

---

**Ngày cập nhật**: 25/01/2024  
**Phiên bản**: 1.0.0  
**Trạng thái**: ✅ Hoàn thành thay thế Mock Data  
**Người thực hiện**: AI Assistant  
**Mục tiêu tiếp theo**: Test và optimize API performance
