// PatientRecordDetailPage.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/api/api';
import { useCurrentUser } from '@/hooks/useAuth';
import { PrescriptionManagement } from '@/components/doctor/PrescriptionManagement';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, User, FileText } from 'lucide-react';
import { toast } from 'sonner';

// --- Schema và Types ---
const medicalRecordSchema = z.object({
    diagnosis: z.string().min(1, 'Chẩn đoán là bắt buộc'),
    symptoms: z.string().min(1, 'Triệu chứng là bắt buộc'),
    treatmentPlan: z.string().min(1, 'Kế hoạch điều trị là bắt buộc'),
    notes: z.string().optional(),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

interface PatientData {
    _id: string;
    firstName: string;
    lastName: string;
}

interface MedicalRecordData {
    _id: string;
    patientId: PatientData;
    doctorId: string;
    appointmentId: string;
    diagnosis: string;
    symptoms: string;
    treatmentPlan: string;
    notes?: string;
}

interface ApiError {
    response?: {
        status: number;
        data?: {
            message?: string;
        };
    };
}

// --- Component chính ---
const PatientRecordDetailPage = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');

    const { data: currentUserData } = useCurrentUser();
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecordData | null>(null);
    const [patientInfo, setPatientInfo] = useState<PatientData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const doctorInfo = {
        id: currentUserData?.user?._id || '',
        name: `${currentUserData?.user?.firstName} ${currentUserData?.user?.lastName}`
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<MedicalRecordFormValues>({
        resolver: zodResolver(medicalRecordSchema),
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!patientId || !appointmentId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            try {
                console.log("Fetching patient data for ID:", patientId);

                // 🔧 FIX: Thêm /api/v1 vào URL
                const patientResponse = await api.get(`/api/v1/users/${patientId}`);
                console.log("Patient Response:", patientResponse.data);

                if (patientResponse.data && patientResponse.data.user) {
                    setPatientInfo(patientResponse.data.user);
                } else {
                    throw new Error("Không tìm thấy thông tin bệnh nhân hoặc cấu trúc dữ liệu không đúng.");
                }

                // Bước 2: Thử lấy hồ sơ bệnh án. Lỗi 404 ở đây là bình thường.
                try {
                    // 🔧 FIX: Thêm /api/v1 vào URL
                    const recordResponse = await api.get(`/api/v1/medical-records/appointment/${appointmentId}`);
                    if (recordResponse.data && recordResponse.data.record) {
                        setMedicalRecord(recordResponse.data.record);
                        reset(recordResponse.data.record);
                    }
                } catch (recordError) {
                    const apiRecordError = recordError as ApiError;
                    if (apiRecordError.response && apiRecordError.response.status === 404) {
                        console.log("Chưa có hồ sơ bệnh án cho lịch hẹn này. Sẵn sàng tạo mới.");
                    } else {
                        throw recordError;
                    }
                }
            } catch (error) {
                console.error("Lỗi nghiêm trọng khi tải dữ liệu:", error);
                toast.error("Không thể tải dữ liệu trang.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [patientId, appointmentId, reset]);

    const onSubmit = async (data: MedicalRecordFormValues) => {
        if (!appointmentId) {
            toast.error("Thiếu thông tin lịch hẹn!");
            return;
        }
        try {
            // 🔧 FIX: Thêm /api/v1 vào URL
            const response = await api.post('/api/v1/medical-records', {
                ...data,
                patientId,
                doctorId: doctorInfo.id,
                appointmentId,
            });
            setMedicalRecord(response.data.record);
            toast.success("Đã lưu hồ sơ bệnh án thành công!");
        } catch (error) {
            console.error("Error saving medical record:", error);
            toast.error("Lỗi khi lưu hồ sơ bệnh án.");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <User className="h-10 w-10" />
                        <div>
                            <CardTitle className="text-2xl">Hồ sơ bệnh án</CardTitle>
                            <CardDescription>
                                Bệnh nhân: {patientInfo?.firstName || 'N/A'} {patientInfo?.lastName || ''}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label>Triệu chứng</label>
                            <Textarea {...register('symptoms')} placeholder="Bệnh nhân khai..." />
                            {errors.symptoms && <p className="text-red-500 text-sm">{errors.symptoms.message}</p>}
                        </div>
                        <div>
                            <label>Chẩn đoán</label>
                            <Textarea {...register('diagnosis')} placeholder="Chẩn đoán của bác sĩ..." />
                            {errors.diagnosis && <p className="text-red-500 text-sm">{errors.diagnosis.message}</p>}
                        </div>
                        <div>
                            <label>Kế hoạch điều trị</label>
                            <Textarea {...register('treatmentPlan')} placeholder="Các bước điều trị tiếp theo..." />
                            {errors.treatmentPlan && <p className="text-red-500 text-sm">{errors.treatmentPlan.message}</p>}
                        </div>
                        <div>
                            <label>Ghi chú thêm</label>
                            <Textarea {...register('notes')} placeholder="Ghi chú khác (nếu có)..." />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu Hồ sơ'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {medicalRecord ? (
                <PrescriptionManagement
                    medicalRecordId={medicalRecord._id}
                    patientId={patientId!}
                    doctorInfo={doctorInfo}
                />
            ) : (
                <Card className="text-center p-8 border-dashed">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium">Tạo và Lưu Hồ sơ Bệnh án</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Bạn cần lưu hồ sơ bệnh án trước khi có thể kê đơn thuốc.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default PatientRecordDetailPage;